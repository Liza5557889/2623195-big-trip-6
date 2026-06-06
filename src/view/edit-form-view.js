import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import {humanizePointDate, humanizePointTime} from '../utils.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

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
  #datepickerFrom = null;
  #datepickerTo = null;

  constructor({point = BLANK_POINT, destinations = [], offers = [], isNewPoint = false}) {
    super();
    this._setState(EditFormView.parsePointToState(point));
    this.#destinations = destinations;
    this.#offers = offers;
    this.#isNewPoint = isNewPoint;
    this._callbacks = {};
    this._restoreHandlers();
  }

  get template() {
    return this.#createTemplate(this._state);
  }

  #createTemplate(state) {
    const {type, destination: destinationId, dateFrom, dateTo, basePrice, offers: selectedOffers} = state;
    const destinationObj = this.#destinations.find((d) => d.id === destinationId);

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
              <input class="event__input event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${dateFromFormatted} ${timeFromFormatted}" placeholder="DD/MM/YY HH:MM">
              &mdash;
              <label class="visually-hidden" for="event-end-time-1">To</label>
              <input class="event__input event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${dateToFormatted} ${timeToFormatted}" placeholder="DD/MM/YY HH:MM">
            </div>
            <div class="event__field-group event__field-group--price">
              <label class="event__label" for="event-price-1">
                <span class="visually-hidden">Price</span>
                &euro;
              </label>
              <input class="event__input event__input--price" id="event-price-1" type="number" name="event-price" value="${basePrice}" min="0" step="1">
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

  #initDatepickers() {
    const startDateInput = this.element.querySelector('#event-start-time-1');
    const endDateInput = this.element.querySelector('#event-end-time-1');

    if (startDateInput && !this.#datepickerFrom) {
      this.#datepickerFrom = flatpickr(startDateInput, {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        time24hr: true,
        defaultDate: this._state.dateFrom,
        onChange: ([date]) => {
          if (date) {
            this.updateElement({dateFrom: date});
            if (this.#datepickerTo && date > this._state.dateTo) {
              this.#datepickerTo.setDate(date);
              this.updateElement({dateTo: date});
            }
          }
        }
      });
    }

    if (endDateInput && !this.#datepickerTo) {
      this.#datepickerTo = flatpickr(endDateInput, {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        time24hr: true,
        defaultDate: this._state.dateTo,
        onChange: ([date]) => {
          if (date && date >= this._state.dateFrom) {
            this.updateElement({dateTo: date});
          }
        }
      });
    }
  }

  #destroyDatepickers() {
    if (this.#datepickerFrom) {
      this.#datepickerFrom.destroy();
      this.#datepickerFrom = null;
    }
    if (this.#datepickerTo) {
      this.#datepickerTo.destroy();
      this.#datepickerTo = null;
    }
  }

  #typeChangeHandler = (evt) => {
    evt.preventDefault();
    const newType = evt.target.value;
    if (newType !== this._state.type) {
      this.updateElement({
        type: newType,
        offers: []
      });
    }
  };

  #destinationChangeHandler = (evt) => {
    evt.preventDefault();
    const newDestinationId = evt.target.value;
    if (newDestinationId !== this._state.destination) {
      this.updateElement({
        destination: newDestinationId
      });
    }
  };

  #priceChangeHandler = (evt) => {
    evt.preventDefault();
    const newPrice = parseInt(evt.target.value, 10);
    if (!isNaN(newPrice) && newPrice !== this._state.basePrice) {
      this.updateElement({
        basePrice: newPrice
      });
    }
  };

  #offersChangeHandler = (evt) => {
    if (evt.target.classList.contains('event__offer-checkbox')) {
      evt.preventDefault();
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

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    if (this._callbacks.submit) {
      this._callbacks.submit(EditFormView.parseStateToPoint(this._state));
    }
  };

  #resetHandler = (evt) => {
    evt.preventDefault();
    if (this._callbacks.delete) {
      this._callbacks.delete();
    }
  };

  #rollupClickHandler = (evt) => {
    evt.preventDefault();
    if (this._callbacks.rollupClick) {
      this._callbacks.rollupClick();
    }
  };

  #escKeyHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      if (this._callbacks.escKey) {
        this._callbacks.escKey();
      }
    }
  };

  _restoreHandlers() {
    const form = this.element.querySelector('form');
    if (form) {
      form.addEventListener('submit', this.#formSubmitHandler);
    }

    const typeInputs = this.element.querySelectorAll('.event__type-input');
    typeInputs.forEach((input) => {
      input.addEventListener('change', this.#typeChangeHandler);
    });

    const destinationSelect = this.element.querySelector('.event__input--destination');
    if (destinationSelect) {
      destinationSelect.addEventListener('change', this.#destinationChangeHandler);
    }

    const priceInput = this.element.querySelector('.event__input--price');
    if (priceInput) {
      priceInput.addEventListener('change', this.#priceChangeHandler);
    }

    const offersContainer = this.element.querySelector('.event__available-offers');
    if (offersContainer) {
      offersContainer.addEventListener('change', this.#offersChangeHandler);
    }

    const resetBtn = this.element.querySelector('.event__reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', this.#resetHandler);
    }

    const rollupBtn = this.element.querySelector('.event__rollup-btn');
    if (rollupBtn) {
      rollupBtn.addEventListener('click', this.#rollupClickHandler);
    }

    this.#initDatepickers();
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

  removeElement() {
    this.#destroyDatepickers();
    super.removeElement();
  }

  shake() {
    const form = this.element.querySelector('.event--edit');
    if (form) {
      form.style.animation = 'shake 0.6s';
      form.addEventListener('animationend', () => {
        form.style.animation = '';
      }, {once: true});
    }

  }

  static parsePointToState(point) {
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

  static parseStateToPoint(state) {
    return {
      id: state.id,
      type: state.type,
      destination: state.destination,
      dateFrom: state.dateFrom,
      dateTo: state.dateTo,
      basePrice: state.basePrice,
      offers: [...state.offers],
      isFavorite: state.isFavorite
    };
  }
}
