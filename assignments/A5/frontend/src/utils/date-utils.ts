/**
 * @param s date string in format yyyy-MM-dd
 * @return the parsed date object
 */
function dateFromString(s: string): Date {
    const parts = s.split('-');
    return new Date(+parts[0], +parts[1] - 1, +parts[2]);
}

/**
 * @param d date object to be formatted
 * @return the date string in format yyyy-MM-dd
 */
function dateToString(d: Date): string {
    // yyyy-MM-dd
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const monthStr = month < 10 ? '0' + month : '' + month;
    const dayStr = day < 10 ? '0' + day : '' + day;
    return d.getFullYear() + '-' + monthStr + '-' + dayStr;
}

export { dateFromString, dateToString };
