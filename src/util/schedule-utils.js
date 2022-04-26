import { timeCompare } from './time-utils';
import Timeslot from './Timeslot';

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
    console.log(minTime, maxTime);
    return {min: minTime, max: maxTime};
};
export const getTimeArray = (timeRange) => {
    let ts = new Timeslot("", "", timeRange.min);
    let res = [];
    while (!ts.equals(timeRange.max)) {
        res.push(ts.toTimeStr());
        ts.next();
    }
    return res;
};