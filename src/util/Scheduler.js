import Timeslot from './Timeslot';

class Scheduler {
    courses;
    schedules;

    constructor(courses) {
        this.courses = courses;
        this.schedules = null;
    }

    /**
     * @todo
     * @public
     * @param {Object} schedule 
     * Generates an object with the start time as key, end time and section info as value, for frontend display.
     */
    generateDisplay(schedule) {

    }

    /**
     * @public
     * Produces all possible schedules (stored in this.schedules)
     */
    generateAllSchedules() {
        this.schedules = [];
        this.worklist = this.generateWorklist();
        this.scheduleCourse(0, {});
        console.log(this.schedules);
    }

    /**
     * Generates the worklist for search.
     * @returns {Array} 
     */
    generateWorklist() {
        let worklist = [];
        for (let course of this.courses) {
            let sectionsByTerm = {};
            for (let section of course.sections) {
                if (sectionsByTerm[section.term]) {
                    sectionsByTerm[section.term].push(section);
                }
                else {
                    sectionsByTerm[section.term] = [section];
                }
            }
            let worklistSections = {};
            for (let term in sectionsByTerm) {
                let sectionsByType = {};
                for (let section of sectionsByTerm[term]) {
                    if (sectionsByType[section.type]) {
                        sectionsByType[section.type].push(section);
                    }
                    else {
                        sectionsByType[section.type] = [section];
                    }
                }
                worklistSections[term] = Object.values(sectionsByType);
            }
            worklist.push(worklistSections);
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
        if (n >= this.worklist.length) {
            this.schedules.push(schedule);
            return;
        }
        let courseSectionsByTerm = this.worklist[n];
        for (let term in courseSectionsByTerm) {
            this.scheduleCourseSections(n, courseSectionsByTerm[term], schedule);
        }
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

            let key = ts.toKey();
            if (res[key]) return false;
            res[key] = section; // store the entire seciton object for first timeslot
            ts.next();

            while (!ts.equals(section.end_time)) {
                let key = ts.toKey();
                if (res[key]) return false;
                res[key] = section.id; // store only the section id for subsequent timeslots
                ts.next();
            }
        }
        return res;
    }
}

export default Scheduler;