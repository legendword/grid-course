<template>
    <div>
        <div>
            <schedule v-if="schedules.length !== 0" :schedule="schedules[page - 1]" />
        </div>
        <div class="text-center">
            <v-pagination v-model="page" :length="schedules.length" />
        </div>
    </div>
</template>

<script>
import Scheduler from '../util/Scheduler';
import Schedule from './Schedule.vue';

export default {
    name: 'schedules',
    components: { Schedule },
    props: {
        courses: Array
    },
    data() {
        return {
            scheduler: null,
            schedules: [],
            page: 1
        }
    },
    watch: {
        courses: {
            handler(val) {
                if (val.length !== 0) {
                    this.scheduler = new Scheduler(this.courses);
                    this.scheduler.generateAllSchedules();
                    this.schedules = this.scheduler.schedules;
                }
            },
            immediate: true
        }
    },
    methods: {
        startSchedule() {
        }
    }
}
</script>

<style>

</style>