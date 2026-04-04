import FiltersView from './view/filter-view.js';
import {render} from './framework/render.js';
import TripPresenter from './presenter/trip-presenter.js';
import PointsModel from './model/points-model.js';
import {generateFilters} from './utils/filter.js';

const pageHeaderElement = document.querySelector('.page-header');
const tripControlsFilters = pageHeaderElement.querySelector('.trip-controls__filters');
const pageMainElement = document.querySelector('.page-main');
const tripEventsElement = pageMainElement.querySelector('.trip-events');

const pointsModel = new PointsModel();
const points = pointsModel.getPoints();
const filters = generateFilters(points);

const tripPresenter = new TripPresenter({
  tripEventsContainer: tripEventsElement,
  pointsModel: pointsModel,
});

const filtersView = new FiltersView({
  filters,
  onFilterChange: (filterType) => {
    tripPresenter.updateFilter(filterType);
  }
});

render(filtersView, tripControlsFilters);

tripPresenter.init();
