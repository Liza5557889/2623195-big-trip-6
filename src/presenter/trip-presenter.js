import SortView from '../view/sort-view.js';
import EditFormView from '../view/edit-form-view.js';
import RoutePointView from '../view/point-view.js';
import TripEventsListView from '../view/trip-events-list-view.js';
import EmptyPointsView from '../view/empty-points-view.js';
import {render, replace, remove} from '../framework/render.js';
import dayjs from 'dayjs';

export default class TripPresenter {
  #sortComponent = new SortView();
  #tripEventsListComponent = new TripEventsListView();
  #emptyPointsComponent = null;
  #tripEventsContainer = null;
  #pointsModel = null;
  #boardPoints = [];
  #destinations = [];
  #offers = [];
  #currentFilter = 'everything';

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

    this.#renderPointsList();
  }

  #renderPointsList() {
    const filteredPoints = this.#getFilteredPoints();

    if (filteredPoints.length === 0) {
      this.#renderEmptyPoints();
      return;
    }

    this.#renderTripEventsList();
    this.#renderPoints(filteredPoints);
  }

  #renderEmptyPoints() {
    if (this.#emptyPointsComponent) {
      remove(this.#emptyPointsComponent);
    }
    this.#emptyPointsComponent = new EmptyPointsView();
    render(this.#emptyPointsComponent, this.#tripEventsContainer);
  }

  #renderTripEventsList() {
    if (this.#emptyPointsComponent) {
      remove(this.#emptyPointsComponent);
    }
    render(this.#tripEventsListComponent, this.#tripEventsContainer);
  }

  #renderPoints(points) {
    for (let i = 0; i < points.length; i++) {
      this.#renderPoint(points[i]);
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

  #getFilteredPoints() {
    if (this.#currentFilter === 'everything') {
      return [...this.#boardPoints];
    }

    if (this.#currentFilter === 'future') {
      return this.#boardPoints.filter((point) => dayjs(point.dateFrom).isAfter(dayjs()));
    }

    if (this.#currentFilter === 'present') {
      return this.#boardPoints.filter((point) =>
        dayjs(point.dateFrom).isBefore(dayjs()) && dayjs(point.dateTo).isAfter(dayjs())
      );
    }

    if (this.#currentFilter === 'past') {
      return this.#boardPoints.filter((point) => dayjs(point.dateTo).isBefore(dayjs()));
    }

    return [...this.#boardPoints];
  }

  updateFilter(filterType) {
    this.#currentFilter = filterType;
    this.#tripEventsContainer.innerHTML = '';
    render(this.#sortComponent, this.#tripEventsContainer);
    this.#renderPointsList();
  }
}
