import SortView from '../view/sort-view.js';
import EditFormView from '../view/edit-form-view.js';
import CreateFormView from '../view/create-form-view.js';
import RoutePointView from '../view/point-view.js';
import {render, RenderPosition} from '../render.js';

const ROUTE_POINT_COUNT = 3;

export default class TripPresenter {
  constructor({tripEventsContainer}) {
    this.tripEventsContainer = tripEventsContainer;
  }

  init() {
    this.tripEventsContainer.innerHTML = '';

    render(new SortView(), this.tripEventsContainer, RenderPosition.AFTERBEGIN);

    render(new EditFormView(), this.tripEventsContainer);

    render(new CreateFormView(), this.tripEventsContainer);

    for (let i = 0; i < ROUTE_POINT_COUNT; i++) {
      render(new RoutePointView(), this.tripEventsContainer);
    }
  }
}
