import {
  format,
  isValid,
  parse,
  startOfDay,
  endOfDay,
  Locale,
  isAfter,
  setHours,
} from 'date-fns';

interface IFormatedDateOpts {
  toFormat?: string;
  setStartOfDay?: boolean;
  setEndOfDay?: boolean;
  setMiddleOfDay?: boolean;
  returnAsDate?: boolean;
  toLocale?: Locale;
}

function validateDate(
  dateStr: string,
  minDate: Date = new Date('0001-01-01'),
): boolean {
  const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
  return isValid(parsedDate) && isAfter(parsedDate, minDate);
}

function formatedDate(
  date: string | Date,
  {
    toFormat,
    setEndOfDay,
    setStartOfDay,
    setMiddleOfDay,
    returnAsDate,
    toLocale,
  }: IFormatedDateOpts = {},
): string | Date {
  const formats = [
    'dd/MM/yyyy',
    'dd-MM-yyyy',
    'yyyy-MM-dd',
    'yyyy/MM/dd',
    "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
    "yyyy-MM-dd'T'HH:mm:ss.SSS",
    'yyyy-MM-dd HH:mm:ss.SSSXXX',
    'yyyy-MM-dd HH:mm:ss.SSS',
    'yyyy-MM-dd HH:mm:ss',
  ];

  if (date instanceof Date) {
    if (isValid(date)) {
      let transformedDate = date;

      if (setStartOfDay) {
        transformedDate = startOfDay(date);
      }

      if (setEndOfDay) {
        transformedDate = endOfDay(date);
      }

      if (setMiddleOfDay) {
        transformedDate = setHours(date, 12);
      }

      return returnAsDate
        ? transformedDate
        : format(date, toFormat || formats[0], {
            locale: toLocale,
          });
    }

    return '';
  }

  for (const curr of formats) {
    const parsedDate = parse(date, curr, new Date());

    if (isValid(parsedDate)) {
      let transformedDate = parsedDate;

      if (setStartOfDay) {
        transformedDate = startOfDay(parsedDate);
      }

      if (setEndOfDay) {
        transformedDate = endOfDay(parsedDate);
      }

      if (setMiddleOfDay) {
        transformedDate = setHours(parsedDate, 12);
      }

      return returnAsDate
        ? transformedDate
        : format(transformedDate, toFormat || formats[0], {
            locale: toLocale,
          });
    }
  }

  return '';
}

function createDateRange(
  startDate: string | Date,
  endDate: string | Date,
): [Date, Date] {
  const start = formatedDate(startDate, {
    setStartOfDay: true,
    returnAsDate: true,
  });

  const end = formatedDate(endDate, {
    setEndOfDay: true,
    returnAsDate: true,
  });

  return [start as Date, end as Date];
}

export const DateUtils = {
  validateDate,
  formatedDate,
  createDateRange,
};
