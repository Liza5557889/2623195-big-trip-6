import {generatePoints} from '../mock/point.js';
import {OFFERS_BY_TYPE} from '../const.js';

const POINT_COUNT = 5;

export default class PointsModel {
  #points = null;
  #destinations = null;
  #offers = OFFERS_BY_TYPE;

  constructor() {
    const mockData = generatePoints(POINT_COUNT);
    this.#points = mockData.points;
    this.#destinations = mockData.destinations;
  }

  getPoints() {
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
}
