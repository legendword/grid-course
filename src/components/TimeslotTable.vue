<template>
    <div>
        <div class="my-5 d-flex justify-center">
            <v-btn class="mx-3" color="primary" @click="selectAll">Select All</v-btn>
            <v-btn class="mx-3" color="primary" outlined @click="deselectAll">Deselect All</v-btn>
        </div>
        <div class="my-5 text-center grey--text text--lighten-1">Drag to select, or click row / column headers to select.</div>
        <v-row>
            <v-col class="mb-5" v-for="term in 2" :key="term">
                <div class="text-h6 text-center">Term {{ term }}</div>
                <table class="schedule-table">
                    <colgroup>
                        <col v-for="i in 8" :key="i" />
                    </colgroup>
                    <tr class="table-header">
                        <th class="time empty"></th>
                        <th v-for="day in days"
                            :key="day"
                            class="section clickable"
                            :class="{weekend: day === 'Sun' || day === 'Sat'}"
                            @click="selectDay(term, day)" 
                        >{{ day }}</th>
                    </tr>
                    <tr v-for="(time, ind) in times" :key="ind">
                        <td v-if="ind % 2 === 0"
                            class="clickable"
                            @click="selectTime(term, time)"
                        >{{ time }}</td>
                        <td v-else
                            class="clickable empty"
                            @click="selectTime(term, time)"
                        >&nbsp;</td>
                        <td 
                            v-for="day in days"
                            :key="day"
                            class="cell empty" 
                            :class="{selected: selected.includes(getKey(term,day,time))}"
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
            const key = this.getKey(term, day, time);
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
            const ts = new Timeslot(term, day, time);
            const cells = this.initialSelectTimeslot.boxSelectionTo(ts);
            if (this.selectMode) {
                this.selected = _union(this.selected, cells);
            }
            else {
                this.selected = _difference(this.selected, cells);
            }
        },
        disableSelection() { //on mouse up
            this.selectOnDrag = false;
        },
        selectDay(term, day) {
            const from = new Timeslot(term, day, this.times[0]);
            const to = new Timeslot(term, day, this.times[this.times.length-1]);
            const cells = from.boxSelectionTo(to);
            const firstKey = this.getKey(term, day, this.times[0]);
            if (this.selected.includes(firstKey)) {
                this.selected = _difference(this.selected, cells);
            }
            else {
                this.selected = _union(this.selected, cells);
            }
        },
        selectTime(term, time) {
            const from = new Timeslot(term, this.days[0], time);
            const to = new Timeslot(term, this.days[this.days.length-1], time);
            const cells = from.boxSelectionTo(to);
            const firstKey = this.getKey(term, this.days[0], time);
            if (this.selected.includes(firstKey)) {
                this.selected = _difference(this.selected, cells);
            }
            else {
                this.selected = _union(this.selected, cells);
            }
        },
        selectAll() {
            let cells = [];
            for (let term = 1; term <= 2; term++) {
                const from = new Timeslot(term, this.days[0], this.times[0]);
                const to = new Timeslot(term, this.days[this.days.length-1], this.times[this.times.length-1]);
                cells.push(from.boxSelectionTo(to));
            }
            this.selected = [...cells[0], ...cells[1]];
        },
        deselectAll() {
            this.selected = [];
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
    border-collapse: collapse;

    & * {
        user-select: none;
    }

    .table-header {
        height: 40px;
    }

    .time {
        width: 20%;
    }

    .section {
        &:not(.weekend) {
            width: 12%;
        }
        &.weekend {
            width: 10%;
        }
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

    th, td {
        border: 1px solid #DCEDC8;
    }

    .cell {
        cursor: cell;
    }

    .clickable {
        cursor: pointer;
    }

    .selected {
        background: #69a03a !important;
    }
}
</style>