import RoutePointView from '../view/point-view.js';
import EditFormView from '../view/edit-form-view.js';
import {render, replace} from '../framework/render.js';

export default class PointPresenter {
  #pointComponent = null;
  #editFormComponent = null;
  #point = null;
  #destinations = null;
  #offers = null;
  #container = null;
  #handleDataChange = null;
  #handleModeChange = null;

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

    replace(this.#pointComponent, oldPointComponent);
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
      offers: this.#getPointOffers()
    });
  }

  #setHandlers() {
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

    this.#editFormComponent.setSubmitHandler(() => {
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
    this.#handleModeChange();
    replace(this.#editFormComponent, this.#pointComponent);
    this.#editFormComponent.setFocus();
  }

  #replaceFormToPoint() {
    replace(this.#pointComponent, this.#editFormComponent);
    this.#editFormComponent.removeEscKeyHandler();
  }

  resetView() {
    if (this.#editFormComponent !== null && document.body.contains(this.#editFormComponent.element)) {
      this.#replaceFormToPoint();
    }
  }
}
