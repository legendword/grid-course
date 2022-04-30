<template>
    <div class="home">
        <v-stepper v-model="step" flat>
            <v-stepper-header>
                <v-stepper-step :complete="step > 1" step="1">Select Courses</v-stepper-step>
                <v-divider />
                <v-stepper-step :complete="step > 2" step="2">Set Preferences</v-stepper-step>
                <v-divider />
                <v-stepper-step :complete="step > 3" step="3">Finalize Timetables</v-stepper-step>
            </v-stepper-header>
            <v-stepper-items>
                <v-stepper-content step="1">
                    <div class="session-select">
                        <v-select :items="sessions" label="Session" solo v-model="session" />
                    </div>
                    <v-container class="min-height">
                        <v-row>
                            <v-col cols="3">
                                <v-autocomplete class="my-2" :items="courses" return-object item-text="id" editable height="50px" label="Add Courses..." :value="courseToAdd" @input="addCourse($event)" />
                                <v-subheader>Selected Courses ({{ selectedCourses.length }})</v-subheader>
                                <div v-if="selectedCourses.length === 0">
                                    <v-subheader>No selected courses.</v-subheader>
                                </div>
                                <v-list v-else>
                                    <v-list-item-group v-model="cur" color="primary">
                                        <v-list-item v-for="(course, ind) in selectedCourses" :key="ind">
                                            <v-list-item-content>
                                                <v-list-item-title>{{ course.subject }} {{ course.course }}</v-list-item-title>
                                            </v-list-item-content>
                                            <v-list-item-action>
                                                <v-btn icon @click="removeCourse(ind)">
                                                    <v-icon dense color="grey lighten-1">mdi-close</v-icon>
                                                </v-btn>
                                            </v-list-item-action>
                                        </v-list-item>
                                    </v-list-item-group>
                                </v-list>
                            </v-col>
                            <v-col cols="9">
                                <div v-if="cur !== null && selectedCourses[cur]">
                                    <h2>{{ selectedCourses[cur].id }}</h2>
                                    <v-subheader>Sections ({{ selectedCourses[cur].sections.length }})</v-subheader>
                                    <v-data-table v-model="selectedSections" :headers="headers" :items="selectedCourses[cur].sections" show-select :single-select="false" class="elevation-1" />
                                </div>
                            </v-col>
                        </v-row>
                    </v-container>
                    <div>
                        <v-btn color="primary" @click="nextStep(2)">Continue</v-btn>
                        <v-btn color="secondary" disabled text class="ml-3">Back</v-btn>
                    </div>
                </v-stepper-content>
                <v-stepper-content step="2">
                    <v-container class="min-height">
                        <v-row>
                            <v-col v-if="!toggleTimeslotTable" cols="6">
                                <div class="text-h6 my-5 text-center">Choose Preferred Term</div>
                                <v-list>
                                    <v-list-item v-for="course in preferences.courseTerms" :key="course.id">
                                        <v-list-item-content>
                                            <v-list-item-title>{{ course.id }}</v-list-item-title>
                                        </v-list-item-content>
                                        <v-list-item-action>
                                            <v-btn-toggle v-model="course.term" mandatory color="primary" borderless>
                                                <v-btn :disabled="!course.termChoices.includes('1')" value="1">Term 1</v-btn>
                                                <v-btn :disabled="!course.termChoices.includes('2')" value="2">Term 2</v-btn>
                                            </v-btn-toggle>
                                        </v-list-item-action>
                                    </v-list-item>
                                </v-list>
                            </v-col>
                            <v-col v-if="toggleTimeslotTable">
                                <div class="text-h6 my-5 text-center">Choose Preferred Timeslot</div>
                                <timeslotTable :courses="coursesToSchedule" />
                            </v-col>
                        </v-row>
                        <div>
                            <v-btn color="primary" @click="toggleTimeslotTable = true" :disabled="toggleTimeslotTable">Next</v-btn>
                            <v-btn color="secondary" @click="toggleTimeslotTable = false" text class="ml-3" :disabled="!toggleTimeslotTable">Back</v-btn>
                        </div>
                    </v-container>
                    <div>
                        <v-btn color="primary" @click="nextStep(3)">Continue</v-btn>
                        <v-btn color="secondary" @click="step = 1" text class="ml-3">Back</v-btn>
                    </div>
                </v-stepper-content>
                <v-stepper-content step="3">
                    <v-container class="min-height">
                        <schedules :courses="coursesToSchedule" />
                    </v-container>
                    <div>
                        <v-btn color="primary" @click="step = 3" disabled>Continue</v-btn>
                        <v-btn color="secondary" @click="step = 2" text class="ml-3">Back</v-btn>
                    </div>
                </v-stepper-content>
            </v-stepper-items>
        </v-stepper>
        
    </div>
</template>

<script>
import Schedules from '../components/Schedules.vue'
import TimeslotTable from '../components/TimeslotTable.vue'
import ubc2021W from '../course-lib/ubc-2021W.json'
import { getTermDistribution } from '../util/schedule-utils'

export default {
    name: 'home',
    components: { Schedules, TimeslotTable },
    data() {
        return {
            step: 2,
            sessions: ['2021W'],
            session: '2021W',

            courses: [],
            courseToAdd: null,
            cur: null,
            selectedCourses: [],

            selectedSections: [], // todo: select sections to lock / disable
            headers: [
                { text: 'Section', value: 'section' },
                { text: 'Type', value: 'type' },
                { text: 'Delivery', value: 'delivery' },
                { text: 'Days', value: 'days' },
                { text: 'Start Time', value: 'start_time' },
                { text: 'End Time', value: 'end_time' }
            ],

            coursesToSchedule: [],
            preferences: {
                courseTerms: [],
                terms: []
            },
            toggleTimeslotTable: false,
        }
    },
    created() {
        this.courses = ubc2021W
    },
    methods: {
        nextStep(n) {
            if (n === 2) {
                this.preferences.courseTerms = getTermDistribution(this.selectedCourses);
            }
            else if (n === 3) {
                this.coursesToSchedule = [...this.selectedCourses];
            }
            this.step = n;
        },
        addCourse(course) {
            if (course) {
                if (!this.selectedCourses.some(v => v.id === course.id)) {
                    this.selectedCourses.push(course)
                    this.cur = this.selectedCourses.length - 1
                }
            }
            this.courseToAdd = null
        },
        removeCourse(ind) {
            let ncur = (ind + 1 === this.selectedCourses.length ? 0 : ind)
            this.selectedCourses.splice(ind, 1)
            this.cur = ncur
        }
    }
}
</script>

<style lang="scss" scoped>
.session-select {
    margin: 5px auto;
    width: 200px;
}
.min-height {
    min-height: 50vh;
}
</style>
