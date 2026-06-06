import RoutePointView from '../view/point-view.js';
import EditFormView from '../view/edit-form-view.js';
import { render, replace, remove } from '../framework/render.js';

export default class PointPresenter {
  #pointComponent = null;
  #editFormComponent = null;
  #point = null;
  #destinations = null;
  #offers = null;
  #container = null;
  #handleDataChange = null;
  #handleModeChange = null;
  #isEditFormOpen = false;
  #isNewPoint = false;
  #isSaving = false;

  constructor({ container, onDataChange, onModeChange }) {
    this.#container = container;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  init(point, destinations, offers, isNewPoint = false) {
    this.#point = point;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#isNewPoint = isNewPoint;
    this.#isSaving = false;

    this.#createComponents();
    this.#setHandlers();

    if (this.#isNewPoint) {
      render(this.#editFormComponent, this.#container);
      this.#isEditFormOpen = true;
      this.#editFormComponent.setFocus();
    } else {
      render(this.#pointComponent, this.#container);
    }
  }

  update(point) {
    this.#point = point;

    const oldPointComponent = this.#pointComponent;

    this.#pointComponent = new RoutePointView({
      point: this.#point,
      destination: this.#getDestination(),
      offers: this.#getPointOffers(),
    });

    this.#setPointHandlers();

    if (oldPointComponent && oldPointComponent.element.parentElement) {
      replace(this.#pointComponent, oldPointComponent);
    } else {
      render(this.#pointComponent, this.#container);
    }
    remove(oldPointComponent);
  }

  destroy() {
    if (this.#pointComponent) {
      remove(this.#pointComponent);
    }
    if (this.#editFormComponent) {
      remove(this.#editFormComponent);
      this.#editFormComponent.removeEscKeyHandler();
    }
  }

  resetView() {
    if (this.#editFormComponent && this.#isEditFormOpen && !this.#isNewPoint) {
      this.#replaceFormToPoint();
    }
  }

  #createComponents() {
    this.#pointComponent = new RoutePointView({
      point: this.#point,
      destination: this.#getDestination(),
      offers: this.#getPointOffers(),
    });

    this.#editFormComponent = new EditFormView({
      point: this.#point,
      destinations: this.#destinations,
      offers: this.#offers,
      isNewPoint: this.#isNewPoint,
    });
  }

  #setHandlers() {
    this.#setPointHandlers();
    this.#setFormHandlers();
  }

  #setPointHandlers() {
    this.#pointComponent.setEditClickHandler(() => {
      this.#replacePointToForm();
    });

    this.#pointComponent.setFavoriteClickHandler(async () => {
      const updatedPoint = {
        ...this.#point,
        isFavorite: !this.#point.isFavorite,
      };

      try {
        await this.#handleDataChange(updatedPoint, 'update');
      } catch {
        this.#pointComponent.shake();
      }
    });
  }

  #validatePoint(point) {
    if (!point.destination || point.destination === '') {
      return false;
    }

    if (new Date(point.dateTo) < new Date(point.dateFrom)) {
      return false;
    }

    if (point.basePrice < 0) {
      return false;
    }

    if (!point.type) {
      return false;
    }

    return true;
  }

  #getOffersIds(offersTitles, pointType) {
    const offersForType = this.#offers[pointType] || [];
    return offersTitles
      .map((offerTitle) => {
        const offer = offersForType.find((o) => o.title === offerTitle);
        return offer ? offer.id : null;
      })
      .filter((id) => id !== null);
  }

  #setFormHandlers() {
    this.#editFormComponent.setSubmitHandler(async (updatedPoint) => {
      if (this.#isSaving) {
        return;
      }

      if (!this.#validatePoint(updatedPoint)) {
        this.#editFormComponent.shake();
        return;
      }

      this.#isSaving = true;
      this.#setButtonsDisabled(true);

      try {
        if (this.#isNewPoint) {
          // Преобразуем названия опций в ID
          const offerIds = this.#getOffersIds(
            updatedPoint.offers || [],
            updatedPoint.type
          );

          const newPoint = {
            id: null,
            type: updatedPoint.type || 'flight',
            destination: updatedPoint.destination, // Отправляем ID города
            dateFrom: updatedPoint.dateFrom || new Date(),
            dateTo: updatedPoint.dateTo || new Date(),
            basePrice: updatedPoint.basePrice || 0,
            offers: offerIds,
            isFavorite: updatedPoint.isFavorite || false,
          };
          await this.#handleDataChange(newPoint, 'add');
        } else {
          await this.#handleDataChange(updatedPoint, 'update');
        }
        this.#destroy();
      } catch (err) {
        this.#setButtonsDisabled(false);
        this.#editFormComponent.shake();
        this.#isSaving = false;
      }
    });

    this.#editFormComponent.setDeleteHandler(async () => {
      if (this.#isSaving) {
        return;
      }

      this.#isSaving = true;
      this.#setButtonsDisabled(true);

      try {
        if (this.#isNewPoint) {
          this.#destroy();
        } else {
          await this.#handleDataChange(this.#point.id, 'delete');
        }
      } catch (err) {
        this.#setButtonsDisabled(false);
        this.#editFormComponent.shake();
        this.#isSaving = false;
      }
    });

    this.#editFormComponent.setRollupClickHandler(() => {
      if (this.#isNewPoint) {
        this.#destroy();
      } else {
        this.#replaceFormToPoint();
      }
    });

    this.#editFormComponent.setEscKeyHandler(() => {
      if (this.#isNewPoint) {
        this.#destroy();
      } else {
        this.#replaceFormToPoint();
      }
    });
  }

  #setButtonsDisabled(isDisabled) {
    const saveBtn = this.#editFormComponent.element.querySelector(
      '.event__save-btn'
    );
    const deleteBtn = this.#editFormComponent.element.querySelector(
      '.event__reset-btn'
    );

    if (saveBtn) {
      saveBtn.disabled = isDisabled;
      saveBtn.textContent = isDisabled ? 'Saving...' : 'Save';
    }
    if (deleteBtn && !this.#isNewPoint) {
      deleteBtn.disabled = isDisabled;
      deleteBtn.textContent = isDisabled ? 'Deleting...' : 'Delete';
    }
  }

  #destroy() {
    if (this.#pointComponent) {
      remove(this.#pointComponent);
    }
    if (this.#editFormComponent) {
      remove(this.#editFormComponent);
      this.#editFormComponent.removeEscKeyHandler();
    }
    if (this.#isNewPoint) {
      this.#handleModeChange();
    }
  }

  #getDestination() {
    if (!this.#point.destination) {
      return { name: '' };
    }
    return (
      this.#destinations.find((dest) => dest.id === this.#point.destination) || {
        name: '',
      }
    );
  }

  #getPointOffers() {
    const offersForType = this.#offers[this.#point.type] || [];
    return offersForType.filter((offer) =>
      this.#point.offers.includes(offer.id)
    );
  }

  #replacePointToForm() {
    if (this.#isEditFormOpen) {
      return;
    }
    this.#handleModeChange();
    replace(this.#editFormComponent, this.#pointComponent);
    this.#isEditFormOpen = true;
    this.#editFormComponent.setFocus();
  }

  #replaceFormToPoint() {
    if (!this.#isEditFormOpen) {
      return;
    }
    if (
      this.#editFormComponent &&
      this.#editFormComponent.element.parentElement
    ) {
      replace(this.#pointComponent, this.#editFormComponent);
      this.#isEditFormOpen = false;
      this.#editFormComponent.removeEscKeyHandler();
    }
  }
}
