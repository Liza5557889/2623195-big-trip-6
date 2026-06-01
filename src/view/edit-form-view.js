import AbstractView from '../framework/view/abstract-view.js';
import {humanizePointDate, humanizePointTime} from '../utils.js';

const BLANK_POINT = {
  type: 'flight',
  destination: '',
  dateFrom: new Date(),
  dateTo: new Date(),
  basePrice: 0,
  offers: [],
  isFavorite: false
};

export default class EditFormView extends AbstractView {
  constructor({point = BLANK_POINT, destinations = [], offers = []} = {}) {
    super();
    this._point = point;
    this._destinations = destinations;
    this._offers = offers;
    this._callbacks = {};
  }

  get template() {
    const {type, destination: destinationId, dateFrom, dateTo, basePrice, offers: selectedOffers} = this._point;
    const destinationObj = this._destinations.find((d) => d.id === destinationId);
    const destinationName = destinationObj ? destinationObj.name : '';

    const dateFromFormatted = humanizePointDate(dateFrom);
    const dateToFormatted = humanizePointDate(dateTo);
    const timeFromFormatted = humanizePointTime(dateFrom);
    const timeToFormatted = humanizePointTime(dateTo);

    const types = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];
    const typeTemplate = types.map((t) => `
      <div class="event__type-item">
        <input id="event-type-${t}-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="${t}" ${t === type ? 'checked' : ''}>
        <label class="event__type-label event__type-label--${t}" for="event-type-${t}-1">${t.charAt(0).toUpperCase() + t.slice(1)}</label>
      </div>
    `).join('');

    const options = this._destinations.map((dest) => `<option value="${dest.name}"></option>`).join('');
    const destinationTemplate = `
  <div class="event__field-group event__field-group--destination">
    <label class="event__label event__type-output" for="event-destination-1">
      ${type}
    </label>
    <input class="event__input event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destinationName || ''}" list="destination-list-1">
    <datalist id="destination-list-1">
      ${options}
    </datalist>
  </div>
`;

    const offersTemplate = this._offers.length ? `
      <section class="event__section event__section--offers">
        <h3 class="event__section-title event__section-title--offers">Offers</h3>
        <div class="event__available-offers">
          ${this._offers.map((offer) => `
            <div class="event__offer-selector">
              <input class="event__offer-checkbox visually-hidden" id="event-offer-${offer.id}" type="checkbox" name="event-offer-${offer.id}" ${selectedOffers.includes(offer.id) ? 'checked' : ''}>
              <label class="event__offer-label" for="event-offer-${offer.id}">
                <span class="event__offer-title">${offer.title}</span>
                &plus;&euro;&nbsp;
                <span class="event__offer-price">${offer.price}</span>
              </label>
            </div>
          `).join('')}
        </div>
      </section>
    ` : '';

    const destinationDetailsTemplate = destinationObj?.description ? `
      <section class="event__section event__section--destination">
        <h3 class="event__section-title event__section-title--destination">Destination</h3>
        <p class="event__destination-description">${destinationObj.description}</p>
        <div class="event__photos-container">
          <div class="event__photos-tape">
            ${destinationObj.pictures.map((pic) => `
              <img class="event__photo" src="${pic.src}" alt="${pic.description}">
            `).join('')}
          </div>
        </div>
      </section>
    ` : '';

    return `
      <li class="trip-events__item">
        <form class="event event--edit" action="#" method="post">
          <header class="event__header">
            <div class="event__type-wrapper">
              <label class="event__type event__type-btn" for="event-type-toggle-1">
                <span class="visually-hidden">Choose event type</span>
                <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
              </label>
              <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">
              <div class="event__type-list">
                <fieldset class="event__type-group">
                  <legend class="visually-hidden">Event type</legend>
                  ${typeTemplate}
                </fieldset>
              </div>
            </div>
            ${destinationTemplate}
            <div class="event__field-group event__field-group--time">
              <label class="visually-hidden" for="event-start-time-1">From</label>
              <input class="event__input event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${dateFromFormatted} ${timeFromFormatted}">
              &mdash;
              <label class="visually-hidden" for="event-end-time-1">To</label>
              <input class="event__input event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${dateToFormatted} ${timeToFormatted}">
            </div>
            <div class="event__field-group event__field-group--price">
              <label class="event__label" for="event-price-1">
                <span class="visually-hidden">Price</span>
                &euro;
              </label>
              <input class="event__input event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}">
            </div>
            <button class="event__save-btn btn btn--blue" type="submit">Save</button>
            <button class="event__reset-btn" type="reset">Delete</button>
            <button class="event__rollup-btn" type="button">
              <span class="visually-hidden">Open event</span>
            </button>
          </header>
          <section class="event__details">
            ${offersTemplate}
            ${destinationDetailsTemplate}
          </section>
        </form>
      </li>
    `;
  }

  setSubmitHandler(callback) {
    this._callbacks.submit = callback;
    this.element.querySelector('.event__save-btn')
      .addEventListener('click', this.#submitHandler);
  }

  setDeleteHandler(callback) {
    this._callbacks.delete = callback;
    this.element.querySelector('.event__reset-btn')
      .addEventListener('click', this.#deleteHandler);
  }

  setRollupClickHandler(callback) {
    this._callbacks.rollupClick = callback;
    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#rollupClickHandler);
  }

  setEscKeyHandler(callback) {
    this._callbacks.escKey = callback;
    document.addEventListener('keydown', this.#escKeyHandler);
  }

  setFocus() {
    this.element.querySelector('.event__input--destination').focus();
  }

  removeEscKeyHandler() {
    document.removeEventListener('keydown', this.#escKeyHandler);
  }

  #submitHandler = (evt) => {
    evt.preventDefault();
    this._callbacks.submit?.();
  };

  #deleteHandler = (evt) => {
    evt.preventDefault();
    this._callbacks.delete?.();
  };

  #rollupClickHandler = (evt) => {
    evt.preventDefault();
    this._callbacks.rollupClick?.();
  };

  #escKeyHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this._callbacks.escKey?.();
    }
  };
}
