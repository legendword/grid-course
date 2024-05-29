// ==UserScript==
// @name         UBC Workday Schedule Crawler
// @description  Crawl UBC Workday for course schedules
// @version      1.0
// @match        https://wd10.myworkday.com/ubc/d/faceted-search2/*
// @grant        GM_log
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-idle
// ==/UserScript==

const exampleCourse = {
  id: "ACAM 390A",
  subject: "ACAM",
  course: "390A",
  sections: [
    {
      section: "001",
      id: "ACAM 390A 001",
      type: "Lecture",
      term: "2",
      delivery: "In-Person",
      days: ["Mon", "Tue", "Wed", "Thu"],
      start_time: "9:00",
      end_time: "13:00",
    },
  ],
};

let courseMap = {};
let visited = {};
let failedVisited = {};
let emptyVisited = {};
let justVisited = {}; // visited in the current run (will not be affected by the tryFailed flag)
let textArea = null;

// flags:
const resetStored = false;
const tryFailed = true; // try failed visited sections again

// helpers:
function parseTitle(titleString) {
  const [code, name] = titleString.split(" - ");
  const [rawSubject, rawCourseId] = code.split(" ");
  let course, section;
  if (rawCourseId.includes("_")) {
    let rawCourse;
    [rawCourse, section] = rawCourseId.split("_");
    course = rawCourse.replaceAll("-", "");
  } else {
    [course, section] = rawCourseId.split("-");
  }
  const subject = rawSubject.substring(0, rawSubject.length - 2);
  const courseId = `${subject} ${course}`;
  return {
    course: {
      subject: subject,
      course: course,
      id: courseId,
      name: name,
    },
    section: {
      section: section,
      id: `${courseId} ${section}`,
    },
  };
}
function parseTime(rawTime) {
  // assuming no section starts / ends at 12:00 am; simplifies things
  const [value, ampm] = rawTime.split(" ");
  if (ampm === "p.m.") {
    const [hour, minutes] = value.split(":");
    if (hour === "12") {
      return value;
    }
    return `${parseInt(hour) + 12}:${minutes}`;
  }
  return value;
}
function parseDetails(subheaderString, detailsString) {
  const [type, status, delivery, rawCredits] = subheaderString.split("   |   ");
  let room = null;
  let rawDays = null;
  let rawTime = null;
  let rawDateRange = null;
  const detailsStringSplit = detailsString.split(" | ");
  if (detailsStringSplit.length === 3) {
    [rawDays, rawTime, rawDateRange] = detailsStringSplit;
  } else {
    [room, rawDays, rawTime, rawDateRange] = detailsString.split(" | ");
  }
  const [rawStartTime, rawEndTime] = rawTime.split(" - ");
  const term = rawDateRange.includes("2024-") ? "1" : "2";
  return {
    type: type,
    delivery: delivery,
    room: room,
    days: rawDays.split(" "),
    start_time: parseTime(rawStartTime),
    end_time: parseTime(rawEndTime),
    credits: rawCredits.split(" ")[0],
    term: term,
  };
}

function onDocumentChange() {
  GM_log("Document change handler");
  const courseBlocks = document.querySelectorAll(
    "[data-automation-id=compositeContainer]"
  );
  for (const courseBlock of courseBlocks) {
    const titleString = courseBlock.querySelector(
      "[data-automation-id=compositeHeader] [data-automation-id=promptOption]"
    ).textContent;
    const courseSection = parseTitle(titleString);
    if (visited[courseSection.section.id]) {
      if (!tryFailed || !failedVisited[courseSection.section.id] || justVisited[courseSection.section.id]) {
        continue;
      }
      delete failedVisited[courseSection.section.id];
      GM_log("Retrying section " + courseSection.section.id);
    }
    GM_log(courseSection.section.id);
    const subheaderString = courseBlock.querySelector(
      "[data-automation-id=compositeSubHeaderOne]"
    ).textContent;
    const detailsString = courseBlock.querySelector(
      "[data-automation-id=compositeDetailPreview] [data-automation-id=responsiveMonikerInput]"
    ).textContent;
    let sectionDetails = null;

    if (detailsString === "(empty)") {
      GM_log("Empty details for " + courseSection.section.id);
      visited[courseSection.section.id] = true;
      emptyVisited[courseSection.section.id] = true;
      justVisited[courseSection.section.id] = true;
      continue;
    }

    try {
      sectionDetails = parseDetails(subheaderString, detailsString);
    } catch (e) {
      GM_log("Error parsing details for " + courseSection.section.id, e.message);
      visited[courseSection.section.id] = true;
      failedVisited[courseSection.section.id] = true;
      justVisited[courseSection.section.id] = true;
      continue;
    }

    const section = {
      ...courseSection.section,
      ...sectionDetails,
    };
    if (!courseMap[courseSection.course.id]) {
      courseMap[courseSection.course.id] = {
        ...courseSection.course,
        sections: [],
      };
    }
    courseMap[courseSection.course.id].sections.push(section);
    if (failedVisited[courseSection.section.id]) {
      GM_log("Retry of section " + courseSection.section.id + " succeeded", section);
    }
    visited[courseSection.section.id] = true;
    justVisited[courseSection.section.id] = true;
  }
  updateUI();
}

function updateUI() {
  textArea.value = JSON.stringify(Object.values(courseMap), null, 0);
  GM_setValue("courseMap", JSON.stringify(courseMap));
  GM_setValue("visited", JSON.stringify(visited));
  GM_setValue("failedVisited", JSON.stringify(failedVisited));
  GM_setValue("emptyVisited", JSON.stringify(emptyVisited));
  GM_log("UI updated. Total visited sections: " + Object.values(visited).length + "; Total failed visited sections: " + Object.values(failedVisited).length + "; Total empty visited sections: " + Object.values(emptyVisited).length + ".");
}

(function () {
  "use strict";

  GM_log("UBC Workday Schedule Crawler loaded");

  if (resetStored) {
    GM_setValue("courseMap", null);
    GM_setValue("visited", null);
    GM_setValue("failedVisited", null); 
    GM_setValue("emptyVisited", null);
    GM_log("Stored data reset");
  }
  const storedCourseMap = GM_getValue("courseMap");
  if (storedCourseMap) {
    courseMap = JSON.parse(storedCourseMap);
  }
  const storedVisited = GM_getValue("visited");
  if (storedVisited) {
    visited = JSON.parse(storedVisited);
  }
  const storedFailedVisited = GM_getValue("failedVisited");
  if (storedFailedVisited) {
    failedVisited = JSON.parse(storedFailedVisited);
  }
  const storedEmptyVisited = GM_getValue("emptyVisited");
  if (storedEmptyVisited) {
    emptyVisited = JSON.parse(storedEmptyVisited);
  }

  textArea = document.createElement("textarea");
  textArea.style.position = "fixed";
  textArea.style.top = "0";
  textArea.style.right = "0";
  textArea.style.width = "300px";
  textArea.style.height = "100px";
  textArea.style.zIndex = "1000";
  document.body.appendChild(textArea);
  updateUI();

  let observerTimer = null;

  const documentObserver = new MutationObserver((mutations) => {
    GM_log("Document changed");
    if (observerTimer) {
      clearTimeout(observerTimer);
    }
    observerTimer = setTimeout(onDocumentChange, 500);
  });
  documentObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
