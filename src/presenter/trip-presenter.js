import SortView from '../view/sort-view.js';
import EditFormView from '../view/edit-form-view.js';
import RoutePointView from '../view/point-view.js';
import TripEventsListView from '../view/trip-events-list-view.js';
import {render, replace} from '../framework/render.js';

export default class TripPresenter {
  #sortComponent = new SortView();
  #tripEventsListComponent = new TripEventsListView();
  #tripEventsContainer = null;
  #pointsModel = null;
  #boardPoints = [];
  #destinations = [];
  #offers = [];

  constructor({tripEventsContainer, pointsModel}) {
    this.#tripEventsContainer = tripEventsContainer;
    this.#pointsModel = pointsModel;
  }

  init() {
    this.#boardPoints = [...this.#pointsModel.getPoints()];
    this.#destinations = this.#pointsModel.getDestinations();
    this.#offers = this.#pointsModel.getOffers();

    this.#tripEventsContainer.innerHTML = '';

    render(this.#sortComponent, this.#tripEventsContainer);
    render(this.#tripEventsListComponent, this.#tripEventsContainer);

    this.#renderPoints();
  }

  #renderPoints() {
    for (let i = 0; i < this.#boardPoints.length; i++) {
      this.#renderPoint(this.#boardPoints[i]);
    }
  }

  #renderPoint(point) {
    const destination = this.#pointsModel.getDestinationById(point.destination);
    const pointOffers = this.#pointsModel.getOffersByType(point.type);

    const pointComponent = new RoutePointView({
      point,
      destination,
      offers: pointOffers
    });

    const editFormComponent = new EditFormView({
      point,
      destinations: this.#destinations,
      offers: pointOffers
    });

    pointComponent.setEditClickHandler(() => {
      this.#replacePointToForm(pointComponent, editFormComponent);
    });

    editFormComponent.setSubmitHandler(() => {
      this.#replaceFormToPoint(editFormComponent, pointComponent);
    });

    editFormComponent.setDeleteHandler(() => {
      this.#handleDeleteClick(point);
    });

    editFormComponent.setRollupClickHandler(() => {
      this.#replaceFormToPoint(editFormComponent, pointComponent);
    });

    editFormComponent.setEscKeyHandler(() => {
      this.#replaceFormToPoint(editFormComponent, pointComponent);
    });

    render(pointComponent, this.#tripEventsListComponent.element);
  }

  #replacePointToForm(pointComponent, editFormComponent) {
    replace(editFormComponent, pointComponent);
    editFormComponent.setFocus();
  }

  #replaceFormToPoint(editFormComponent, pointComponent) {
    replace(pointComponent, editFormComponent);
    editFormComponent.removeEscKeyHandler();
  }

  #handleDeleteClick() {
  }
}
