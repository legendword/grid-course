<template>
    <v-app>
        <v-navigation-drawer app expand-on-hover class="no-print">
            <v-list-item>
                <v-list-item-icon>
                    <v-img src="GridCourse-01.png" width="24px" height="24px" />
                </v-list-item-icon>
                <v-list-item-content>
                    <v-list-item-title class="text-h6">
                        GridCourse
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-divider />
            <v-list dense nav>
                <v-list-item to="/" exact active-class="primary--text">
                    <v-list-item-icon>
                        <v-icon>mdi-calendar</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>Schedule</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-main style="padding: 0 0 0 56px;">
            <router-view />
        </v-main>
    </v-app>
</template>

<script>
export default {
    name: 'App',
    head: {
        title: {
            inner: 'GridCourse',
            complement: 'Create Schedules'
        }
    },
    data: () => ({
        //
    }),
};
</script>

<style>
@media print {
    .no-print, .no-print * {
        display: none !important;
    }
}
</style>