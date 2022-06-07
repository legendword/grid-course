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
    let ts = new Timeslot(null, null, timeRange.min);
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
};
/**
 * Whether the section can be added to schedule.
 * @param {object} section 
 * @param {object} schedule 
 * @returns {boolean}
 */
 export const canAddToSchedule = (section, schedule) => {
    for (let day of section.days) {
        let ts = new Timeslot(section.term, day, section.start_time);
        while (!ts.equals(section.end_time)) {
            let key = ts.toKey();
            if (schedule[key]) return false;
            ts.next();
        }
    }
    return true;
};
/**
 * Add the section to schedule, or false if failed.
 * @param {object} section 
 * @param {object} schedule 
 * @returns {Object|boolean} the new schedule, or false
 */
export const addToSchedule = (section, schedule) => {
    let res = {...schedule};
    for (let day of section.days) {
        let ts = new Timeslot(section.term, day, section.start_time);

        let firstKey = ts.toKey();
        if (res[firstKey]) return false;
        res[firstKey] = section; // store the entire seciton object for first timeslot
        ts.next();
        let span = 1; // number of timeslots the section spans

        while (!ts.equals(section.end_time)) {
            let key = ts.toKey();
            if (res[key]) return false;
            res[key] = section.id; // store only the section id for subsequent timeslots
            ++span;
            ts.next();
        }
        res[firstKey].span = span; // for rendering Schedule table
    }
    return res;
};
/**
 * Remove the section from schedule, or false if failed.
 * @param {object} section 
 * @param {object} schedule 
 * @returns {Object|boolean} the new schedule, or false
 */
 export const removeFromSchedule = (section, schedule) => {
    let res = {...schedule};
    for (let day of section.days) {
        let ts = new Timeslot(section.term, day, section.start_time);

        let firstKey = ts.toKey();
        if (!res[firstKey] || !(typeof res[firstKey]) === "object" || res[firstKey].id !== section.id) return false;
        delete res[firstKey];
        ts.next();

        while (!ts.equals(section.end_time)) {
            let key = ts.toKey();
            if (!res[key]) return false;
            delete res[key];
            ts.next();
        }
    }
    return res;
};