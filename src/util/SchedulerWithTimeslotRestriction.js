import Timeslot from './Timeslot';

class Scheduler {
    schedules;

    constructor() {
        this.schedules = null;
    }

    /**
     * @public
     * Produces all possible schedules (stored in this.schedules)
     * @param {Array} courses
     */
    generateAllSchedules(courses, allowedTimeslots) {
        this.schedules = [];
        this.allowedTimeslots = allowedTimeslots;
        this.worklist = this.generateWorklist(courses);
        this.scheduleCourse(0, {});
        return this.schedules;
    }

    /**
     * Generates the worklist for search.
     * @param {Array} courses 
     * @returns {Array} 
     */
    generateWorklist(courses) {
        let worklist = [];
        for (let course of courses) {
            let sectionsByType = {};
            for (let section of course.sections) {
                if (sectionsByType[section.type]) {
                    sectionsByType[section.type].push(section);
                }
                else {
                    sectionsByType[section.type] = [section];
                }
            }
            worklist.push(Object.values(sectionsByType));
        }
        return worklist;
    }

    /**
     * Schedule a course (from the nth position in worklist)
     * @param {number} n 
     * @param {Object} schedule 
     * @returns {null}
     */
    scheduleCourse(n, schedule) {
        if (this.schedules.length >= 1000) return;
        if (n >= this.worklist.length) {
            this.schedules.push(schedule);
            // console.log(this.schedules.length);
            if (this.schedules.length === 1000) {
                console.warn('Too many possible schedules; limiting result to 1000 schedules only.');
            }
            return;
        }
        this.scheduleCourseSections(n, this.worklist[n], schedule);
    }

    scheduleCourseSections(n, sectionsByType, schedule) {
        if (sectionsByType.length === 0) {
            this.scheduleCourse(n + 1, schedule);
            return;
        }
        let sbt = [...sectionsByType];
        let sections = sbt.pop();
        for (let section of sections) {
            let nschedule = this.addTo(section, schedule);
            if (nschedule === false) continue;
            // console.log('scheduleCourseSections', n, section, sbt, schedule, nschedule);
            this.scheduleCourseSections(n, sbt, nschedule);
        }
    }

    /**
     * Add the section to schedule, or false if failed.
     * @param {object} section 
     * @param {object} schedule 
     * @returns {Object|boolean} the new schedule, or false
     */
    addTo(section, schedule) {
        let res = {...schedule};
        for (let day of section.days) {
            let ts = new Timeslot(section.term, day, section.start_time);

            let firstKey = ts.toKey();
            if (res[firstKey] || !this.allowedTimeslots.includes(firstKey)) return false;
            res[firstKey] = section; // store the entire seciton object for first timeslot
            ts.next();
            let span = 1; // number of timeslots the section spans

            while (!ts.equals(section.end_time)) {
                let key = ts.toKey();
                if (res[key] || !this.allowedTimeslots.includes(firstKey)) return false;
                res[key] = section.id; // store only the section id for subsequent timeslots
                ++span;
                ts.next();
            }
            res[firstKey].span = span; // for rendering Schedule table
        }
        return res;
    }
}

export default Scheduler;