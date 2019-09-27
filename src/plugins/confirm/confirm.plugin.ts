import Confirm from './Confirm.vue'
import Vue, { VueConstructor } from 'vue'
import Vuetify from 'vuetify'
import i18n from '@/plugins/i18n'
import { ConfirmOptions } from './types'


export const VueConfirm = {
  install(Vue: VueConstructor) {
    let VueConstructor = Vue.extend(Confirm)
    let ConfirmInstance = new VueConstructor({
      vuetify: new Vuetify(),
      i18n
    })

    let vm = ConfirmInstance.$mount();
    document.querySelector('body').appendChild(vm.$el);

    // Create generic method
    Vue.prototype.$confirm = (dialogOptions: ConfirmOptions): Promise<boolean> => {
      return ConfirmInstance.open(dialogOptions.title, dialogOptions.message, dialogOptions.options);
    }
  }
}
