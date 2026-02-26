import dayjs from 'dayjs';

const DATE_FORMAT = 'MMM D';
const TIME_FORMAT = 'HH:mm';

function getRandomArrayElement(items) {
  return items[Math.floor(Math.random() * items.length)];
}

// Добавляем недостающую функцию
function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function humanizePointDate(date) {
  return date ? dayjs(date).format(DATE_FORMAT) : '';
}

function humanizePointTime(date) {
  return date ? dayjs(date).format(TIME_FORMAT) : '';
}

function getDuration(dateFrom, dateTo) {
  const start = dayjs(dateFrom);
  const end = dayjs(dateTo);
  const diff = end.diff(start, 'minute');

  if (diff < 60) {
    return `${diff}M`;
  } else if (diff < 1440) {
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}H ${minutes}M`;
  } else {
    const days = Math.floor(diff / 1440);
    const hours = Math.floor((diff % 1440) / 60);
    const minutes = diff % 60;
    return `${days}D ${hours}H ${minutes}M`;
  }
}

function isPointFuture(dateFrom) {
  return dayjs().isBefore(dateFrom);
}

function isPointPast(dateTo) {
  return dayjs().isAfter(dateTo);
}

function isPointPresent(dateFrom, dateTo) {
  return dayjs().isAfter(dateFrom) && dayjs().isBefore(dateTo);
}

export {
  getRandomArrayElement,
  getRandomInteger,
  humanizePointDate,
  humanizePointTime,
  getDuration,
  isPointFuture,
  isPointPast,
  isPointPresent
};
