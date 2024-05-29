<template>
    <div>
        <div class="grid-table-container fixed">
            <table class="grid-table" v-show="showFixedHeader">
                <colgroup>
                    <col />
                    <col v-for="course in courseKeys" :key="course" :class="[selected[course] ? 'disabled' : '']" />
                </colgroup>
                <tr class="table-header primary white--text">
                    <th class="time empty save-btn" @click="saveSchedule">
                        {{ saved ? "Saved" : "Save Schedule" }}
                    </th>
                    <th class="course-col" :class="[selected[course] ? 'disabled' : '']" v-for="course in courseKeys" :key="course">{{ course }}</th>
                </tr>
                <tr class="table-header primary--text">
                    <td class="time empty clear-btn" :class="[selectedKeys.length ? '' : 'disabled']" @click="clearSelections">
                        Clear Selections
                    </td>
                    <td class="course-col" v-for="course in courseKeys" :key="course">{{ res.courses[course].header }}</td>
                </tr>
            </table>
        </div>
        <div class="grid-table-container" ref="container">
            <table class="grid-table">
                <colgroup>
                    <col />
                    <col v-for="course in courseKeys" :key="course" :class="[selected[course] ? 'disabled' : '']" />
                </colgroup>
                <thead>
                    <tr class="table-header primary white--text">
                        <th class="time empty save-btn" :class="[selectedKeys.length === courseKeys.length ? '' : 'disabled']" @click="saveSchedule">
                            {{ saved ? "Saved" : "Save Schedule" }}
                        </th>
                        <th class="course-col" :class="[selected[course] ? 'disabled' : '']" v-for="course in courseKeys" :key="course">{{ course }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="table-header primary--text">
                        <td class="time empty clear-btn" :class="[selectedKeys.length ? '' : 'disabled']" @click="clearSelections">
                            Clear Selections
                        </td>
                        <td class="course-col" v-for="course in courseKeys" :key="course">{{ res.courses[course].header }}</td>
                    </tr>
                    <template class="mb-5" v-for="index in indexes">
                        <!-- <div class="text-h6 text-center q-mb-md">Term {{ term }}</div> -->
                        <tr :key="index+'title'" class="title-row">
                            <td :colspan="courseKeys.length + 1">{{ tableTitles[index] }}</td>
                        </tr>
                        <tr v-for="(time, timeIndex) in times[index]" :key="index+'-'+timeIndex">
                            <td v-if="timeIndex % 2 === 0">{{ time }}</td>
                            <td v-else class="empty">&nbsp;</td>
                            <template v-for="(id, ind) in courseKeys">
                                <td
                                    v-if="res.courses[id].tables[index][time] && res.courses[id].tables[index][time] !== true"
                                    :key="id"
                                    :rowspan="res.courses[id].tables[index][time].span"
                                >
                                    <v-menu
                                        v-if="res.courses[id].tables[index][time].sections.length > 1"
                                        top
                                        offset-x
                                        :disabled="!(res.courses[id].tables[index][time].selected || canAddToSchedule(res.courses[id].tables[index][time].sections[0], schedule) && !selected[id])"
                                    >
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-card
                                                class="section-card"
                                                :class="[
                                                    ind % 2 === 0 ? 'col-even' : 'col-odd',
                                                    res.courses[id].tables[index][time].id % 2 === 0 ? 'card-even' : 'card-odd',
                                                    res.courses[id].tables[index][time].selected || canAddToSchedule(res.courses[id].tables[index][time].sections[0], schedule) && !selected[id] ? '' : 'disabled',
                                                ]"
                                                :elevation="res.courses[id].tables[index][time].selected ? 10 : 0"
                                                v-bind="attrs"
                                                v-on="on"
                                            >
                                                <v-card-text class="section-text white--text" style="padding: 0 !important;">
                                                    <template v-if="res.courses[id].tables[index][time].selected">
                                                        <div class="section-name">{{ res.courses[id].tables[index][time].sections.map(v => res.courses[id].tables[index][time].selected.id === v.id ? `[${v.section}]` : v.section).join(", ") }}</div>
                                                        <div class="text-subtitle-1">Selected</div>
                                                    </template>
                                                    <div v-else class="section-name">{{ res.courses[id].tables[index][time].sections.map(v => v.section).join(", ") }}</div>
                                                </v-card-text>
                                            </v-card>
                                        </template>
                                        <v-list>
                                            <v-subheader>Choose a section to select</v-subheader>
                                            <v-list-item-group>
                                                <v-list-item
                                                    v-for="(section, sectionIndex) in res.courses[id].tables[index][time].sections"
                                                    :key="sectionIndex"
                                                    :color="res.courses[id].tables[index][time].selected && res.courses[id].tables[index][time].selected.id === section.id ? 'primary' : null"
                                                    @click="selectSection(id, index, time, section)"
                                                >
                                                    <v-list-item-title>{{ section.section }}</v-list-item-title>
                                                </v-list-item>
                                            </v-list-item-group>
                                        </v-list>
                                    </v-menu>
                                    <v-card
                                        v-else
                                        class="section-card"
                                        :class="[
                                            ind % 2 === 0 ? 'col-even' : 'col-odd',
                                            res.courses[id].tables[index][time].id % 2 === 0 ? 'card-even' : 'card-odd',
                                            res.courses[id].tables[index][time].selected || canAddToSchedule(res.courses[id].tables[index][time].sections[0], schedule) && !selected[id] ? '' : 'disabled',
                                        ]"
                                        :elevation="res.courses[id].tables[index][time].selected ? 10 : 0"
                                        @click="selectSection(id, index, time, res.courses[id].tables[index][time].sections[0])"
                                    >
                                        <v-card-text class="section-text white--text" style="padding: 0 !important;">
                                            <div class="section-name">{{ res.courses[id].tables[index][time].sections[0].section }}</div>
                                            <div class="text-subtitle-1" v-if="res.courses[id].tables[index][time].selected">Selected</div>
                                        </v-card-text>
                                    </v-card>
                                </td>
                                <td class="empty" v-else-if="!res.courses[id].tables[index][time]" :key="id + 'empty'">&nbsp;</td>
                            </template>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import { generateTables, tableTitles } from "../util/GridCourse";
