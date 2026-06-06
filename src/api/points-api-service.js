import ApiService from './api-service.js';

export default class PointsApiService extends ApiService {
  async getPoints() {
    const response = await this._load({url: 'points'});
    const points = await ApiService.parseResponse(response);
    return this.#adaptToClient(points);
  }

  async getDestinations() {
    const response = await this._load({url: 'destinations'});
    return ApiService.parseResponse(response);
  }

  async getOffers() {
    const response = await this._load({url: 'offers'});
    const offers = await ApiService.parseResponse(response);
    return this.#adaptOffersToClient(offers);
  }

  async updatePoint(point) {
    const response = await this._load({
      url: `points/${point.id}`,
      method: 'PUT',
      body: JSON.stringify(this.#adaptToServer(point)),
      headers: new Headers({'Content-Type': 'application/json'}),
    });
    const updatedPoint = await ApiService.parseResponse(response);
    return this.#adaptToClient([updatedPoint])[0];
  }

  #adaptToClient(points) {
    return points.map((point) => ({
      id: point.id,
      type: point.type,
      destination: point.destination,
      dateFrom: new Date(point.date_from),
      dateTo: new Date(point.date_to),
      basePrice: point.base_price,
      offers: point.offers,
      isFavorite: point.is_favorite
    }));
  }

  #adaptToServer(point) {
    return {
      id: point.id,
      type: point.type,
      destination: point.destination,
      // eslint-disable-next-line camelcase
      date_from: point.dateFrom instanceof Date ? point.dateFrom.toISOString() : point.dateFrom,
      // eslint-disable-next-line camelcase
      date_to: point.dateTo instanceof Date ? point.dateTo.toISOString() : point.dateTo,
      // eslint-disable-next-line camelcase
      base_price: point.basePrice,
      offers: point.offers,
      // eslint-disable-next-line camelcase
      is_favorite: point.isFavorite
    };
  }

  #adaptOffersToClient(offers) {
    const offersByType = {};
    offers.forEach((offer) => {
      offersByType[offer.type] = offer.offers.map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price
      }));
    });
    return offersByType;
  }
}
