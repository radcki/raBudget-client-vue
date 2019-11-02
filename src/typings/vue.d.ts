import Vue from 'vue';
import VueWait from 'vue-wait';

declare module 'vue/types/vue' {
  interface Vue {
    $wait: VueWait;
    $locale: any;
    $keycloak: any;
    $currencyConfig: any;
    $categoryIcons: object;
  }
}

// ComponentOptions is declared in types/options.d.ts
declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    wait?: VueWait;
  }
}
