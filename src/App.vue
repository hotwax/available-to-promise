<template>
  <ion-app>
    <IonSplitPane content-id="main" when="lg">
      <Menu />
      <ion-router-outlet id="main"></ion-router-outlet>
    </IonSplitPane>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, IonSplitPane, loadingController } from '@ionic/vue';
import { computed, onBeforeMount, onMounted, onUnmounted, ref } from 'vue';
import emitter from "@/event-bus"
import { Settings } from 'luxon'
import Menu from '@/components/Menu.vue';
import store from "./store";
import { translate } from '@hotwax/dxp-components';
import { initialise, resetConfig } from '@/adapter'


const userProfile = computed(() => store.getters["user/getUserProfile"])
const userToken = computed(() => store.getters["user/getUserToken"])
const instanceUrl = computed(() => store.getters["user/getInstanceUrl"])

const loader = ref(null) as any
const maxAge = process.env.VUE_APP_CACHE_MAX_AGE ? parseInt(process.env.VUE_APP_CACHE_MAX_AGE) : 0

initialise({
  token: userToken.value,
  instanceUrl: instanceUrl.value,
  cacheMaxAge: maxAge,
  events: {
    responseError: () => {
      setTimeout(() => dismissLoader(), 100);
    },
    queueTask: (payload: any) => {
      emitter.emit("queueTask", payload);
    }
  }
})

async function presentLoader(options = { message: '', backdropDismiss: true }) {
  // When having a custom message remove already existing loader
  if(options.message && loader.value) dismissLoader();

  if (!loader.value) {
    loader.value = await loadingController
    .create({
      message: options.message ? translate(options.message) : translate("Click the backdrop to dismiss."),
      translucent: true,
      backdropDismiss: options.backdropDismiss
    });
  }
  loader.value.present();
}

function dismissLoader() {
  if (loader.value) {
    loader.value.dismiss();
    loader.value = null as any;
  }
}

onBeforeMount(() => {
  emitter.on('presentLoader', presentLoader);
  emitter.on('dismissLoader', dismissLoader);
})

onMounted(async () => {
  // Handles case when user resumes or reloads the app
  // Luxon timezzone should be set with the user's selected timezone
  if (userProfile.value && userProfile.value.timeZone) {
    Settings.defaultZone = userProfile.value.userTimeZone;
  }
})

onUnmounted(() => {
  emitter.off("presentLoader", presentLoader);
  emitter.off("dismissLoader", dismissLoader);

  resetConfig()
})
</script>
