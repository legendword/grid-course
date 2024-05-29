<template>
    <div>
        <div class="my-3 text-center no-print">
            <v-pagination v-model="page" :length="schedules.length" :total-visible="10" />
        </div>
        <div>
            <schedule v-if="schedules.length !== 0" :schedule="schedules[page - 1]" @delete="deleteSchedule" />
        </div>
        <div class="my-3 text-center no-print">
            <v-pagination v-model="page" :length="schedules.length" :total-visible="10" />
        </div>
    </div>
</template>

<script>
import Schedule from './Schedule.vue';

export default {
    name: 'schedules',
    components: { Schedule },
    props: {
        schedules: Array
    },
    watch: {
        schedules() {
            this.page = 1;
        }
    },
    data() {
        return {
            page: 1
        }
    },
    methods: {
        deleteSchedule() {
            this.$emit("deleteSchedule", this.page - 1);
        },
    },
}
</script>

<style>

</style>