import { getTimeArray, addToSchedule, removeFromSchedule, canAddToSchedule } from "../util/schedule-utils";

export default {
    name: "GridTable",
    props: {
        courses: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            res: generateTables(this.courses),
            tableTitles: tableTitles,

            showFixedHeader: false,

            selected: {},
            schedule: {},
            canAddToSchedule: canAddToSchedule,

            saved: false,
        }
    },
    computed: {
        indexes() {
            return this.res.hasOther ? [0, 1, 2, 3, 4] : [0, 1, 2, 3];
        },
        times() {
            return this.res.times.map(timeRange => getTimeArray(timeRange));
        },
        courseKeys() {
            return Object.keys(this.res.courses);
        },
        selectedKeys() {
            return Object.keys(this.selected);
        },
    },
    mounted() {
        console.log(this.res);
        window.addEventListener("scroll", this.scrollHandler);
        this.scrollHandler();
    },
    beforeDestroy() {
        window.removeEventListener("scroll", this.scrollHandler);
    },
    methods: {
        saveSchedule() {
            this.$emit("save", {...this.schedule});
            this.saved = true;
            setTimeout(() => {
                this.saved = false;
            }, 3000);
        },
        selectSection(courseId, tableIndex, time, section) {
            // console.log('selectSection', courseId, tableIndex, time, section);
            const obj = this.res.courses[courseId].tables[tableIndex][time];
            if (obj.selected) {
                const sameSection = obj.selected.id === section.id;
                const newSchedule = removeFromSchedule(obj.selected, this.schedule);
                if (newSchedule) {
                    this.schedule = newSchedule;
                }
                delete obj.selected;
                this.$delete(this.selected, courseId);
                if (sameSection) {
                    this.$forceUpdate();
                    return;
                }
            }
            else if (this.selected[courseId]) {
                return;
            }
            const newSchedule = addToSchedule(section, this.schedule);
            if (newSchedule) {
                this.schedule = newSchedule;
                obj.selected = section;
                this.$set(this.selected, courseId, { tableIndex, time });
            }
            this.$forceUpdate();
        },
        clearSelections() {
            this.schedule = {};
            for (const courseId in this.selected) {
                const { tableIndex, time } = this.selected[courseId];
                const obj = this.res.courses[courseId].tables[tableIndex][time];
                obj.selected = null;
            }
            this.selected = {};
            this.$forceUpdate();
        },
        scrollHandler() {
            const container = this.$refs.container;
            if (container) {
                this.showFixedHeader = container.getBoundingClientRect().top < 48;
            }
        },
    }
}
</script>

<style lang="scss" scoped>

.grid-table-container {

    &.fixed {
        position: fixed;
        top: 48px;
        left: 0;
        z-index: 8888;
        width: 100%;
        padding: 0 36px;
    }
}

.grid-table {
    table-layout: fixed;
    text-align: center;
    border-collapse: collapse;
    margin: 0 auto;

    .table-header {
        height: 60px;
    }

    .title-row {
        height: 60px;
        font-weight: 500;
        background-color: #00897b;
        color: #ffffff;
    }

    .time {
        width: 100px;
        max-width: 100px;
    }

    .course-col {
        width: 100px;
        max-width: 100px;

        &.disabled {
            opacity: 0.8;
            background: #9CCC65;
        }
    }

    .save-btn {
        cursor: pointer;
        font-size: 1rem;
        font-weight: 500;
        box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.3);
        transition: box-shadow 500ms ease;

        &:not(.disabled):hover {
            box-shadow: 0px 0px 25px 0px rgba(0,0,0,0.75);
        }

        &.disabled {
            cursor: default;
            box-shadow: none;
            font-weight: 300;
            opacity: 0.8;
            background: #9CCC65;
        }
    }

    .clear-btn {
        cursor: pointer;
        font-size: 1rem;
        font-weight: 500;
        box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.3);
        transition: box-shadow 500ms ease;

        &:not(.disabled):hover {
            box-shadow: 0px 0px 25px 0px rgba(0,0,0,0.75);
        }

        &.disabled {
            cursor: default;
            box-shadow: none;
            font-weight: 300;
            opacity: 0.8;
        }
    }

    .section-card {
        height: 100%;
        cursor: pointer;

        &.disabled {
            cursor: default;
            opacity: 0.5;
        }

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

    col {
        background: #ffffff;
    }
    col:nth-child(even) {
        background: #F1F8E9;
    }
    col.disabled {
        background: #F5F5F5;
    }

    .col-even.card-even {
        background: #D84315;
    }
    .col-even.card-odd {
        background: #0277BD;
    }
    .col-odd.card-even {
        background: #2E7D32;
    }
    .col-odd.card-odd {
        background: #7B1FA2;
    }

    tr, th, td {
        height: 30px;
    }

    th, td {
        border: 1px solid #DCEDC8;
    }
}
</style>