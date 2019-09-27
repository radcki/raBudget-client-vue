import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import pl from 'vuetify/es5/locale/pl'
import en from 'vuetify/es5/locale/en'
import { VueConfirm } from './confirm/confirm.plugin'

Vue.use(Vuetify)

Vue.use(VueConfirm, {
  vuetify: Vuetify
})

export default new Vuetify({
  theme: {
    dark: false
  },
  lang: {
    locales: { pl, en },
    current: 'pl'
  },
  icons: {
    iconfont: 'mdiSvg'
  }
})
