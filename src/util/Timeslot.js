import { timeCompare } from "./time-utils";
import { days } from "./schedule-utils";

class Timeslot {
    term;
    day;
    hour;
    minute;

    /**
     * @param {string} term 
     * @param {string} day 
     * @param {string} timestr 
     */
    constructor(term, day, timestr) {
        this.term = term;
        this.day = day;
        let s = timestr.split(":");
        this.hour = parseInt(s[0]);
        this.minute = parseInt(s[1]);
    }

    /**
     * @public
     * generate a unique key of the timeslot
     * @returns {string}
     */
    toKey() {
        return this.term + ":" + this.day + ";" + this.toTimeStr();
    }

    /**
     * @public
     * produce the timestr of the current timeslot
     * @returns {string}
     */
    toTimeStr() {
        return this.padZero(this.hour) + ":" + this.padZero(this.minute);
    }

    /**
     * @public
     * set the time of Timeslot to the timestr
     * @param {string} timestr 
     */
    setTime(timestr) {
        let s = timestr.split(":");
        this.hour = parseInt(s[0]);
        this.minute = parseInt(s[1]);
    }

    /**
     * @public
     * advances to the next timeslot
     * @throws if time is not in exact half-hour
     * @throws if the next timeslot is in next day
     */
    next() {
        if (this.minute === 30) {
            ++this.hour;
            this.minute = 0;
        }
        else if (this.minute === 0) {
            this.minute = 30;
        }
        else {
            throw Error("Time not in half-hours.");
        }
        if (this.hour >= 24) {
            throw Error("Time advanced into next day.");
        }
    }

    /**
     * @public
     * advance Timeslot to next day
     */
    nextDay() {
        let i = days.indexOf(this.day);
        if (i === days.length - 1) throw Error("Day advanced into next week.");
        this.day = days[i + 1];
    }

    /**
     * @public
     * whether the current Timeslot represents the timestr
     * @param {string} timestr 
     * @returns {boolean}
     */
    equals(timestr) {
        return timeCompare(this.toTimeStr(), timestr) === 0;
    }

    /**
     * compares the time between this and the given Timeslot
     * @param {Timeslot} ts 
     * @returns {number}
     */
    compareTime(ts) {
        return timeCompare(this.toTimeStr(), ts.toTimeStr());
    }

    /**
     * compares the day between this and the given Timeslot
     * @param {Timeslot} ts 
     * @returns {number}
     */
    compareDay(ts) {
        return days.indexOf(this.day) - days.indexOf(ts.day);
    }

    /**
     * @public
     * generate an array of timeslot key values from this to the given Timeslot, using box selection
     * @param {Timeslot} ts 
     * @returns {Array<string>}
     */
    boxSelectionTo(ts) {
        if (this.term !== ts.term) return [];

        let compTime = this.compareTime(ts);
        let compDay = this.compareDay(ts);
        let startTime, endTime, cur, endDay;
        if (compTime <= 0) {
            startTime = this.toTimeStr();
            endTime = ts.toTimeStr();
        }
        else {
            startTime = ts.toTimeStr();
            endTime = this.toTimeStr();
        }
        if (compDay <= 0) {
            cur = this.copy();
            endDay = ts.day;
        }
        else {
            cur = ts.copy();
            endDay = this.day;
        }
        cur.setTime(startTime);
        let res = [];
        while (true) {
            res.push(cur.toKey());
            if (cur.equals(endTime)) {
                if (cur.day === endDay) break;
                cur.nextDay();
                cur.setTime(startTime);
            }
            else {
                cur.next();
            }
        }
        return res;
    }

    /**
     * make a copy of this timeslot
     * @returns {Timeslot}
     */
    copy() {
        return new Timeslot(this.term, this.day, this.toTimeStr());
    }

    /**
     * adds leading zero if necessary
     * @param {number} d 
     * @returns {string}
     */
    padZero(d) {
        return ((d < 10) ? "0" : "") + d;
    }
}

export default Timeslot;