import SortView from '../view/sort-view.js';
import TripEventsListView from '../view/trip-events-list-view.js';
import EmptyPointsView from '../view/empty-points-view.js';
import PointPresenter from './point-presenter.js';
import {render} from '../framework/render.js';
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
  #pointPresenters = new Map();

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
      this.#emptyPointsComponent.element.remove();
      this.#emptyPointsComponent.removeElement();
      this.#emptyPointsComponent = null;
    }
    this.#emptyPointsComponent = new EmptyPointsView();
    render(this.#emptyPointsComponent, this.#tripEventsContainer);
  }

  #renderTripEventsList() {
    if (this.#emptyPointsComponent) {
      this.#emptyPointsComponent.element.remove();
      this.#emptyPointsComponent.removeElement();
      this.#emptyPointsComponent = null;
    }
    render(this.#tripEventsListComponent, this.#tripEventsContainer);
  }

  #renderPoints(points) {
    this.#pointPresenters.clear();

    for (let i = 0; i < points.length; i++) {
      this.#renderPoint(points[i]);
    }
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      container: this.#tripEventsListComponent.element,
      onDataChange: this.#handleDataChange.bind(this),
      onModeChange: this.#handleModeChange.bind(this)
    });

    pointPresenter.init(point, this.#destinations, this.#offers);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #handleDataChange(updatedPoint) {
    if (updatedPoint === null) {
      this.#resetAllPointsViews();
      this.#renderPointsList();
      return;
    }

    const index = this.#boardPoints.findIndex((p) => p.id === updatedPoint.id);
    if (index !== -1) {
      this.#boardPoints[index] = updatedPoint;
    }

    const pointPresenter = this.#pointPresenters.get(updatedPoint.id);
    if (pointPresenter) {
      pointPresenter.update(updatedPoint);
    }

    this.#resetAllPointsViews();
  }

  #handleModeChange() {
    this.#resetAllPointsViews();
  }

  #resetAllPointsViews() {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
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
    this.#renderPointsList();
  }
}
