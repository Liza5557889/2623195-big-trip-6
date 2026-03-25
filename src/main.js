import FiltersView from './view/filter-view.js';
import {render} from './render.js';
import TripPresenter from './presenter/trip-presenter.js';
import PointsModel from './model/points-model.js';

const pageMainElement = document.querySelector('.page-main');
const pageHeaderElement = document.querySelector('.page-header');
const tripControlsFilters = pageHeaderElement.querySelector('.trip-controls__filters');
const tripEventsElement = pageMainElement.querySelector('.trip-events');

const pointsModel = new PointsModel();

const tripPresenter = new TripPresenter({
  tripEventsContainer: tripEventsElement,
  pointsModel: pointsModel,
});

render(new FiltersView(), tripControlsFilters);

tripPresenter.init();
