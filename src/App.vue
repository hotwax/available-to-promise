<template>
  <ion-app>
    <IonSplitPane content-id="main" when="lg">
      <Menu />
      <ion-router-outlet id="main"></ion-router-outlet>
    </IonSplitPane>
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/vue';
import { defineComponent } from 'vue';
import { loadingController } from '@ionic/vue';
import { options, settings, pulseOutline } from 'ionicons/icons';
import emitter from "@/event-bus"
import { useRouter } from 'vue-router';
import { mapGetters, useStore } from 'vuex';
import { Settings } from 'luxon'
import Menu from '@/components/Menu.vue';

export default defineComponent({
  name: 'App',
  components: {
    Menu,
    IonApp,
    IonRouterOutlet,
    IonSplitPane
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
      userToken: 'user/getUserToken',
      isAuthenticated: 'user/isAuthenticated',
    })
  },
  methods: {
    async presentLoader(options = { message: '', backdropDismiss: true }) {
      // When having a custom message remove already existing loader
      if(options.message && this.loader) this.dismissLoader();

      if (!this.loader) {
        this.loader = await loadingController
        .create({
          message: options.message ? this.$t(options.message) : this.$t("Click the backdrop to dismiss."),
          translucent: true,
          backdropDismiss: options.backdropDismiss
        });
      }
      this.loader.present();
    },
    dismissLoader() {
      if (this.loader) {
        this.loader.dismiss();
        this.loader = null as any;
      }
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
    const store = useStore();

    return {
      options,
      pulseOutline,
      settings,
      store,
      router
    }
  }
});
</script>
<style>
  ion-split-pane {
    --side-width: 304px;
  }
</style>
