/* eslint-disable import/no-duplicates */
import 'babel-polyfill'

import Vue from 'vue'
import Vuetify from 'vuetify/lib'

import { store } from './_store'
import { router } from './_helpers'
import App from './App'
import VueI18n from 'vue-i18n'
import VueCurrencyFilter from 'vue-currency-filter'
import VueWait from 'vue-wait'

import 'moment/locale/pl'
import 'moment/locale/en-gb'

import pl from 'vuetify/es5/locale/pl.js'
import en from 'vuetify/es5/locale/en.js'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'
import { faDotCircle } from '@fortawesome/free-solid-svg-icons'
import { faCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import 'vuetify/src/stylus/main.styl'
const moment = require('moment')

library.add(faSignOutAlt, faUserCircle, faDotCircle, faCircle)

Vue.use(VueWait, { useVuex: true })
Vue.use(VueI18n)

Vue.use(Vuetify, {
  lang: {
    locales: { pl, en },
    current: 'pl'
  }
})

Vue.prototype.$moment = moment
Vue.filter('moment', function (value, format) {
  return !value ? '-' : moment(value).format(format || 'YYYY-MM-DD')
})

Vue.prototype.$currencies = {
  PLN: {
    symbol: 'zł',
    thousandsSeparator: ' ',
    fractionCount: 2,
    fractionSeparator: ',',
    symbolPosition: 'back',
    symbolSpacing: true
  },
  EUR: {
    symbol: '€',
    thousandsSeparator: ' ',
    fractionCount: 2,
    fractionSeparator: ',',
    symbolPosition: 'front',
    symbolSpacing: true
  },
  USD: {
    symbol: '$',
    thousandsSeparator: ' ',
    fractionCount: 2,
    fractionSeparator: '.',
    symbolPosition: 'front',
    symbolSpacing: true
  }
}

Vue.prototype.$categoryIcons = [
  'directions_car',
  'local_grocery_store',
  'commute',
  'card_travel',
  'build',
  'shopping_basket',
  'games',
  'phone',
  'airplanemode_active',
  'monetization_on',
  'format_paint',
  'videogame_asset',
  'computer',
  'camera_alt',
  'location_city',
  'whatshot',
  'fitness_center',
  'free_breakfast',
  'casino',
  'beach_access',
  'airport_shuttle',
  'smoking_rooms',
  'kitchen',
  'child_friendly',
  'pets',
  'healing',
  'accessibility',
  'weekend',
  'memory',
  'phone_android',
  'speaker',
  'sim_card',
  'restaurant',
  'fastfood',
  'local_gas_station',
  'local_hospital',
  'local_mall',
  'local_bar',
  'local_movies',
  'directions_bike',
  'card_giftcard'
]

Vue.use(VueCurrencyFilter)

Vue.component('v-icon-fa', FontAwesomeIcon)

Vue.filter('percentage', function (value, decimals) {
  if (!value) value = 0
  if (!decimals) decimals = 0

  value = value * 100
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals) + '%'
})

var messages = {
  pl: require('./i18n/pl.json'),
  en: require('./i18n/en.json')
}
const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages
})

const app = new Vue({
  el: '#app',
  wait: new VueWait({
    useVuex: true,
    vuexModuleName: 'wait'
  }),
  router,
  store,
  i18n,
  render: h => h(App)
})
