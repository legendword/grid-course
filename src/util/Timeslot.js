import { timeCompare } from "./time-utils";

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
     * whether the current Timeslot represents the timestr
     * @param {string} timestr 
     * @returns {boolean}
     */
    equals(timestr) {
        return timeCompare(this.toTimeStr(), timestr) === 0;
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