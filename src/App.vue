<template>
  <ion-app>
    <ion-menu side="start" menu-id="first" content-id="main">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ $t("Menu") }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item button @click="closeMenu(); router.push('/select-product')">
            <ion-icon :icon="options" slot="start" />
            <ion-label>{{ $t("Threshold Management") }}</ion-label>
          </ion-item>
          <ion-item button @click="closeMenu(); router.push('/settings')">
            <ion-icon :icon="settings" slot="start" />
            <ion-label>{{ $t("Settings") }}</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>
    <ion-router-outlet id="main" />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonContent, IonHeader, IonItem, IonIcon, IonLabel, IonList, IonMenu, IonTitle, IonToolbar, IonRouterOutlet, menuController } from '@ionic/vue';
import { defineComponent } from 'vue';
import { loadingController } from '@ionic/vue';
import { options, settings } from 'ionicons/icons';
import emitter from "@/event-bus"
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'App',
  components: {
    IonApp, IonContent, IonHeader, IonItem, IonIcon, IonLabel, IonList, IonMenu, IonTitle, IonToolbar, IonRouterOutlet
  },
  data() {
    return {
      loader: null as any
    };
  },
  methods: {
    async presentLoader() {
      if (!this.loader) {
        this.loader = await loadingController
        .create({
          message: this.$t("Click the backdrop to dismiss."),
          translucent: true,
          backdropDismiss: true
        });
      }
      this.loader.present();
    },
    dismissLoader() {
      if (this.loader) {
        this.loader.dismiss();
        this.loader = null as any;
      }
    },
    async closeMenu() {
      await menuController.close();
    }
  },
  async mounted() {
    this.loader = await loadingController
    .create({
      message: this.$t("Click the backdrop to dismiss."),
      translucent: true,
      backdropDismiss: true
    });
    emitter.on('presentLoader', this.presentLoader);
    emitter.on('dismissLoader', this.dismissLoader);
  },
  unmounted() {
    emitter.off('presentLoader', this.presentLoader);
    emitter.off('dismissLoader', this.dismissLoader);
  },
  setup() {
    const router = useRouter();

    return {
      options,
      settings,
      router
    }
  }
});
</script>
