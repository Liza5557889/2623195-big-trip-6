import AbstractView from '../framework/view/abstract-view.js';

function createEmptyPointsTemplate() {
  return `
    <p class="trip-events__msg">
      Click New Event to create your first point
    </p>
  `;
}

export default class EmptyPointsView extends AbstractView {
  get template() {
    return createEmptyPointsTemplate();
  }
}
