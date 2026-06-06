import TripPresenter from './presenter/trip-presenter.js';
import PointsModel from './model/points-model.js';
import FilterModel from './model/filter-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import PointsApiService from './api/points-api-service.js';

const generateRandomString = () => Math.random().toString(36).substring(2, 15);
const AUTHORIZATION = `Basic ${generateRandomString()}`;
const END_POINT = 'https://24.objects.htmlacademy.pro/big-trip';


const pageHeaderElement = document.querySelector('.page-header');
const tripControlsFilters = pageHeaderElement.querySelector('.trip-controls__filters');
const pageMainElement = document.querySelector('.page-main');
const tripEventsElement = pageMainElement.querySelector('.trip-events');

const pointsApiService = new PointsApiService(END_POINT, AUTHORIZATION);
const pointsModel = new PointsModel({ pointsApiService });
const filterModel = new FilterModel();

const filterPresenter = new FilterPresenter({
  filterContainer: tripControlsFilters,
  filterModel,
  pointsModel,
});

const tripPresenter = new TripPresenter({
  tripEventsContainer: tripEventsElement,
  pointsModel,
  filterModel,
});

filterPresenter.init();
tripPresenter.init();

pointsModel.init();
