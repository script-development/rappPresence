// Date helper functions with format: 'yyyy-mm-dd'

/**
 * @param {Date} date
 * @returns {string}
 */
export const dateToString = date => {
    const [month, day, year] = [date.getMonth() + 1, date.getDate(), date.getFullYear()];
    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
};

export const yesterday = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return dateToString(date);
};

/**
 * @param {string} date
 * @param {number} amount days to add or subtract
 */
export const addOrSubtractDays = (date, amount) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + amount);
    return dateToString(newDate);
};

/** @param {string} date */
export const date2Slug = date => date.split('-').join('');

/** @param {string} slug */
export const slug2Date = slug => {
    const slices = [];
    slices.push(slug.slice(0, 4)); // year
    slices.push(slug.slice(4, 6)); // month
    slices.push(slug.slice(6, 8)); // day
    return slices.join('-');
};
