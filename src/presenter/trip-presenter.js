import SortView from '../view/sort-view.js';
import EditFormView from '../view/edit-form-view.js';
import RoutePointView from '../view/point-view.js';
import {render, RenderPosition} from '../render.js';

export default class TripPresenter {
  sortComponent = new SortView();

  constructor({tripEventsContainer, pointsModel}) {
    this.tripEventsContainer = tripEventsContainer;
    this.pointsModel = pointsModel;
  }

  init() {
    this.boardPoints = [...this.pointsModel.getPoints()];

    this.tripEventsContainer.innerHTML = '';

    render(this.sortComponent, this.tripEventsContainer, RenderPosition.AFTERBEGIN);

    if (this.boardPoints.length > 0) {
      const firstPoint = this.boardPoints[0];
      const pointOffers = this.pointsModel.getOffersByType(firstPoint.type);

      render(
        new EditFormView({
          point: firstPoint,
          destinations: this.pointsModel.getDestinations(),
          offers: pointOffers
        }),
        this.tripEventsContainer
      );
    }

    for (let i = 1; i < this.boardPoints.length; i++) {
      const point = this.boardPoints[i];
      const destination = this.pointsModel.getDestinationById(point.destination);
      const pointOffers = this.pointsModel.getOffersByType(point.type);

      render(
        new RoutePointView({
          point,
          destination,
          offers: pointOffers
        }),
        this.tripEventsContainer
      );
    }
  }
}
