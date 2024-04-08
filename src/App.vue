<template>
  <ion-app>
    <Menu />
    <ion-router-outlet id="main" />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, loadingController } from '@ionic/vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import emitter from "@/event-bus"
import { Settings } from 'luxon'
import Menu from '@/components/Menu.vue';
import store from "./store";
import { translate } from './i18n';


const loader = ref(null) as any
const userProfile = computed(() => store.getters["user/getUserProfile"])

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

onMounted(async () => {
  loader.value = await loadingController
    .create({
      message: translate("Click the backdrop to dismiss."),
      translucent: true,
      backdropDismiss: true
    });
  emitter.on('presentLoader', presentLoader);
  emitter.on('dismissLoader', dismissLoader);

  // Handles case when user resumes or reloads the app
  // Luxon timezzone should be set with the user's selected timezone
  if (userProfile.value && userProfile.value.timeZone) {
    Settings.defaultZone = userProfile.value.userTimeZone;
  }
})

onUnmounted(() => {
  emitter.off("presentLoader", presentLoader);
  emitter.off("dismissLoader", dismissLoader);
})
</script>
