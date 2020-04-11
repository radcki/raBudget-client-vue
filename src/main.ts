import Vue from 'vue';
import './registerServiceWorker';
import store from './_store';
import { router } from './_helpers';
import signalrPlugin from './plugins/signalr.plugin';

import App from './App.vue';
import VueCurrencyFilter from 'vue-currency-filter';
import VueWait from 'vue-wait';
import vuetify from './plugins/vuetify';
import { Copy } from './plugins/copy';
import i18n from './plugins/i18n';
import VueKeycloakJs from '@dsb-norge/vue-keycloak-js';
import VueMarkdown from 'vue-markdown';
import VueCurrencyInput from 'vue-currency-input';

import {
  mdiCar,
  mdiBabyFace,
  mdiCamera,
  mdiCity,
  mdiHuman,
  mdiSofa,
  mdiMemory,
  mdiBike,
  mdiFire,
  mdiCart,
  mdiTrainCar,
  mdiWalletTravel,
  mdiWrench,
  mdiBasket,
  mdiGamepad,
  mdiPhone,
  mdiAirplane,
  mdiCurrencyUsdCircleOutline,
  mdiFormatPaint,
  mdiGamepadSquare,
  mdiLaptop,
  mdiDumbbell,
  mdiCoffee,
  mdiDice5,
  mdiBeach,
  mdiBusArticulatedFront,
  mdiSmoking,
  mdiFridge,
  mdiPaw,
  mdiBandage,
  mdiCellphoneAndroid,
  mdiSpeaker,
  mdiSim,
  mdiSilverwareForkKnife,
  mdiFood,
  mdiGasStation,
  mdiHospitalBuilding,
  mdiShopping,
  mdiGlassCocktail,
  mdiFilmstrip,
  mdiMotorbike,
  mdiWalletGiftcard,
} from '@mdi/js';
import { format } from 'date-fns';
import { Budget } from './typings/Budget';

import plDateLocale from 'date-fns/locale/pl';
import enDateLocale from 'date-fns/locale/en-GB';
import { eCategoryType } from './typings/enums/eCategoryType';
import { NumberFormatInfo } from './typings/Currency';

Vue.use(signalrPlugin);
Vue.use(Copy);
Vue.use(VueCurrencyInput, {});

Vue.filter('dateFormat', (value, formatString, locale) => {
  return !value ? '-' : format(value, formatString || 'yyyy-MM-dd', { locale: locale });
});

Vue.prototype.$dateLocales = {
  pl: plDateLocale,
  en: enDateLocale,
};
Vue.prototype.$locale = localStorage.getItem('locale');

Vue.prototype.$currencies = {
  PLN: {
    symbol: 'zł',
    thousandsSeparator: ' ',
    fractionCount: 2,
    fractionSeparator: ',',
    symbolPosition: 'back',
    symbolSpacing: true,
  },
  EUR: {
    symbol: '€',
    thousandsSeparator: ' ',
    fractionCount: 2,
    fractionSeparator: ',',
    symbolPosition: 'front',
    symbolSpacing: true,
  },
  USD: {
    symbol: '$',
    thousandsSeparator: ' ',
    fractionCount: 2,
    fractionSeparator: '.',
    symbolPosition: 'front',
    symbolSpacing: true,
  },
};
/* eslint-disable @typescript-eslint/camelcase */
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
  monetization_on: mdiCurrencyUsdCircleOutline,
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
  card_giftcard: mdiWalletGiftcard,
};
/* eslint-enable @typescript-eslint/camelcase */

Vue.prototype.$categoryColor = function (categoryType: eCategoryType) {
  switch (categoryType) {
    case eCategoryType.Income:
      return 'income';
    case eCategoryType.Spending:
      return 'spending';
    case eCategoryType.Saving:
      return 'saving';
  }
};

Vue.use(VueCurrencyFilter);
Vue.use(VueMarkdown);

Vue.filter('percentage', (value, decimals) => {
  if (!value) {
    value = 0;
  }
  if (!decimals) {
    decimals = 0;
  }

  value = value * 100;
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals) + '%';
});

Vue.prototype.$currencyConfig = function (budget: Budget) {
  if (!budget.currency) {
    return null;
  }
  const nf = budget.currency.numberFormat as NumberFormatInfo;
  return {
    symbol: nf.currencySymbol,
    thousandsSeparator: nf.currencyGroupSeparator,
    fractionCount: nf.currencyDecimalDigits,
    fractionSeparator: nf.currencyDecimalSeparator,
    symbolPosition: [0, 2].includes(nf.currencyPositivePattern || -1) ? 'front' : 'back',
    symbolSpacing: nf.currencyPositivePattern == 0 ? false : true,
  };
};

Vue.use(VueKeycloakJs, {
  init: {
    onLoad: 'check-sso',
  },
  config: {
    url: 'https://login.rabt.pl/auth',
    clientId: 'budget',
    realm: 'rabt',
  },
  onReady: () => {
    Vue.use(VueWait);
    Vue.component('money-field', () => import('@/components/MoneyField.vue'));

    new Vue({
      el: '#app',
      store,
      vuetify,
      router,
      wait: new VueWait({
        useVuex: true,
      }),
      i18n,
      render: h => h(App),
    }).$mount('#app');
  },
});
