<template>
    <div>
        <div class="grid-table-container fixed">
            <table class="grid-table" v-show="showFixedHeader">
                <tr class="table-header primary white--text">
                    <th class="time empty"></th>
                    <th class="course-col" v-for="course in courseKeys" :key="course">{{ course }}</th>
                </tr>
            </table>
        </div>
        <div class="grid-table-container" ref="container">
            <table class="grid-table">
                <colgroup>
                    <col v-for="i in courseKeys.length + 1" :key="i" />
                </colgroup>
                <thead>
                    <tr class="table-header primary white--text">
                        <th class="time empty"></th>
                        <th class="course-col" v-for="course in courseKeys" :key="course">{{ course }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="table-header primary--text">
                        <td class="time empty"></td>
                        <td class="course-col" v-for="course in courseKeys" :key="course">{{ res.courses[course].header }}</td>
                    </tr>
                    <template class="mb-5" v-for="index in indexes">
                        <!-- <div class="text-h6 text-center q-mb-md">Term {{ term }}</div> -->
                        <tr :key="index+'title'" class="title-row">
                            <td :colspan="courseKeys.length + 1">{{ tableTitles[index] }}</td>
                        </tr>
                        <tr v-for="(time, ind) in times[index]" :key="index+'-'+ind">
                            <td v-if="ind % 2 === 0">{{ time }}</td>
                            <td class="empty" v-else>&nbsp;</td>
                            <template v-for="(id, ind) in courseKeys">
                                <td v-if="res.courses[id].tables[index][time] && res.courses[id].tables[index][time] !== true" :key="id" :rowspan="res.courses[id].tables[index][time].span">
                                    <v-card
                                        class="section-card"
                                        :class="[
                                            ind % 2 === 0 ? 'col-even' : 'col-odd',
                                            res.courses[id].tables[index][time].id % 2 === 0 ? 'card-even' : 'card-odd',
                                        ]"
                                    >
                                        <v-card-text class="section-text white--text" style="padding: 0 !important;">
                                            <div class="section-name">{{ res.courses[id].tables[index][time].sections.map(v => v.section).join(", ") }}</div>
                                            <div class="text-subtitle-1"></div>
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
import { getTimeArray } from "../util/schedule-utils";
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
            return Object.keys(this.res.courses)
        },
    },
    mounted() {
        console.log(this.res);
        window.addEventListener("scroll", this.scrollHandler);
    },
    beforeDestroy() {
        window.removeEventListener("scroll", this.scrollHandler);
    },
    methods: {
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