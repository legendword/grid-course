/**
 * Main algorithm for generating GridCourse tables
 */
import { timeCompare, timeMax, timeMin } from "./time-utils";
import Timeslot from "./Timeslot";

const days = {
    mwf: ["Mon", "Wed", "Fri"],
    tt: ["Tue", "Thu"],
};
export const tableTitles = ["Term 1 MWF", "Term 1 TT", "Term 2 MWF", "Term 2 TT", "Other"];
// each header's index corresponds to the decimal representation of the binary values of the 4 tables combinations
const headers = [
    "No Sections", "Term 2 TT ONLY", "Term 2 MWF ONLY", "Term 2", "Term 1 TT ONLY", "Term 1 TT, Term 2 TT", "Term 1 TT, Term 2 MWF", "Term 1 TT, Term 2", "Term 1 MWF ONLY", "Term 1 MWF, Term 2 TT", "Term 1 MWF, Term 2 MWF", "Term 1 MWF, Term 2", "Term 1", "Term 1, Term 2 TT", "Term 1, Term 2 MWF", "All Available",
];

const generateHeader = (a, b, c, d, e) => {
    return headers[d + c * 2 + b * 4 + a * 8] + (e ? " (has other sections)" : "");
};

const generateCardIds = (table, minTime, maxTime) => {
    let cardId = 0;
    let ts = new Timeslot(null, null, minTime);
    while (!ts.equals(maxTime)) {
        const key = ts.toKey();
        if (table[key] && table[key] !== true) {
            table[key].id = cardId++;
        }
        ts.next();
    }
    return table;
};

const transformTables = (tables) => {
    const res = {
        tables: [],
        minTimes: [],
        maxTimes: [],
    };
    for (const table of tables) {
        let resTable = {}, minTime = "9:00", maxTime = "16:30";
        for (const section of table) {
            let ts = new Timeslot(null, null, section.start_time);

            const firstKey = ts.toKey();
            if (resTable[firstKey]) {
                if (!resTable[firstKey].first) throw Error("existing object in firstKey is not first");
                resTable[firstKey].sections.push(section);
                // TODO: edge cases of A) two sections same start_time diff end_time; or B) two sections, one MW only, one WT only
                continue;
            }
            resTable[firstKey] = {
                first: true,
                sections: [section]
            };
            if (timeCompare(firstKey, minTime) < 0) {
                minTime = firstKey;
            }
            ts.next();
            let span = 1; // number of timeslots the section spans

            while (!ts.equals(section.end_time)) {
                const key = ts.toKey();
                resTable[key] = true; // store true to not render anything for subsequent timeslots
                ++span;
                ts.next();
            }
            const lastKey = ts.toKey();
            if (timeCompare(lastKey, maxTime) > 0) {
                maxTime = lastKey;
            }
            resTable[firstKey].span = span; // for rendering table
        }
        res.tables.push(generateCardIds(resTable, minTime, maxTime));
        res.minTimes.push(minTime);
        res.maxTimes.push(maxTime);
    }
    return res;
};

export const generateTables = (courses = []) => {
    const res = {
        hasOther: false,
        times: [
            {min: "9:00", max: "16:30"},
            {min: "9:00", max: "16:30"},
            {min: "9:00", max: "16:30"},
            {min: "9:00", max: "16:30"},
            {min: "9:00", max: "16:30"},
        ],
        courses: {},
    };
    for (const course of courses) {
        // t1mwf, t1tt, t2mwf, t2tt, other
        const sections = course.sections.filter(section => section.type === "Lecture");
        if (sections.length === 0) {
            // course has no lectures
            const { tables, minTimes, maxTimes } = transformTables([[], [], [], [], course.sections]);
            res.times[4].min = timeMin(res.times[4].min, minTimes[4]);
            res.times[4].max = timeMax(res.times[4].max, maxTimes[4]);
            res.courses[course.id] = {
                header: "No Lectures",
                tables,
            };
            res.hasOther = true;
            continue;
        }
        const tableSections = [[], [], [], [], []];
        for (const section of sections) {
            if (section.days.length === 0) {
                tableSections[4].push(section);
                res.hasOther = true;
                continue;
            }
            let mwf = false, tt = false, other = false;
            for (const day of section.days) {
                if (days.mwf.includes(day)) mwf = true;
                else if (days.tt.includes(day)) tt = true;
                else {
                    other = true;
                    break;
                }
            }
            if (other || (mwf && tt) || (!mwf && !tt)) {
                tableSections[4].push(section);
                res.hasOther = true;
                continue;
            }
            let tableIndex;
            if (section.term == "1") tableIndex = 0;
            else if (section.term === "2") tableIndex = 2;
            else {
                tableIndex = 4;
                res.hasOther = true;
            }
            if (tableIndex !== 4 && tt) tableIndex++;
            tableSections[tableIndex].push(section);
        }
        const { tables, minTimes, maxTimes } = transformTables(tableSections);
        res.courses[course.id] = {
            header: generateHeader(...tableSections.map(v => v.length === 0 ? 0 : 1)),
            tables,
        };
        for (let i = 0; i < minTimes.length; i++) {
            res.times[i].min = timeMin(res.times[i].min, minTimes[i]);
            res.times[i].max = timeMax(res.times[i].max, maxTimes[i]);
        }
    }
    return res;
};
