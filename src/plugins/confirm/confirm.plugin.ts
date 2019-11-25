import Confirm from './Confirm.vue';
import { VueConstructor } from 'vue';
import Vuetify from 'vuetify';
import i18n from '@/plugins/i18n';
import { ConfirmOptions } from './types';

export const VueConfirm = {
  install(Vue: VueConstructor) {
    const vueConstructor = Vue.extend(Confirm);
    const ConfirmInstance = new vueConstructor({
      vuetify: new Vuetify(),
      i18n,
    });

    const vm = ConfirmInstance.$mount();
    let bodyEl = document.querySelector('body');
    if (!bodyEl) {
      bodyEl = document.createElement('body');
      document.appendChild(bodyEl);
    } else {
      bodyEl.appendChild(vm.$el);
    }

    // Create generic method
    Vue.prototype.$confirm = (dialogOptions: ConfirmOptions): Promise<boolean | any> =>
      ConfirmInstance.open(dialogOptions.title, dialogOptions.message, dialogOptions.options);
  },
};
