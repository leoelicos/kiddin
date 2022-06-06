/*
 * Just Kidding
 * utils/helpers.js
 * This script contains function which format a UNIX date into strings with weekdays, years, months and days
 * Copyright 2022 Alicia Santidrian, Jess Huang, Leo Wong
 */

module.exports = {
  // Format date as DD/MM/YYYY
  format_date: (date) => {
    return date.toLocaleDateString();
  },
  // Format date as DDDD, DD/MM/YYYY
  format_date_long: (date) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString(undefined, options);
  },
};
