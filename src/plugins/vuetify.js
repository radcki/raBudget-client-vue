import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import pl from 'vuetify/es5/locale/pl';
import en from 'vuetify/es5/locale/en';
import { VueConfirm } from './confirm/confirm.plugin';
import colors from 'vuetify/lib/util/colors';

Vue.use(Vuetify);

Vue.use(VueConfirm, {
  vuetify: Vuetify,
});

export default new Vuetify({
  theme: {
    dark: false,
    themes: {
      light: {
        income: colors.lightGreen.darken3,
        saving: colors.blue.base,
        spending: colors.amber.base,
        allocation: colors.purple.darken1,
        navigationBar: colors.white,
        navigationBarHeader: colors.blueGrey.darken1,
        navigationBarAccent: colors.grey.lighten4,
      },
      dark: {
        income: colors.lightGreen.darken4,
        saving: colors.blue.darken3,
        spending: colors.amber.darken3,
        allocation: colors.purple.darken3,
        navigationBar: colors.grey.darken4,
        navigationBarHeader: colors.grey.darken3,
        navigationBarAccent: colors.grey.darken3,
      },
    },
  },
  lang: {
    locales: { pl, en },
    current: 'pl',
  },
  icons: {
    iconfont: 'mdiSvg',
  },
});
