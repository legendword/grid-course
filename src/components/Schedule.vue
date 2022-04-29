<template>
    <div>
        <div class="mb-5" v-for="term in 2" :key="term">
            <div class="text-h6">Term {{ term }}</div>
            <table class="schedule-table">
                <colgroup>
                    <col v-for="i in 8" :key="i" />
                </colgroup>
                <tr class="table-header">
                    <th class="time empty"></th>
                    <th :class="'section' + ((day === 'Sun' || day === 'Sat') ? ' weekend' : '')" v-for="day in days" :key="day">{{ day }}</th>
                </tr>
                <tr v-for="(time, ind) in times" :key="ind">
                    <td v-if="ind % 2 === 0">{{ time }}</td>
                    <td class="empty" v-else>&nbsp;</td>
                    <template v-for="day in days">
                        <td v-if="schedule[getKey(term, day, time)] && (typeof schedule[getKey(term, day, time)]) === 'object'" :key="day" :rowspan="schedule[getKey(term, day, time)].span">
                            <v-card class="section-card secondary">
                                <v-card-text class="section-text white--text" style="padding: 0 !important;">
                                    <div class="section-name">{{ schedule[getKey(term, day, time)].id }}</div>
                                    <div class="text-subtitle-1">{{ schedule[getKey(term, day, time)].type }}</div>
                                </v-card-text>
                            </v-card>
                        </td>
                        <td class="empty" v-else-if="!schedule[getKey(term, day, time)]" :key="day + 'empty'">&nbsp;</td>
                    </template>
                </tr>
            </table>
        </div>
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
    table-layout: fixed;
    text-align: center;

    .table-header {
        height: 40px;
    }

    .time {
        width: 5%;
    }

    .section:not(.weekend) {
        width: 15%;
    }

    .section.weekend {
        width: 10%;
    }

    .section-card {
        height: 100%;

        .section-text {
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;

            .section-name {
                font-size: 1rem;
                font-weight: 500;
            }
        }
    }

    

    col:nth-child(even) {
        background: #F1F8E9;
    }

    tr, th, td {
        height: 30px;
    }
}
</style>