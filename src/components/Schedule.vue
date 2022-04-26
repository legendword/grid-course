<template>
    <div>
        <table class="schedule-table">
            <tr class="table-header">
                <th class="empty"></th>
                <th v-for="day in days" :key="day">{{ day }}</th>
            </tr>
            <tr v-for="(time, ind) in times" :key="ind">
                <td v-if="ind % 2 === 0">{{ time }}</td>
                <td class="empty" v-else></td>
                <template v-for="day in days">
                    <td v-if="schedule[getKey(1, day, time)] && (typeof schedule[getKey(1, day, time)]) === 'object'" :key="day">{{ schedule[getKey(1, day, time)].id }} *</td>
                    <td v-else-if="schedule[getKey(1, day, time)]" :key="day">{{ schedule[getKey(1, day, time)] }}</td>
                    <td class="empty" v-else :key="day">{{ getKey(1, day, time) }}</td>
                </template>
            </tr>
        </table>
    </div>
</template>

<script>
import { getTimeArray, getTimeRange } from '../util/schedule-utils';

export default {
    name: 'schedule',
    props: {
        schedule: Object
    },
    data() {
        return {
            days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            times: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"]
        }
    },
    watch: {
        schedule: {
            handler(val) {
                console.log(getTimeArray, getTimeRange);
                this.times = getTimeArray(getTimeRange(val));
            },
            immediate: true
        }
    },
    methods: {
        getKey(term, day, time) {
            return term + ':' + day + ';' + time;
        }
    }
}
</script>

<style lang="scss" scoped>
.schedule-table {
    height: 600px;
    width: 100%;

    .table-header {
        height: 40px;
    }

    .empty::before {
        content: " ";
    }

    th:nth-child(even), td:nth-child(even) {
        background: #F1F8E9;
    }
}
</style>