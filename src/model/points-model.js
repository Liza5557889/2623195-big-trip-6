import {generatePoints} from '../mock/point.js';
import {OFFERS_BY_TYPE} from '../const.js';

const POINT_COUNT = 5;

export default class PointsModel {
  #points = null;
  #destinations = null;
  #offers = OFFERS_BY_TYPE;
  #activeFilter = 'everything';

  constructor() {
    const mockData = generatePoints(POINT_COUNT);
    this.#points = mockData.points;
    this.#destinations = mockData.destinations;
  }

  getPoints() {
    return this.#getFilteredPoints();
  }

  getRawPoints() {
    return this.#points;
  }

  getDestinations() {
    return this.#destinations;
  }

  getOffers() {
    return this.#offers;
  }

  getDestinationById(id) {
    return this.#destinations.find((dest) => dest.id === id);
  }

  getOffersByType(type) {
    return this.#offers[type] || [];
  }

  getFilter() {
    return this.#activeFilter;
  }

  setFilter(filterType) {
    this.#activeFilter = filterType;
  }

  updatePoint(updatedPoint) {
    const index = this.#points.findIndex((point) => point.id === updatedPoint.id);
    if (index !== -1) {
      this.#points[index] = updatedPoint;
      return true;
    }
    return false;
  }

  addPoint(newPoint) {
    this.#points.push(newPoint);
    return true;
  }

  deletePoint(pointId) {
    const index = this.#points.findIndex((point) => point.id === pointId);
    if (index !== -1) {
      this.#points.splice(index, 1);
      return true;
    }
    return false;
  }

  #getFilteredPoints() {
    const now = new Date();

    switch (this.#activeFilter) {
      case 'future':
        return this.#points.filter((point) => new Date(point.dateFrom) > now);
      case 'present':
        return this.#points.filter((point) =>
          new Date(point.dateFrom) <= now && new Date(point.dateTo) >= now
        );
      case 'past':
        return this.#points.filter((point) => new Date(point.dateTo) < now);
      default:
        return [...this.#points];
    }
  }
}
