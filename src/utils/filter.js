import dayjs from 'dayjs';
import {FilterType} from '../const.js';

const filter = {
  [FilterType.EVERYTHING]: (points) => [...points],
  [FilterType.FUTURE]: (points) => points.filter((point) => dayjs(point.dateFrom).isAfter(dayjs(), 'day')),
  [FilterType.PRESENT]: (points) => points.filter((point) =>
    dayjs(point.dateFrom).isSame(dayjs(), 'day') ||
    (dayjs(point.dateFrom).isBefore(dayjs()) && dayjs(point.dateTo).isAfter(dayjs()))
  ),
  [FilterType.PAST]: (points) => points.filter((point) => dayjs(point.dateTo).isBefore(dayjs(), 'day'))
};

function generateFilters(points) {
  return Object.values(FilterType).map((type) => ({
    type,
    count: filter[type](points).length
  }));
}

export {filter, generateFilters};
