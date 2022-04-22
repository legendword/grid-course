import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
            light: {
                primary: colors.lightGreen.darken2,
                secondary: colors.teal.darken1,
                accent: colors.amber.accent3
            },
            dark: {
                primary: colors.green.darken1,
                secondary: colors.teal.lighten1
            }
        }
    }
});
