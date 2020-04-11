import { VueConstructor } from 'vue';

class CopyPlugin {
  install(Vue: VueConstructor) {
    Vue.prototype.$copy = (o: any) => {
      let v, key;
      const output = Array.isArray(o) ? [] : {};

      for (key in o) {
        v = o[key];
        if (v) {
          output[key] = typeof v === 'object' && !(v instanceof Date) ? Vue.prototype.$copy(v) : v;
        } else {
          output[key] = v;
        }
      }
      return output;
    };
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $copy(data: any): any;
    $copy<T>(data: T): T;
  }
}

export const Copy = new CopyPlugin();
