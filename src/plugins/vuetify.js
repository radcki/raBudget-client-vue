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
        contentBackground: colors.grey.lighten4,
        cardBackground: colors.white,
      },
      dark: {
        income: colors.green.darken4,
        saving: colors.lightBlue.darken4,
        spending: colors.orange.darken4,
        allocation: colors.purple.darken4,
        navigationBar: colors.grey.darken4,
        navigationBarHeader: colors.blueGrey.darken4,
        navigationBarAccent: colors.blueGrey.darken4,
        contentBackground: colors.grey.darken4,
        cardBackground: colors.blueGrey.darken4,
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
