import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

const messages = {
  pl: require('@/i18n/pl.json'),
  en: require('@/i18n/en.json'),
};

export default new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages,
});
