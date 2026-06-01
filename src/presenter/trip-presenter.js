import SortView, {SortType} from '../view/sort-view.js';
import TripEventsListView from '../view/trip-events-list-view.js';
import EmptyPointsView from '../view/empty-points-view.js';
import PointPresenter from './point-presenter.js';
import {render} from '../framework/render.js';
import dayjs from 'dayjs';

export default class TripPresenter {
  #sortComponent = null;
  #tripEventsListComponent = new TripEventsListView();
  #emptyPointsComponent = null;
  #tripEventsContainer = null;
  #pointsModel = null;
  #boardPoints = [];
  #destinations = [];
  #offers = [];
  #currentFilterType = 'everything';
  #currentSortType = SortType.DAY;
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

    this.#renderSort();
    this.#renderPointsList();
  }

  #renderSort() {
    // Удаляем старый компонент сортировки, если он есть
    if (this.#sortComponent !== null) {
      this.#sortComponent.element.remove();
      this.#sortComponent.removeElement();
    }

    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange.bind(this)
    });

    render(this.#sortComponent, this.#tripEventsContainer);
  }

  #handleSortTypeChange(sortType) {
    if (this.#currentSortType === sortType) {
      return;
    }
    this.#currentSortType = sortType;
    this.#renderPointsList();
  }

  #renderPointsList() {
    const filteredPoints = this.#getFilteredPoints();
    const sortedPoints = this.#getSortedPoints(filteredPoints);

    // Очищаем контейнер перед перерисовкой списка
    this.#tripEventsListComponent.element.innerHTML = '';
    this.#pointPresenters.clear();

    if (sortedPoints.length === 0) {
      this.#renderEmptyPoints();
      return;
    }

    this.#renderTripEventsList();
    this.#renderPoints(sortedPoints);
  }

  #getSortedPoints(points) {
    const pointsCopy = [...points];

    switch (this.#currentSortType) {
      case SortType.TIME:
        return pointsCopy.sort((a, b) => {
          const durationA = dayjs(a.dateTo).diff(dayjs(a.dateFrom));
          const durationB = dayjs(b.dateTo).diff(dayjs(b.dateFrom));
          return durationB - durationA;
        });
      case SortType.PRICE:
        return pointsCopy.sort((a, b) => b.basePrice - a.basePrice);
      case SortType.DAY:
      default:
        return pointsCopy.sort((a, b) => dayjs(a.dateFrom).diff(dayjs(b.dateFrom)));
    }
  }

  #renderEmptyPoints() {
    if (this.#emptyPointsComponent) {
      this.#emptyPointsComponent.element.remove();
      this.#emptyPointsComponent.removeElement();
      this.#emptyPointsComponent = null;
    }
    this.#emptyPointsComponent = new EmptyPointsView({filterType: this.#currentFilterType});
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
    this.#renderPointsList();
  }

  #handleModeChange() {
    this.#resetAllPointsViews();
  }

  #resetAllPointsViews() {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  }

  #getFilteredPoints() {
    const now = dayjs();

    switch (this.#currentFilterType) {
      case 'future':
        return this.#boardPoints.filter((point) => dayjs(point.dateFrom).isAfter(now));
      case 'present':
        return this.#boardPoints.filter((point) =>
          dayjs(point.dateFrom).isBefore(now) && dayjs(point.dateTo).isAfter(now)
        );
      case 'past':
        return this.#boardPoints.filter((point) => dayjs(point.dateTo).isBefore(now));
      default:
        return [...this.#boardPoints];
    }
  }

  updateFilter(filterType) {
    if (this.#currentFilterType === filterType) {
      return;
    }
    this.#currentFilterType = filterType;
    this.#currentSortType = SortType.DAY;

    // Очищаем контейнер и перерисовываем всё заново
    this.#tripEventsContainer.innerHTML = '';

    this.#renderSort();
    this.#renderPointsList();
  }
}
