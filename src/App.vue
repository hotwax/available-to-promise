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
import { Settings } from 'luxon'
import Menu from '@/components/Menu.vue';
import { useUserStore } from "@/store/user";
import { translate, emitter } from '@common';

const userStore = useUserStore();
const userProfile = computed(() => userStore.getUserProfile)

const loader = ref(null) as any

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
  emitter.on('presentLoader', presentLoader as any);
  emitter.on('dismissLoader', dismissLoader as any);
})

onMounted(async () => {
  // Handles case when user resumes or reloads the app
  // Luxon timezzone should be set with the user's selected timezone
  if (userProfile.value && userProfile.value.timeZone) {
    Settings.defaultZone = userProfile.value.userTimeZone;
  }
})

onUnmounted(() => {
  emitter.off("presentLoader", presentLoader as any);
  emitter.off("dismissLoader", dismissLoader as any);
})
</script>
