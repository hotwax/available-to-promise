<template>
  <ion-app>
    <Menu />
    <ion-router-outlet id="main" />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { defineComponent } from 'vue';
import { loadingController } from '@ionic/vue';
import { options, settings, pulseOutline } from 'ionicons/icons';
import emitter from "@/event-bus"
import { useRouter } from 'vue-router';
import { mapGetters } from 'vuex';
import { Settings } from 'luxon'
import Menu from '@/components/Menu.vue';

export default defineComponent({
  name: 'App',
  components: {
    Menu,
    IonApp,
    IonRouterOutlet
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
