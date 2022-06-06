<template>
    <v-app>
        <v-navigation-drawer app temporary v-model="drawer" class="no-print">
            <v-list-item>
                <v-list-item-icon>
                    <v-img src="./assets/logo.png" width="24px" height="24px" />
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

        <v-app-bar
            app
            dense
            color="primary"
            dark
            elevation="4"
        >
            <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>

            <div class="logo-container">
                <img src="./assets/logo-inverted.png" width="28px" height="28px" />
            </div>

            <v-app-bar-title>
                GridCourse
            </v-app-bar-title>

            <v-spacer></v-spacer>

            <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        depressed
                        color="primary"
                        v-bind="attrs"
                        v-on="on"
                    >
                        Session: {{ session }}
                        <v-icon right dark>mdi-menu-down</v-icon>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item-group v-model="selectedSessionIndex" color="primary">
                        <v-list-item v-for="i in sessionNames" :key="i">
                            <v-list-item-title>{{ i }}</v-list-item-title>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
            </v-menu>
        </v-app-bar>

        <v-main>
            <router-view />
        </v-main>

        <v-dialog v-model="mobileDialog" persistent width="600">
            <v-card class="pt-4">
                <v-card-text>GridCourse requires sufficient screen space. Please use this tool in a desktop / tablet browser.</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="error" text @click="mobileDialog = false">I understand. Continue anyways.</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-app>
</template>

<script>
import { mapState } from 'vuex';
import { sessionNames } from './store';
import isMobile from './util/isMobile';

export default {
    name: 'App',
    head: {
        title: {
            inner: 'GridCourse',
            complement: 'Create Schedules'
        }
    },
    data() {
        return {
            drawer: false,
            sessionNames,
            selectedSessionIndex: 0,
            mobileDialog: false
        }
    },
    computed: {
        ...mapState(['session'])
    },
    watch: {
        selectedSessionIndex(i) {
            this.$store.commit('updateSession', this.sessionNames[i]);
        }
    },
    mounted() {
        if (isMobile()) this.mobileDialog = true;
    }
};
</script>

<style>
@media print {
    .no-print, .no-print * {
        display: none !important;
    }
}
.logo-container {
    width: 28px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 5px;
}
</style>