import AbstractView from '../framework/view/abstract-view.js';

function createFilterTemplate(filters) {
  return `
    <form class="trip-filters" action="#" method="get">
      ${filters.map((filter, index) => `
        <div class="trip-filters__filter">
          <input
            id="filter-${filter.type}"
            class="trip-filters__filter-input visually-hidden"
            type="radio"
            name="trip-filter"
            value="${filter.type}"
            ${index === 0 ? 'checked' : ''}
            ${filter.count === 0 ? 'disabled' : ''}
          >
          <label class="trip-filters__filter-label" for="filter-${filter.type}">
            ${filter.type.charAt(0).toUpperCase() + filter.type.slice(1)}
          </label>
        </div>
      `).join('')}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>
  `;
}

export default class FiltersView extends AbstractView {
  #filters = null;
  #handleFilterChange = null;

  constructor({filters, onFilterChange}) {
    super();
    this.#filters = filters;
    this.#handleFilterChange = onFilterChange;
    this.element.addEventListener('change', this.#filterChangeHandler);
  }

  get template() {
    return createFilterTemplate(this.#filters);
  }

  #filterChangeHandler = (evt) => {
    if (evt.target.tagName !== 'INPUT') {
      return;
    }
    this.#handleFilterChange(evt.target.value);
  };
}
