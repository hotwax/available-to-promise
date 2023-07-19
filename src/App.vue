<template>
  <ion-app>
    <Menu />
    <ion-router-outlet id="main" />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { defineComponent, provide, ref } from 'vue';
import { loadingController } from '@ionic/vue';
import { options, settings, pulseOutline } from 'ionicons/icons';
import emitter from "@/event-bus"
import { useRouter } from 'vue-router';
import { mapGetters, useStore } from 'vuex';
import { Settings } from 'luxon'
import Menu from '@/components/Menu.vue';
import { initialise, resetConfig } from '@/adapter'
import { useProductIdentificationStore } from '@hotwax/dxp-components';
import { showToast } from './utils';

export default defineComponent({
  name: 'App',
  components: {
    Menu,
    IonApp,
    IonRouterOutlet
  },
  data() {
    return {
      loader: null as any,
      maxAge: process.env.VUE_APP_CACHE_MAX_AGE ? parseInt(process.env.VUE_APP_CACHE_MAX_AGE) : 0,
      alias: JSON.parse(process.env.VUE_APP_ALIAS) as any,
      defaultAlias: process.env.VUE_APP_DEFAULT_ALIAS,
    };
  },
  computed: {
    ...mapGetters({
      instanceUrl: 'user/getInstanceUrl',
      userProfile: 'user/getUserProfile',
      eComStore: 'user/getCurrentEComStore',
      userToken: 'user/getUserToken',
      isAuthenticated: 'user/isAuthenticated',
      currentEComStore: "user/getCurrentEComStore",
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
    async unauthorized() {
      this.store.dispatch("user/logout");
      this.router.push("/login")
    }
  },
  created() {
    initialise({
      token: this.userToken,
      instanceUrl: this.instanceUrl,
      cacheMaxAge: this.maxAge,
      events: {
        unauthorised: this.unauthorized,
        responseError: () => {
          setTimeout(() => this.dismissLoader(), 100);
        },
        queueTask: (payload: any) => {
          emitter.emit("queueTask", payload);
        }
      }
    })
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
    if (this.isAuthenticated && !this.instanceUrl && !process.env.VUE_APP_BASE_URL) {
      // If the current URL is available in alias show it for consistency
      const defaultAliasInstanceUrl = this.alias[this.defaultAlias];
      this.store.dispatch("user/setUserInstanceUrl", defaultAliasInstanceUrl);
    }

    // Get product identification from api using dxp-component and set the state if eComStore is defined
    if (this.currentEComStore.productStoreId) {
      await useProductIdentificationStore().getIdentificationPref(this.currentEComStore.productStoreId)
        .catch((error) => console.log(error));
    }
  },
  unmounted() {
    emitter.off('presentLoader', this.presentLoader);
    emitter.off('dismissLoader', this.dismissLoader);
    resetConfig()
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    /* Start Product Identifier */

    const productIdentificationStore = useProductIdentificationStore();

    // Reactive state for productIdentificationPref
    let productIdentificationPref = ref(
      productIdentificationStore.$state.productIdentificationPref
    );

    // Providing productIdentificationPref to child components
    provide('productIdentificationPref', productIdentificationPref);

    // Subscribing to productIdentificationStore state change and changing value productIdentificationPref 
    // to store state based on condition
    productIdentificationStore.$subscribe((mutation: any, state) => {

      // If primaryId is '' then api call not changed the state, so not changing the productIdentificationPref
      if (state.productIdentificationPref.primaryId != "") {

        // If old state value is same as the new state value then not changing the preference
        if (mutation.events.oldValue.primaryId != state.productIdentificationPref.primaryId || mutation.events.oldValue.secondaryId != state.productIdentificationPref.secondaryId) {
          productIdentificationPref.value = state.productIdentificationPref;

          // If primary and secondary preference is '' then it was initial state value before api call show don't show toast
          if (mutation.events.oldValue.primaryId != "" && mutation.events.oldValue.secondaryId != "") {
            showToast("Product identifier preference updated");
          }
        }
      }
    });

    /* End Product Identifier */

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
