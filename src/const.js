const TYPES = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];

const CITIES = ['Amsterdam', 'Geneva', 'Chamonix', 'Paris', 'Berlin', 'Rome', 'Madrid', 'Vienna'];

const DESCRIPTIONS = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Cras aliquet varius magna, non porta ligula feugiat eget.',
  'Fusce tristique felis at fermentum pharetra.',
  'Aliquam id orci ut lectus varius viverra.',
  'Nullam nunc ex, convallis sed finibus eget, sollicitudin eget ante.',
  'Phasellus eros mauris, condimentum sed nibh vitae, sodales efficitur ipsum.',
  'Sed blandit, eros vel aliquam faucibus, purus ex euismod diam, eu luctus nunc ante ut dui.',
  'Sed sed nisi sed augue convallis suscipit in sed felis.',
  'Aliquam erat volutpat.',
  'Nunc fermentum tortor ac porta dapibus.',
  'In rutrum ac purus sit amet tempus.'
];

const OFFERS_BY_TYPE = {
  taxi: [
    { id: 'offer-taxi-1', title: 'Upgrade to a business class', price: 120 },
    { id: 'offer-taxi-2', title: 'Choose the music playlist', price: 30 },
    { id: 'offer-taxi-3', title: 'Choose meal', price: 45 }
  ],
  bus: [
    { id: 'offer-bus-1', title: 'Extra legroom', price: 25 },
    { id: 'offer-bus-2', title: 'WiFi', price: 10 }
  ],
  train: [
    { id: 'offer-train-1', title: 'First class', price: 120 },
    { id: 'offer-train-2', title: 'Meal included', price: 30 },
    { id: 'offer-train-3', title: 'Power outlet', price: 5 }
  ],
  ship: [
    { id: 'offer-ship-1', title: 'Cabin with a view', price: 150 },
    { id: 'offer-ship-2', title: 'Meals included', price: 75 }
  ],
  drive: [
    { id: 'offer-drive-1', title: 'Rent a car', price: 200 },
    { id: 'offer-drive-2', title: 'GPS', price: 50 }
  ],
  flight: [
    { id: 'offer-flight-1', title: 'Add luggage', price: 50 },
    { id: 'offer-flight-2', title: 'Switch to comfort class', price: 80 },
    { id: 'offer-flight-3', title: 'Add meal', price: 15 },
    { id: 'offer-flight-4', title: 'Choose seats', price: 5 }
  ],
  'check-in': [
    { id: 'offer-checkin-1', title: 'Early check-in', price: 50 },
    { id: 'offer-checkin-2', title: 'Late check-out', price: 40 }
  ],
  sightseeing: [
    { id: 'offer-sight-1', title: 'Guide', price: 100 },
    { id: 'offer-sight-2', title: 'Photo session', price: 80 }
  ],
  restaurant: [
    { id: 'offer-rest-1', title: 'Reserve a table', price: 20 },
    { id: 'offer-rest-2', title: 'Special menu', price: 50 }
  ]
};

export {TYPES, CITIES, DESCRIPTIONS, OFFERS_BY_TYPE};
