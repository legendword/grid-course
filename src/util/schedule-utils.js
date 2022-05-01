import { timeCompare } from './time-utils';
import Timeslot from './Timeslot';

export const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Get the minimum and maximum time that appeared in the list of courses
 * @param {Array} courses 
 * @returns {{min: string, max: string}}
 */
export const getCourseTimeRange = (courses) => {
    let minTime = "09:00";
    let maxTime = "16:30";
    for (let course of courses) {
        for (let section of course.sections) {
            if (timeCompare(section.start_time, minTime) < 0) {
                minTime = section.start_time;
            }
            else if (timeCompare(section.end_time, maxTime) > 0) {
                maxTime = section.end_time;
            }
        }
    }
    return {min: minTime, max: maxTime};
};
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
/**
 * Returns course sections distributed into terms, for term preference selection
 * @param {Array} courses 
 * @returns
 */
export const getTermDistribution = (courses) => {
    let res = [];
    for (let course of courses) {
        let term1sections = [];
        let term2sections = [];
        for (let section of course.sections) {
            if (section.term === "1") {
                term1sections.push(section);
            }
            else { // todo: year-round sections (term === "1-2")
                term2sections.push(section);
            }
        }
        let termChoices = [];
        if (term1sections.length > 0) termChoices.push("1");
        if (term2sections.length > 0) termChoices.push("2");
        if (termChoices.length === 0) console.error(course.id, 'has no sections in either term');
        let c = {
            id: course.id,
            termChoices,
            term: termChoices[0],
            sections: {
                "1": term1sections,
                "2": term2sections
            }
        };
        res.push(c);
    }
    return res;
}