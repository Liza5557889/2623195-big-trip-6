import RoutePointView from '../view/point-view.js';
import EditFormView from '../view/edit-form-view.js';
import {render, replace, remove} from '../framework/render.js';

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

  constructor({container, onDataChange, onModeChange}) {
    this.#container = container;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  init(point, destinations, offers) {
    this.#point = point;
    this.#destinations = destinations;
    this.#offers = offers;

    this.#createComponents();
    this.#setHandlers();
    render(this.#pointComponent, this.#container);
  }

  update(point) {
    this.#point = point;

    const oldPointComponent = this.#pointComponent;

    this.#pointComponent = new RoutePointView({
      point: this.#point,
      destination: this.#getDestination(),
      offers: this.#getPointOffers()
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
    }
  }

  resetView() {
    if (this.#editFormComponent && this.#isEditFormOpen) {
      this.#replaceFormToPoint();
    }
  }

  #createComponents() {
    this.#pointComponent = new RoutePointView({
      point: this.#point,
      destination: this.#getDestination(),
      offers: this.#getPointOffers()
    });

    this.#editFormComponent = new EditFormView({
      point: this.#point,
      destinations: this.#destinations,
      offers: this.#offers,
      isNewPoint: false
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

    this.#pointComponent.setFavoriteClickHandler(() => {
      const updatedPoint = {
        ...this.#point,
        isFavorite: !this.#point.isFavorite
      };
      this.#handleDataChange(updatedPoint);
    });
  }

  #setFormHandlers() {
    this.#editFormComponent.setSubmitHandler((updatedPoint) => {
      this.#handleDataChange(updatedPoint);
      this.#replaceFormToPoint();
    });

    this.#editFormComponent.setDeleteHandler(() => {
      this.#handleDataChange(null);
    });

    this.#editFormComponent.setRollupClickHandler(() => {
      this.#replaceFormToPoint();
    });

    this.#editFormComponent.setEscKeyHandler(() => {
      this.#replaceFormToPoint();
    });
  }

  #getDestination() {
    return this.#destinations.find((dest) => dest.id === this.#point.destination);
  }

  #getPointOffers() {
    const offersForType = this.#offers[this.#point.type] || [];
    return offersForType.filter((offer) => this.#point.offers.includes(offer.id));
  }

  #replacePointToForm() {
    // Если форма уже открыта, ничего не делаем
    if (this.#isEditFormOpen) {
      return;
    }

    // Уведомляем презентер, что нужно закрыть другие формы
    this.#handleModeChange();

    replace(this.#editFormComponent, this.#pointComponent);
    this.#isEditFormOpen = true;
    this.#editFormComponent.setFocus();
  }

  #replaceFormToPoint() {
    if (!this.#isEditFormOpen) {
      return;
    }

    replace(this.#pointComponent, this.#editFormComponent);
    this.#isEditFormOpen = false;
    this.#editFormComponent.removeEscKeyHandler();
  }
}
