import AbstractView from '../framework/view/abstract-view.js';
import {FilterType} from '../const.js';

function createFilterTemplate(filters, currentFilterType) {
  const filterNames = {
    [FilterType.EVERYTHING]: 'Everything',
    [FilterType.FUTURE]: 'Future',
    [FilterType.PRESENT]: 'Present',
    [FilterType.PAST]: 'Past'
  };

  return `
    <form class="trip-filters" action="#" method="get">
      ${filters.map((filter) => `
        <div class="trip-filters__filter">
          <input
            id="filter-${filter.type}"
            class="trip-filters__filter-input visually-hidden"
            type="radio"
            name="trip-filter"
            value="${filter.type}"
            ${filter.type === currentFilterType ? 'checked' : ''}
            ${filter.count === 0 ? 'disabled' : ''}
          >
          <label class="trip-filters__filter-label" for="filter-${filter.type}">
            ${filterNames[filter.type]}
          </label>
        </div>
      `).join('')}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>
  `;
}

export default class FiltersView extends AbstractView {
  #filters = null;
  #currentFilterType = null;
  #handleFilterChange = null;

  constructor({filters, currentFilterType, onFilterChange}) {
    super();
    this.#filters = filters;
    this.#currentFilterType = currentFilterType;
    this.#handleFilterChange = onFilterChange;
    this.element.addEventListener('change', this.#filterChangeHandler);
  }

  get template() {
    return createFilterTemplate(this.#filters, this.#currentFilterType);
  }

  #filterChangeHandler = (evt) => {
    if (evt.target.tagName !== 'INPUT') {
      return;
    }
    this.#handleFilterChange(evt.target.value);
  };
}
