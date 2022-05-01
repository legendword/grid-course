<template>
    <div>
        <v-row>
            <v-col class="mb-5" v-for="term in 2" :key="term">
                <div class="text-h6 text-center">Term {{ term }}</div>
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
                        <td 
                            v-for="day in days"
                            class="empty" 
                            :class="{secondary: selected.includes(getKey(term,day,time))}" 
                            :key="day"
                            @mousedown="enableSelection(term, day, time)"
                            @mouseup="disableSelection"
                            @mouseover="selectOnHover(term, day, time)"
                        >&nbsp;</td>
                    </tr>
                </table>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import { getTimeArray } from '../util/schedule-utils';
import Timeslot from '../util/Timeslot';
import _union from 'lodash/union';
import _difference from 'lodash/difference';

export default {
    name: 'TimeslotTable',
    props: {
        timeRange: Object
    },
    data() {
        return {
            days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            times: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"],
            selected: [],
            selectOnDrag: false,
            selectMode: true, // true: select, false: deselect
            initialSelectTimeslot: null
        }
    },
    watch: {
        timeRange(val) {
            if (val) {
                this.times = getTimeArray(val);
                this.selected = [];
            }
        }
    },
    methods: {
        getKey(term, day, time) {
            return term + ':' + day + ';' + time;
        },
        enableSelection(term, day, time) { //on mouse down
            this.initialSelectTimeslot = new Timeslot(term, day, time);
            this.selectOnDrag = true;
            let key = this.getKey(term, day, time);
            if (this.selected.includes(key)) {
                this.selectMode = false;
                this.selected = this.selected.filter(item => item !== key )
            } else {
                this.selectMode = true;
                this.selected.push(key);
            }
        },
        selectOnHover(term, day, time) {
            if (!this.selectOnDrag) return;
            let ts = new Timeslot(term, day, time);
            let cells = this.initialSelectTimeslot.boxSelectionTo(ts);
            if (this.selectMode) {
                this.selected = _union(this.selected, cells);
            }
            else {
                this.selected = _difference(this.selected, cells);
            }
        },
        disableSelection() { //on mouse up
            this.selectOnDrag = false;
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
    & * {
        user-select: none;
    }

    .table-header {
        height: 40px;
    }

    .time {
        width: 20%;
    }

    .section:not(.weekend) {
        width: 12%;
    }

    .section.weekend {
        width: 10%;
    }

    .section-card {
        height: 100%;
    }

    col:nth-child(even) {
        background: #F1F8E9;
    }

    tr, th, td {
        height: 30px;
    }
    .selected {
        background: #919d84 !important;
    }
}
</style>