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

      this._notify('INIT');
      this._notify('MAJOR');
    } catch (err) {
      this.#hasError = true;
      this.#points = [];
      this.#destinations = [];
      this.#offers = {};
      this._notify('INIT');
    } finally {
      this.#isLoading = false;
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

  async addPoint(updateType, newPoint) {
    const response = await this.#pointsApiService.addPoint(newPoint);
    this.#points.push(response);
    this._notify(updateType, response);
  }

  async deletePoint(updateType, pointId) {
    await this.#pointsApiService.deletePoint(pointId);
    const index = this.#points.findIndex((point) => point.id === pointId);
    if (index !== -1) {
      this.#points.splice(index, 1);
      this._notify(updateType, pointId);
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
