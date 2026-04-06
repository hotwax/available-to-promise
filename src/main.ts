import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { DateTime } from 'luxon';
import logger from './logger';


import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';
import '@hotwax/apps-theme';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { dxpComponents } from "@hotwax/dxp-components"
import { login, logout, loader } from "@/user-utils";
import { getConfig, initialise ,getAvailableTimeZones } from '@/adapter';
import localeMessages from './locales';
import permissionPlugin from '@/authorization';
import permissionRules from '@/authorization/Rules';
import permissionActions from '@/authorization/Actions';
import { useUserStore } from './store/user'

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App)
  .use(IonicVue, {
    mode: 'md',
    innerHTMLTemplatesEnabled: true
  })
  .use(logger, {
    level: import.meta.env.VITE_DEFAULT_LOG_LEVEL
  })
  .use(router)
  .use(pinia)
  .use(permissionPlugin, {
    rules: permissionRules,
    actions: permissionActions
  })
  .use(dxpComponents, {
    defaultImgUrl: new URL("@/assets/images/defaultImage.png", import.meta.url).href,
    login,
    logout,
    loader,
    appLoginUrl: import.meta.env.VITE_LOGIN_URL as string,
    getConfig,
    initialise,
    localeMessages,
    getAvailableTimeZones,
  });

// Filters are removed in Vue 3 and global filter introduced https://v3.vuejs.org/guide/migration/filters.html#global-filters
app.config.globalProperties.$filters = {
  formatDate(value: any, inFormat?: string, outFormat?: string) {
    // TODO Make default format configurable and from environment variables
    if(inFormat){
      return DateTime.fromFormat(value, inFormat).toFormat(outFormat ? outFormat : 'MM-DD-YYYY');
    }
    return DateTime.fromISO(value).toFormat(outFormat ? outFormat : 'MM-DD-YYYY');
  },
  formatUtcDate(value: any, inFormat?: any, outFormat?: string) {
    // TODO Make default format configurable and from environment variables
    const userStore = useUserStore(pinia);
    const userProfile = userStore.getUserProfile;
    // TODO Fix this setDefault should set the default timezone instead of getting it everytiem and setting the tz
    
    return DateTime.utc(value, inFormat).setZone(userProfile.userTimeZone).toFormat(outFormat ? outFormat : 'MM-DD-YYYY')
  },
  getFeature(featureHierarchy: any, featureKey: string) {
    let  featureValue = ''
    if (featureHierarchy) {
      const feature = featureHierarchy.find((featureItem: any) => featureItem.startsWith(featureKey))
      const featureSplit = feature ? feature.split('/') : [];
      featureValue = featureSplit[2] ? featureSplit[2] : '';
    }
    return featureValue;
  }
}


router.isReady().then(() => {
  app.mount('#app');
});