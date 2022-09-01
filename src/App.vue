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
          <ion-item button @click="closeMenu(); router.push('/threshold-updates')">
            <ion-icon :icon="pulseOutline" slot="start" />
            <ion-label>{{ $t("Threshold Updates") }}</ion-label>
          </ion-item>
          <ion-item button @click="closeMenu(); router.push('/settings')">
            <ion-icon :icon="settings" slot="start" />
            <ion-label>{{ $t("Settings") }}</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
      <ion-footer>
        <ion-toolbar>
          <ion-item lines="none">
            <ion-label class="ion-text-wrap">
              <p class="overline">{{ instanceUrl }}</p>
              {{ eComStore?.storeName }}
            </ion-label>
            <ion-note slot="end">{{ userProfile?.userTimeZone }}</ion-note>
          </ion-item>
        </ion-toolbar>
      </ion-footer>
    </ion-menu>
    <ion-router-outlet id="main" />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonContent, IonFooter, IonHeader, IonItem, IonIcon, IonLabel, IonList, IonMenu, IonNote, IonTitle, IonToolbar, IonRouterOutlet, menuController } from '@ionic/vue';
import { defineComponent } from 'vue';
import { loadingController } from '@ionic/vue';
import { options, settings, pulseOutline } from 'ionicons/icons';
import emitter from "@/event-bus"
import { useRouter } from 'vue-router';
import { mapGetters } from 'vuex';
import { Settings } from 'luxon'

export default defineComponent({
  name: 'App',
  components: {
    IonApp, IonContent, IonFooter, IonHeader, IonItem, IonIcon, IonLabel, IonList, IonMenu, IonNote, IonTitle, IonToolbar, IonRouterOutlet
  },
  data() {
    return {
      loader: null as any
    };
  },
  computed: {
    ...mapGetters({
      instanceUrl: 'user/getInstanceUrl',
      userProfile: 'user/getUserProfile',
      eComStore: 'user/getCurrentEComStore'
    })
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
    // Handles case when user resumes or reloads the app
    // Luxon timezzone should be set with the user's selected timezone
    if (this.userProfile && this.userProfile.userTimeZone) {
      Settings.defaultZone = this.userProfile.userTimeZone;
    }
  },
  unmounted() {
    emitter.off('presentLoader', this.presentLoader);
    emitter.off('dismissLoader', this.dismissLoader);
  },
  setup() {
    const router = useRouter();

    return {
      options,
      pulseOutline,
      settings,
      router
    }
  }
});
</script>
