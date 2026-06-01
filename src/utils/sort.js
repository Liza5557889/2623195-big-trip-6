import {SortType} from '../view/sort-view.js';
import dayjs from 'dayjs';

const sortPoints = {
  [SortType.DAY]: (points) => points.sort((a, b) => dayjs(a.dateFrom).diff(dayjs(b.dateFrom))),
  [SortType.TIME]: (points) => points.sort((a, b) => {
    const durationA = dayjs(a.dateTo).diff(dayjs(a.dateFrom));
    const durationB = dayjs(b.dateTo).diff(dayjs(b.dateFrom));
    return durationB - durationA;
  }),
  [SortType.PRICE]: (points) => points.sort((a, b) => b.basePrice - a.basePrice)
};

export {sortPoints};
