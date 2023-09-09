export interface IHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[];
  launchYear: number;
  types: string[];
}

export interface IDay {
  date: string;
  dayOfWeek: 0 | 1 | 2 | 4 | 3 | 5 | 6;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  isToday: boolean;
  holidays: string[];
}

export interface ILabel {
  id: string;
  text: string;
  color: string;
}

export interface ITask {
  id: string;
  text: string;
  labels: ILabel[];
}
