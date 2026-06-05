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
  #isNewPoint = false;

  constructor({container, onDataChange, onModeChange}) {
    this.#container = container;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  init(point, destinations, offers, isNewPoint = false) {
    this.#point = point;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#isNewPoint = isNewPoint;

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
      offers: this.#getPointOffers()
    });

    this.#editFormComponent = new EditFormView({
      point: this.#point,
      destinations: this.#destinations,
      offers: this.#offers,
      isNewPoint: this.#isNewPoint
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
      this.#handleDataChange(updatedPoint, 'update');
    });
  }

  #setFormHandlers() {
    this.#editFormComponent.setSubmitHandler((updatedPoint) => {
      if (this.#isNewPoint) {
        const newPoint = {
          ...updatedPoint,
          id: Date.now() + Math.random()
        };
        this.#handleDataChange(newPoint, 'add');
      } else {
        this.#handleDataChange(updatedPoint, 'update');
      }
      this.#destroy();
    });

    this.#editFormComponent.setDeleteHandler(() => {
      if (this.#isNewPoint) {
        this.#destroy();
      } else {
        this.#handleDataChange(this.#point.id, 'delete');
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
    return this.#destinations.find((dest) => dest.id === this.#point.destination) || { name: '' };
  }

  #getPointOffers() {
    const offersForType = this.#offers[this.#point.type] || [];
    return offersForType.filter((offer) => this.#point.offers.includes(offer.id));
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
    if (this.#editFormComponent && this.#editFormComponent.element.parentElement) {
      replace(this.#pointComponent, this.#editFormComponent);
      this.#isEditFormOpen = false;
      this.#editFormComponent.removeEscKeyHandler();
    }
  }
}
