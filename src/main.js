import Vue from 'vue'
import './registerServiceWorker'
import { store } from './_store'
import { router } from './_helpers'
import signalrPlugin from './plugins/signalr.plugin'

import App from './App'
import VueI18n from 'vue-i18n'
import VueCurrencyFilter from 'vue-currency-filter'
import VueWait from 'vue-wait'
import vuetify from './plugins/vuetify'

import 'moment/locale/pl'
import 'moment/locale/en-gb'

import { mdiCar, mdiBabyFace, mdiCamera, mdiCity, mdiHuman, mdiSofa, mdiMemory, mdiBike, mdiFire, mdiCart, mdiTrainCar, mdiWalletTravel, mdiWrench, mdiBasket, mdiGamepad, mdiPhone, mdiAirplane, mdiCoinOutline, mdiFormatPaint, mdiGamepadSquare, mdiLaptop, mdiDumbbell, mdiCoffee, mdiDice5, mdiBeach, mdiBusArticulatedFront, mdiSmoking, mdiFridge, mdiPaw, mdiBandage, mdiCellphoneAndroid, mdiSpeaker, mdiSim, mdiSilverwareForkKnife, mdiFood, mdiGasStation, mdiHospitalBuilding, mdiShopping, mdiGlassCocktail, mdiFilmstrip, mdiMotorbike, mdiWalletGiftcard } from '@mdi/js'

const moment = require('moment')

Vue.use(VueWait, { useVuex: true })
Vue.use(VueI18n)
Vue.use(signalrPlugin)

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

Vue.prototype.$categoryIcons = {
  directions_car: mdiCar,
  local_grocery_store: mdiCart,
  commute: mdiTrainCar,
  card_travel: mdiWalletTravel,
  build: mdiWrench,
  shopping_basket: mdiBasket,
  games: mdiGamepad,
  phone: mdiPhone,
  airplanemode_active: mdiAirplane,
  monetization_on: mdiCoinOutline,
  format_paint: mdiFormatPaint,
  videogame_asset: mdiGamepadSquare,
  computer: mdiLaptop,
  camera_alt: mdiCamera,
  location_city: mdiCity,
  whatshot: mdiFire,
  fitness_center: mdiDumbbell,
  free_breakfast: mdiCoffee,
  casino: mdiDice5,
  beach_access: mdiBeach,
  airport_shuttle: mdiBusArticulatedFront,
  smoking_rooms: mdiSmoking,
  kitchen: mdiFridge,
  child_friendly: mdiBabyFace,
  pets: mdiPaw,
  healing: mdiBandage,
  accessibility: mdiHuman,
  weekend: mdiSofa,
  memory: mdiMemory,
  phone_android: mdiCellphoneAndroid,
  speaker: mdiSpeaker,
  sim_card: mdiSim,
  restaurant: mdiSilverwareForkKnife,
  fastfood: mdiFood,
  local_gas_station: mdiGasStation,
  local_hospital: mdiHospitalBuilding,
  local_mall: mdiShopping,
  local_bar: mdiGlassCocktail,
  local_movies: mdiFilmstrip,
  directions_bike: mdiBike,
  motorbike: mdiMotorbike,
  card_giftcard: mdiWalletGiftcard
}

Vue.use(VueCurrencyFilter)

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

// eslint-disable-next-line no-unused-vars
const app = new Vue({
  el: '#app',
  wait: new VueWait({
    useVuex: true,
    vuexModuleName: 'wait'
  }),
  vuetify,
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
