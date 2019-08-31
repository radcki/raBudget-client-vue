import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import pl from 'vuetify/es5/locale/pl'
import en from 'vuetify/es5/locale/en'

Vue.use(Vuetify)

export default new Vuetify({
  lang: {
    locales: { pl, en },
    current: 'pl'
  },
  icons: {
    iconfont: 'mdiSvg'
  }
})