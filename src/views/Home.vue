<template>
    <div class="home">
        <h2 class="text-center my-5">Set Up Your Schedule</h2>
        <div class="session-select">
            <v-select :items="sessions" label="Session" solo v-model="session" />
        </div>
        <v-container>
            <v-row>
                <v-col cols="3">
                    <v-autocomplete class="my-2" :items="courses" return-object editable height="50px" label="Add Courses..." :value="courseToAdd" @input="addCourse($event)" />
                    <v-list nav>
                        <v-list-item-group v-model="cur" color="primary">
                            <v-list-item v-for="(course, ind) in selectedCourses" :key="ind">
                                <v-list-item-content>
                                    <v-list-item-title>{{ course.subject }} {{ course.course }}</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list-item-group>
                        
                    </v-list>
                </v-col>
                <v-col cols="9">
                    <div v-if="cur !== null">
                        <h2>{{ selectedCourses[cur].text }}</h2>
                        <v-data-table v-model="selectedSections" :headers="headers" :items="selectedCourses[cur].sections" show-select :single-select="false" class="elevation-1" />
                    </div>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script>
import ubc2021W from '../course-lib/ubc-2021W.json'

export default {
    name: 'home',
    data() {
        return {
            sessions: ['2021W'],
            session: '2021W',

            courses: [],
            courseToAdd: null,
            cur: null,
            selectedCourses: [],

            selectedSections: [],
            headers: [
                { text: 'Section', value: 'section' },
                { text: 'Type', value: 'type' },
                { text: 'Delivery', value: 'delivery' },
                { text: 'Days', value: 'days' },
                { text: 'Start Time', value: 'start_time' },
                { text: 'End Time', value: 'end_time' }
            ]
        }
    },
    created() {
        this.courses = ubc2021W.map(v => ({
            text: v.subject + " " + v.course,
            disabled: false,
            ...v
        }))
    },
    methods: {
        addCourse(course) {
            console.log(course)
            if (course) {
                if (!this.selectedCourses.some(v => v.text === course.text)) {
                    this.selectedCourses.push(course)
                }
            }
            this.courseToAdd = null
        }
    }
}
</script>

<style lang="scss" scoped>
.session-select {
    margin: 5px auto;
    width: 200px;
}
</style>
