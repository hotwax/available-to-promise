<template>
  <ion-menu side="start" menu-id="first" content-id="main" type="overlay" :disabled="!isUserAuthenticated">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ $t("Menu") }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-menu-toggle auto-hide="false" v-for="(p,i) in appPages" :key="i">
          <ion-item 
          button
          router-direction="root"
          :router-link="p.url"
          class="hydrated"
          :class="{ selected: selectedIndex === i}">
          <ion-icon slot="start" :ios="p.iosIcon" :md="p.mdIcon"></ion-icon>
          <ion-label>{{ p.title }}</ion-label>
          </ion-item>
        </ion-menu-toggle>
      </ion-list>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <ion-item lines="none">
          <ion-label class="ion-text-wrap">
            <p class="overline">{{ instanceUrl }}</p>
          </ion-label>
          <ion-note slot="end">{{ userProfile?.userTimeZone }}</ion-note>
        </ion-item>
        <ion-item v-if="userProfile?.stores?.length > 1" lines="none">
          <ion-select interface="popover" :value="eComStore.productStoreId" @ionChange="setEComStore($event)">
            <ion-select-option v-for="store in (userProfile?.stores ? userProfile.stores : [])" :key="store.productStoreId" :value="store.productStoreId" >{{ store.storeName }}</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item v-else lines="none">
          <ion-label class="ion-text-wrap">
            {{ eComStore.storeName }}
          </ion-label>
        </ion-item>
      </ion-toolbar>
    </ion-footer>
  </ion-menu>
</template>
  
<script lang="ts">
  import {
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuToggle,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
  } from "@ionic/vue";
  import { defineComponent, computed } from "vue";
  import { mapGetters } from "vuex";
  import { useStore } from "@/store";
  import { useRouter } from "vue-router";
  import { optionsOutline, settingsOutline, pulseOutline } from 'ionicons/icons';
  import emitter from "@/event-bus";
  
  export default defineComponent({
    name: "Menu",
    components: {
      IonContent,
      IonFooter,
      IonHeader,
      IonIcon,
      IonItem,
      IonLabel,
      IonList,
      IonMenu,
      IonMenuToggle,
      IonNote,
      IonSelect,
      IonSelectOption,
      IonTitle,
      IonToolbar
    },
    computed: {
      ...mapGetters({
        isUserAuthenticated: 'user/isUserAuthenticated',
        eComStore: 'user/getCurrentEComStore',
        instanceUrl: 'user/getInstanceUrl',
        userProfile: 'user/getUserProfile',
      })
    },
    methods: {
      async setEComStore(event: CustomEvent) {
        if(this.eComStore.productStoreId !== event.detail.value) {
          await this.store.dispatch('user/setEcomStore', { 'productStoreId': event.detail.value })
          emitter.emit("productStoreChanged")
        }
      },
    },
    setup() {
      const store = useStore();
      const router = useRouter();
      const appPages = [
        {
          title: "Create Rule",
          url: "/select-product",
          childRoutes: ['/select-product'],
          iosIcon: optionsOutline,
          mdIcon: optionsOutline
        },
        {
          title: "Rule Pipeline",
          url: "/threshold-updates",
          childRoutes: ['/threshold-updates'],
          iosIcon: pulseOutline,
          mdicon: pulseOutline
        },
        {
          title: "Settings",
          url: "/Settings",
          iosIcon: settingsOutline,
          mdIcon: settingsOutline
        }
      ];
      const selectedIndex = computed(() => {
      const path = router.currentRoute.value.path
      return appPages.findIndex((screen) => screen.url === path || screen.childRoutes?.includes(path) || screen.childRoutes?.some((route: any) => path.includes(route)))
    })

      return {
        appPages,
        router,
        pulseOutline,
        optionsOutline,
        settingsOutline,
        store,
        selectedIndex
      };
    },
  });
  </script>
  
  <style scoped>
  ion-menu.md ion-item.selected ion-icon {
    color: var(--ion-color-secondary);
  }
  ion-menu.ios ion-item.selected ion-icon {
    color: var(--ion-color-secondary);
  }
  ion-item.selected {
    --color: var(--ion-color-secondary);
  }
  </style>
  

