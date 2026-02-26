import {createElement} from '../render.js';
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

function createTypeTemplate(currentType) {
  const types = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];

  return types.map((type) => `
    <div class="event__type-item">
      <input id="event-type-${type}-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="${type}" ${type === currentType ? 'checked' : ''}>
      <label class="event__type-label event__type-label--${type}" for="event-type-${type}-1">${type.charAt(0).toUpperCase() + type.slice(1)}</label>
    </div>
  `).join('');
}

function createDestinationTemplate(destinations, currentDestination) {
  const options = destinations.map((dest) =>
    `<option value="${dest.name}"></option>`
  ).join('');

  return `
    <div class="event__field-group event__field-group--destination">
      <label class="event__label event__type-output" for="event-destination-1">
        ${currentDestination || 'Flight'}
      </label>
      <input class="event__input event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${currentDestination || ''}" list="destination-list-1">
      <datalist id="destination-list-1">
        ${options}
      </datalist>
    </div>
  `;
}

function createOffersTemplate(offers, selectedOffers) {
  if (!offers || offers.length === 0) {
    return '';
  }

  const offersList = offers.map((offer) => `
    <div class="event__offer-selector">
      <input class="event__offer-checkbox visually-hidden" id="event-offer-${offer.id}" type="checkbox" name="event-offer-${offer.id}" ${selectedOffers.includes(offer.id) ? 'checked' : ''}>
      <label class="event__offer-label" for="event-offer-${offer.id}">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </label>
    </div>
  `).join('');

  return `
    <section class="event__section event__section--offers">
      <h3 class="event__section-title event__section-title--offers">Offers</h3>
      <div class="event__available-offers">
        ${offersList}
      </div>
    </section>
  `;
}

function createDestinationDetailsTemplate(destination) {
  if (!destination || !destination.description) {
    return '';
  }

  const photos = destination.pictures.map((pic) => `
    <img class="event__photo" src="${pic.src}" alt="${pic.description}">
  `).join('');

  return `
    <section class="event__section event__section--destination">
      <h3 class="event__section-title event__section-title--destination">Destination</h3>
      <p class="event__destination-description">${destination.description}</p>
      <div class="event__photos-container">
        <div class="event__photos-tape">
          ${photos}
        </div>
      </div>
    </section>
  `;
}

function createEditFormTemplate(point, destinations, offers) {
  const {type, destination: destinationId, dateFrom, dateTo, basePrice, offers: selectedOffers} = point;

  const destinationObj = destinations.find((d) => d.id === destinationId);
  const destinationName = destinationObj ? destinationObj.name : '';

  const typeTemplate = createTypeTemplate(type);
  const destinationTemplate = createDestinationTemplate(destinations, destinationName);
  const offersTemplate = createOffersTemplate(offers, selectedOffers);
  const destinationDetailsTemplate = createDestinationDetailsTemplate(destinationObj);

  const dateFromFormatted = humanizePointDate(dateFrom);
  const dateToFormatted = humanizePointDate(dateTo);
  const timeFromFormatted = humanizePointTime(dateFrom);
  const timeToFormatted = humanizePointTime(dateTo);

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

export default class EditFormView {
  constructor({point = BLANK_POINT, destinations = [], offers = []} = {}) {
    this.point = point;
    this.destinations = destinations;
    this.offers = offers;
    this.element = null;
  }

  getTemplate() {
    return createEditFormTemplate(this.point, this.destinations, this.offers);
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
    }
    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}
