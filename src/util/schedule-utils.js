import { timeCompare } from './time-utils';
import Timeslot from './Timeslot';

/**
 * Get the minimum and maximum time that appeared in the schedule
 * @param {Object} schedule 
 * @returns {{min: string, max: string}}
 */
export const getTimeRange = (schedule) => {
    let minTime = "09:00";
    let maxTime = "16:30";
    for (let i in schedule) {
        let time = i.split(";")[1];
        if (timeCompare(time, minTime) < 0) {
            minTime = time;
        }
        else if (timeCompare(time, maxTime) > 0) {
            maxTime = time;
        }
    }
    return {min: minTime, max: maxTime};
};
/**
 * Produce an array of timestr at half-hour intervals from min to max
 * @param {{min: string, max: string}} timeRange 
 * @returns {Array}
 */
export const getTimeArray = (timeRange) => {
    let ts = new Timeslot("", "", timeRange.min);
    let res = [];
    while (!ts.equals(timeRange.max)) {
        res.push(ts.toTimeStr());
        ts.next();
    }
    res.push(ts.toTimeStr());
    return res;
};