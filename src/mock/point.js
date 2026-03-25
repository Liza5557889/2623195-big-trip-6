import {getRandomArrayElement, getRandomInteger} from '../utils.js';
import {TYPES, CITIES, DESCRIPTIONS, OFFERS_BY_TYPE} from '../const.js';

const generateId = () => Date.now() + Math.random();

const generateDestination = () => ({
  id: generateId(),
  name: getRandomArrayElement(CITIES),
  description: Array.from({length: getRandomInteger(1, 3)},
    () => getRandomArrayElement(DESCRIPTIONS)).join(' '),
  pictures: Array.from({length: getRandomInteger(1, 3)}, () => ({
    src: `https://loremflickr.com/248/152?random=${Math.random()}`,
    description: 'Random photo'
  }))
});

const generatePoint = (destinations) => {
  const type = getRandomArrayElement(TYPES);
  const destination = getRandomArrayElement(destinations);

  const offersForType = OFFERS_BY_TYPE[type] || [];

  const selectedOffers = offersForType
    .filter(() => Math.random() > 0.5)
    .map((offer) => offer.id);

  return {
    id: generateId(),
    type,
    destination: destination.id,
    dateFrom: new Date(Date.now() + getRandomInteger(0, 7) * 24 * 60 * 60 * 1000),
    dateTo: new Date(Date.now() + getRandomInteger(1, 8) * 24 * 60 * 60 * 1000),
    basePrice: getRandomInteger(20, 200),
    offers: selectedOffers,
    isFavorite: Math.random() > 0.5
  };
};

const generatePoints = (count) => {
  const destinations = Array.from({length: 5}, generateDestination);

  const points = Array.from({length: count}, () => generatePoint(destinations));

  return {points, destinations};
};

export {generatePoints};
