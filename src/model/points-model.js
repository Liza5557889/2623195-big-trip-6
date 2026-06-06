import Observable from '../framework/observable.js';

export default class PointsModel extends Observable {
  #pointsApiService = null;
  #points = [];
  #destinations = [];
  #offers = {};
  #activeFilter = 'everything';
  #isLoading = true;
  #hasError = false;

  constructor({pointsApiService}) {
    super();
    this.#pointsApiService = pointsApiService;
  }

  async init() {
    this.#isLoading = true;
    this.#hasError = false;

    try {
      const [points, destinations, offers] = await Promise.all([
        this.#pointsApiService.getPoints(),
        this.#pointsApiService.getDestinations(),
        this.#pointsApiService.getOffers()
      ]);

      this.#points = points;
      this.#destinations = destinations;
      this.#offers = offers;
    } catch (err) {
      this.#hasError = true;
      this.#points = [];
      this.#destinations = [];
      this.#offers = {};
    } finally {
      this.#isLoading = false;
      this._notify('INIT');
    }
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

  isLoading() {
    return this.#isLoading;
  }

  hasError() {
    return this.#hasError;
  }

  async updatePoint(updateType, updatedPoint) {
    const response = await this.#pointsApiService.updatePoint(updatedPoint);
    const index = this.#points.findIndex((point) => point.id === response.id);
    if (index !== -1) {
      this.#points[index] = response;
      this._notify(updateType, response);
    }
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
