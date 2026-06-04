import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import {humanizePointDate, humanizePointTime} from '../utils.js';

const BLANK_POINT = {
  id: null,
  type: 'flight',
  destination: '',
  dateFrom: new Date(),
  dateTo: new Date(),
  basePrice: 0,
  offers: [],
  isFavorite: false
};

export default class EditFormView extends AbstractStatefulView {
  #destinations = null;
  #offers = null;
  #isNewPoint = false;

  constructor({point = BLANK_POINT, destinations = [], offers = [], isNewPoint = false}) {
    super();
    this._state = this.#pointToState(point);
    this.#destinations = destinations;
    this.#offers = offers;
    this.#isNewPoint = isNewPoint;
    this._callbacks = {};
    this._restoreHandlers();
  }

  get template() {
    return this.#createTemplate();
  }

  #pointToState(point) {
    return {
      id: point.id,
      type: point.type,
      destination: point.destination,
      dateFrom: point.dateFrom instanceof Date ? point.dateFrom : new Date(point.dateFrom),
      dateTo: point.dateTo instanceof Date ? point.dateTo : new Date(point.dateTo),
      basePrice: point.basePrice,
      offers: [...point.offers],
      isFavorite: point.isFavorite
    };
  }

  #stateToPoint() {
    return {
      id: this._state.id,
      type: this._state.type,
      destination: this._state.destination,
      dateFrom: this._state.dateFrom,
      dateTo: this._state.dateTo,
      basePrice: this._state.basePrice,
      offers: [...this._state.offers],
      isFavorite: this._state.isFavorite
    };
  }

  #createTemplate() {
    const {type, destination: destinationId, dateFrom, dateTo, basePrice, offers: selectedOffers} = this._state;
    const destinationObj = this.#destinations.find((d) => d.id === destinationId);
    const destinationName = destinationObj ? destinationObj.name : '';

    const dateFromFormatted = humanizePointDate(dateFrom);
    const dateToFormatted = humanizePointDate(dateTo);
    const timeFromFormatted = humanizePointTime(dateFrom);
    const timeToFormatted = humanizePointTime(dateTo);

    const types = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];
    const typeTemplate = types.map((t) => `
      <div class="event__type-item">
        <input id="event-type-${t}-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="${t}" ${t === type ? 'checked' : ''}>
        <label class="event__type-label event__type-label--${t}" for="event-type-${t}-1">${t}</label>
      </div>
    `).join('');

    // Используем select вместо input + datalist
    const selectOptions = this.#destinations.map((dest) => `
      <option value="${dest.id}" ${dest.id === destinationId ? 'selected' : ''}>${dest.name}</option>
    `).join('');

    const destinationTemplate = `
      <div class="event__field-group event__field-group--destination">
        <label class="event__label event__type-output" for="event-destination-1">
          ${type}
        </label>
        <select class="event__input event__input--destination" id="event-destination-1" name="event-destination">
          ${selectOptions}
        </select>
      </div>
    `;

    const currentOffers = this.#offers[type] || [];
    const offersTemplate = currentOffers.length ? `
      <section class="event__section event__section--offers">
        <h3 class="event__section-title event__section-title--offers">Offers</h3>
        <div class="event__available-offers">
          ${currentOffers.map((offer) => `
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

    const buttonText = this.#isNewPoint ? 'Cancel' : 'Delete';

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
            <button class="event__reset-btn" type="reset">${buttonText}</button>
            ${!this.#isNewPoint ? '<button class="event__rollup-btn" type="button"><span class="visually-hidden">Open event</span></button>' : ''}
          </header>
          <section class="event__details">
            ${offersTemplate}
            ${destinationDetailsTemplate}
          </section>
        </form>
      </li>
    `;
  }

  #typeChangeHandler = (evt) => {
    const newType = evt.target.value;
    if (newType !== this._state.type) {
      this.updateElement({
        type: newType,
        offers: []
      });
    }
  };

  #destinationChangeHandler = (evt) => {
    const newDestinationId = evt.target.value;
    if (newDestinationId !== this._state.destination) {
      this.updateElement({
        destination: newDestinationId
      });
    }
  };

  #priceChangeHandler = (evt) => {
    const newPrice = parseInt(evt.target.value, 10);
    if (!isNaN(newPrice) && newPrice !== this._state.basePrice) {
      this.updateElement({
        basePrice: newPrice
      });
    }
  };

  #offersChangeHandler = (evt) => {
    if (evt.target.classList.contains('event__offer-checkbox')) {
      const offerId = evt.target.id.replace('event-offer-', '');
      let updatedOffers = [...this._state.offers];

      if (evt.target.checked) {
        if (!updatedOffers.includes(offerId)) {
          updatedOffers.push(offerId);
        }
      } else {
        updatedOffers = updatedOffers.filter((id) => id !== offerId);
      }

      this.updateElement({offers: updatedOffers});
    }
  };

  #setInnerHandlers() {
    const typeInputs = this.element.querySelectorAll('.event__type-input');
    typeInputs.forEach((input) => {
      input.removeEventListener('change', this.#typeChangeHandler);
      input.addEventListener('change', this.#typeChangeHandler);
    });

    const destinationSelect = this.element.querySelector('.event__input--destination');
    if (destinationSelect) {
      destinationSelect.removeEventListener('change', this.#destinationChangeHandler);
      destinationSelect.addEventListener('change', this.#destinationChangeHandler);
    }

    const priceInput = this.element.querySelector('.event__input--price');
    if (priceInput) {
      priceInput.removeEventListener('change', this.#priceChangeHandler);
      priceInput.addEventListener('change', this.#priceChangeHandler);
    }

    const offersContainer = this.element.querySelector('.event__available-offers');
    if (offersContainer) {
      offersContainer.removeEventListener('change', this.#offersChangeHandler);
      offersContainer.addEventListener('change', this.#offersChangeHandler);
    }
  }

  _restoreHandlers() {
    this.#setInnerHandlers();

    const saveBtn = this.element.querySelector('.event__save-btn');
    if (saveBtn) {
      saveBtn.removeEventListener('click', this.#submitHandler);
      saveBtn.addEventListener('click', this.#submitHandler);
    }

    const resetBtn = this.element.querySelector('.event__reset-btn');
    if (resetBtn) {
      resetBtn.removeEventListener('click', this.#resetHandler);
      resetBtn.addEventListener('click', this.#resetHandler);
    }

    const rollupBtn = this.element.querySelector('.event__rollup-btn');
    if (rollupBtn) {
      rollupBtn.removeEventListener('click', this.#rollupClickHandler);
      rollupBtn.addEventListener('click', this.#rollupClickHandler);
    }
  }

  setSubmitHandler(callback) {
    this._callbacks.submit = callback;
  }

  setDeleteHandler(callback) {
    this._callbacks.delete = callback;
  }

  setRollupClickHandler(callback) {
    this._callbacks.rollupClick = callback;
  }

  setEscKeyHandler(callback) {
    this._callbacks.escKey = callback;
    document.addEventListener('keydown', this.#escKeyHandler);
  }

  setFocus() {
    const destinationSelect = this.element.querySelector('.event__input--destination');
    if (destinationSelect) {
      destinationSelect.focus();
    }
  }

  removeEscKeyHandler() {
    document.removeEventListener('keydown', this.#escKeyHandler);
  }

  #submitHandler = (evt) => {
    evt.preventDefault();
    this._callbacks.submit?.(this.#stateToPoint());
  };

  #resetHandler = (evt) => {
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
