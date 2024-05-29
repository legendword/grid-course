<template>
    <div class="home">
        <v-stepper v-model="step" flat>
            <v-stepper-header class="elevation-0 no-print">
                <v-stepper-step :complete="step > 1" step="1">Select Courses</v-stepper-step>
                <v-divider />
                <v-stepper-step :complete="step > 2" step="2">View Grid Tables</v-stepper-step>
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
                                        ref="addCourse"
                                        class="my-2 pa-2"
                                        solo
                                        color="primary"
                                        clearable
                                        :items="courses"
                                        return-object
                                        item-text="id"
                                        editable
                                        height="50px"
                                        label="Add Courses..."
                                        :value="courseToAdd"
                                        @input="addCourse($event)"
                                    ></v-autocomplete>
                                    <v-subheader>Selected Courses ({{ selectedCourses.length }})</v-subheader>
                                    <div v-if="selectedCourses.length === 0">
                                        <v-subheader>No selected courses.</v-subheader>
                                    </div>
                                    <v-list v-else>
                                        <v-list-item-group v-model="cur" color="primary">
                                            <v-list-item v-for="(course, ind) in selectedCourses" :key="ind">
                                                <v-list-item-content>
                                                    <v-list-item-title>
                                                        {{ course.subject }} {{ course.course }}
                                                    </v-list-item-title>
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
                                        <h2>{{ selectedCourses[cur].id }} {{ selectedCourses[cur].name ? ` - ${selectedCourses[cur].name}` : '' }}</h2>
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
                                    <div v-else>
                                        <div class="mt-7">
                                            <v-icon large color="primary">mdi-arrow-left-top</v-icon>
                                            <div class="mt-2 text-h6 primary--text">Start adding courses here</div>
                                        </div>
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
                            <grid-table v-if="step === 2" :courses="selectedCourses" @save="saveSchedule"></grid-table>
                        </div>

                        <div class="mt-6">
                            <v-btn color="primary" @click="nextStep(3)">View Saved Schedules</v-btn>
                            <v-btn color="secondary" @click="step = 1" text class="ml-3">Back</v-btn>
                        </div>
                    </v-container>
                </v-stepper-content>
                <v-stepper-content step="3">
                    <v-container fluid>
                        <schedules v-if="schedules.length" :schedules="schedules" @deleteSchedule="deleteSchedule"></schedules>
                        <div v-else class="min-height center-block">
                            <div>
                                <div class="mb-6 text-h6">There are no saved schedules yet.</div>
                                <div class="text-subtitle-1">Press the "Save Schedules" button on the top left of the Grid Table in the previous step after you have selected a section for each course to save a schedule.</div>
                            </div>
                        </div>

                        <div>
                            <v-btn color="primary" @click="step = 3" disabled>Continue</v-btn>
                            <v-btn color="secondary" @click="step = 2" text class="ml-3">Back</v-btn>
                        </div>
                    </v-container>
                </v-stepper-content>
            </v-stepper-items>
        </v-stepper>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import Schedules from '../components/Schedules.vue';
import TimeslotTable from '../components/TimeslotTable.vue';
import GridTable from '../components/GridTable.vue';

export default {
    name: 'home',
    components: { Schedules, TimeslotTable, GridTable },
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
                { text: 'End Time', value: 'end_time' },
                { text: 'Room', value: 'room' },
            ],

            schedules: [],
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
        saveSchedule(schedule) {
            this.schedules.push(schedule);
        },
        nextStep(n) {
            this.step = n;
        },
        addCourse(course) {
            if (course) {
                if (!this.selectedCourses.some(v => v.id === course.id)) {
                    this.selectedCourses.push(course)
                    this.cur = this.selectedCourses.length - 1
                }
            }
        },
        removeCourse(ind) {
            let ncur = (ind + 1 === this.selectedCourses.length ? 0 : ind)
            this.selectedCourses.splice(ind, 1)
            this.cur = ncur
        },
        deleteSchedule(ind) {
            this.schedules.splice(ind, 1);
        },
    },
    mounted() {
        if (this.$route.query.hasOwnProperty("dev")) {
            const presetCourseIds = ["MATH 200", "STAT 200", "CPSC 221", "MATH 223", "STAT 201", "STAT 302", "STAT 300"];
            for (const id of presetCourseIds) {
                this.addCourse(this.courses.find(course => course.id === id));
            }
        }
    },
}
</script>

<style lang="scss" scoped>
.min-height {
    min-height: calc( 100vh - 220px );
}
.center-block {
    height: 100%;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
