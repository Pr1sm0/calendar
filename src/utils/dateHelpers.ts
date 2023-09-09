import { endOfMonth, format, getDate, getDay, getDaysInMonth, isToday, startOfMonth } from 'date-fns';

import { IDay, IHoliday } from './interfaces';

const TOTAL_CELLS_COUNT = 7 * 6;

const createDayData = (
  year: number,
  month: number,
  dayOfMonth: number,
  isCurrentMonth: boolean,
  holidays: IHoliday[],
): IDay => {
  const dayOfWeek = getDay(new Date(year, month, dayOfMonth));
  const currentDate = format(new Date(year, month, dayOfMonth), 'yyyy-MM-dd');
  const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

  return {
    date: currentDate,
    dayOfWeek,
    dayOfMonth,
    isCurrentMonth,
    isWeekend: dayOfWeek === 6 || dayOfWeek === 0,
    isToday: isToday(new Date(year, month, dayOfMonth)),
    holidays:
      holidays
        .filter((holiday) => holiday.date === currentDate)
        ?.map(({ name, countryCode }) => `${name} - ${regionNames.of(countryCode)}`) || [],
  };
};

const createDaysForCurrentMonth = (year: number, month: number, holidays: IHoliday[]) => {
  return [...Array(getDaysInMonth(new Date(year, month)))].map((day, index) => {
    return createDayData(year, month, index + 1, true, holidays);
  });
};

const createDaysForPreviousMonth = (year: number, month: number, holidays: IHoliday[]) => {
  const firstDayOfMonth = startOfMonth(new Date(year, month));
  const firstDayOfTheMonthWeekday = getDay(firstDayOfMonth) || 7;

  const prevMonthDays = [];

  // When adding negative number in new Date(year, month, negativeNumber), it returns days from prev month
  const indexOfFirstVisibleDayFromPrevMonth = -1 * (firstDayOfTheMonthWeekday - 2);

  for (let i = indexOfFirstVisibleDayFromPrevMonth; i <= 0; i++) {
    const dateInPrevMonth = getDate(new Date(year, month, i));
    prevMonthDays.push(createDayData(year, month - 1, dateInPrevMonth, false, holidays));
  }

  return prevMonthDays;
};

const createDaysForNextMonth = (year: number, month: number, holidays: IHoliday[]) => {
  const lastDayOfMonth = endOfMonth(new Date(year, month));
  const lastDayOfTheMonthWeekday = getDay(lastDayOfMonth) || 7;

  const nextMonthDays = [];

  // Number of next month days to complete the last week of the selected month
  const numberOfDaysLeftInLastWeekOfSelectedMonth = 7 - lastDayOfTheMonthWeekday;

  for (let i = 1; i <= numberOfDaysLeftInLastWeekOfSelectedMonth; i++) {
    nextMonthDays.push(createDayData(year, month + 1, i, false, holidays));
  }

  return nextMonthDays;
};

export const createDaysForCalendarView = (year: number, month: number, holidays: IHoliday[]): IDay[] => {
  const combinedDays: IDay[] = [
    ...createDaysForPreviousMonth(year, month, holidays),
    ...createDaysForCurrentMonth(year, month, holidays),
    ...createDaysForNextMonth(year, month, holidays),
  ];

  // Here we check if extra days from next month are needed to complete the grid view and keep it always 42 cells
  // 7 columns x 6 rows
  if (combinedDays.length < TOTAL_CELLS_COUNT) {
    const lastDateInArray = combinedDays[combinedDays.length - 1].dayOfMonth;

    let nextDate = getDate(new Date(year, month, lastDateInArray + 1));
    for (let i = combinedDays.length; i < TOTAL_CELLS_COUNT; i++) {
      combinedDays.push(createDayData(year, month + 1, nextDate, false, holidays));
      nextDate++;
    }
  }

  return combinedDays;
};
