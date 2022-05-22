<template>
    <div class="home">
        <v-stepper v-model="step" flat>
            <v-stepper-header class="elevation-0 no-print">
                <v-stepper-step :complete="step > 1" step="1">Select Courses</v-stepper-step>
                <v-divider />
                <v-stepper-step :complete="step > 2" step="2">Set Preferences</v-stepper-step>
                <v-divider />
                <v-stepper-step :complete="step > 3" step="3">View Timetables</v-stepper-step>
            </v-stepper-header>
            <v-stepper-items>
                <v-stepper-content step="1">
                    <v-container fluid>
                        <div class="min-height pb-5">
                            <v-row>
                                <v-col cols="3">
                                    <v-autocomplete
                                        class="my-2 pa-2"
                                        clearable
                                        :items="courses"
                                        return-object
                                        item-text="id"
                                        editable
                                        height="50px"
                                        label="Add Courses..."
                                        :value="courseToAdd"
                                        @input="addCourse($event)"
                                    />
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
                                        <!--
                                        <v-data-table
                                            v-model="selectedSections"
                                            :headers="headers"
                                            :items="selectedCourses[cur].sections"
                                            show-select
                                            :single-select="false"
                                            class="elevation-1"
                                        />
                                        -->
                                        <v-data-table
                                            v-model="selectedSections"
                                            :headers="headers"
                                            :items="selectedCourses[cur].sections"
                                            class="elevation-1"
                                        />
                                    </div>
                                </v-col>
                            </v-row>
                        </div>

                        <div>
                            <v-btn color="primary" @click="nextStep(2)">Continue</v-btn>
                            <v-btn color="secondary" disabled text class="ml-3">Back</v-btn>
                        </div>
                    </v-container>
                    
                </v-stepper-content>
                <v-stepper-content step="2">
                    <v-container fluid>
                        <div class="min-height">
                            <v-row>
                                <v-col cols="12">
                                    <div class="text-h6 my-5 text-center">Choose Preferred Term</div>
                                    <v-list max-width="600" class="mx-auto">
                                        <v-list-item v-for="course in preferences.courseTerms" :key="course.id">
                                            <v-list-item-content>
                                                <v-list-item-title class="font-weight-medium">{{ course.id }}</v-list-item-title>
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
                                <!--
                                <v-col cols="6">
                                    
                                </v-col>
                                -->
                            </v-row>
                            <div class="my-5">
                                <div class="text-h6 my-5 text-center">Choose Preferred Timeslots</div>
                                <timeslot-table :timeRange="preferences.courseTimeRange" ref="timeslotTable" />
                            </div>
                        </div>

                        <div>
                            <v-btn color="primary" @click="generateSchedules" :loading="isGeneratingSchedules">Continue</v-btn>
                            <v-btn color="secondary" @click="step = 1" text class="ml-3">Back</v-btn>
                        </div>
                    </v-container>
                </v-stepper-content>
                <v-stepper-content step="3">
                    <v-container fluid class="min-height">
                        <schedules :schedules="schedules" />

                        <div>
                            <v-btn color="primary" @click="step = 3" disabled>Continue</v-btn>
                            <v-btn color="secondary" @click="step = 2" text class="ml-3">Back</v-btn>
                        </div>
                    </v-container>
                </v-stepper-content>
            </v-stepper-items>
        </v-stepper>
        
        <v-snackbar v-model="snackbars.emptyTimeslotPref" color="yellow darken-4" timeout="2000">Please select the preferred timeslots you would to take your courses!</v-snackbar>
        <v-snackbar v-model="snackbars.noValidSchedules" color="red darken-3" timeout="2000">There are no valid schedules possible! Consider changing your preferences and try again.</v-snackbar>
        <v-snackbar v-model="snackbars.tooManySchedules" color="yellow darken-4" timeout="5000">There are too many possible schedules, limiting result to the first 1000. Consider narrowing your conditions to decrease the number of possible schedules.</v-snackbar>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import Schedules from '../components/Schedules.vue';
import TimeslotTable from '../components/TimeslotTable.vue';
import { getCourseTimeRange, getTermDistribution } from '../util/schedule-utils';
import Scheduler from '../util/Scheduler';

export default {
    name: 'home',
    components: { Schedules, TimeslotTable },
    data() {
        return {
            step: 1,

            courseToAdd: null,
            cur: null,
            selectedCourses: [],

            selectedSections: [], // todo: select sections to lock / disable
            headers: [
                { text: 'Section', value: 'section' },
                { text: 'Type', value: 'type' },
                { text: 'Delivery', value: 'delivery' },
                { text: 'Term', value: 'term' },
                { text: 'Days', value: 'days' },
                { text: 'Start Time', value: 'start_time' },
                { text: 'End Time', value: 'end_time' }
            ],

            preferences: {
                courseTerms: [],
                courseTimeRange: null
            },

            isGeneratingSchedules: false,
            scheduler: null,
            schedules: [],

            snackbars: {
                emptyTimeslotPref: false,
                noValidSchedules: false,
                tooManySchedules: false
            }
        }
    },
    computed: {
        ...mapState(['session', 'courses'])
    },
    watch: {
        session() {
            this.selectedCourses = [];
        }
    },
    methods: {
        generateSchedules() {
            if (this.isGeneratingSchedules) return;

            let allowedTimeslots = this.$refs.timeslotTable.selected;
            if (allowedTimeslots.length === 0) {
                this.snackbars.emptyTimeslotPref = true;
                return;
            }

            this.isGeneratingSchedules = true;
            let coursesToBeScheduled = this.preferences.courseTerms.map(v => ({
                id: v.id,
                sections: v.sections[v.term]
            }));
            if (!this.scheduler) this.scheduler = new Scheduler();
            this.schedules = this.scheduler.generateAllSchedules(coursesToBeScheduled, allowedTimeslots);
            if (this.schedules.length === 0) {
                this.isGeneratingSchedules = false;
                this.snackbars.noValidSchedules = true;
                return;
            }
            else if (this.schedules.length === 1000) {
                this.snackbars.tooManySchedules = true;
            }
            this.nextStep(3);
        },
        nextStep(n) {
            if (n === 2) {
                this.preferences.courseTerms = getTermDistribution(this.selectedCourses);
                this.preferences.courseTimeRange = getCourseTimeRange(this.selectedCourses);
            }
            else if (n === 3) {
                this.isGeneratingSchedules = false;
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
.min-height {
    min-height: 50vh;
}
</style>
