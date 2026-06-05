import Observable from '../framework/observable.js';

export default class FilterModel extends Observable {
  #activeFilter = 'everything';

  get filter() {
    return this.#activeFilter;
  }

  setFilter(updateType, filter) {
    if (this.#activeFilter !== filter) {
      this.#activeFilter = filter;
      this._notify(updateType, filter);
    }
  }
}
