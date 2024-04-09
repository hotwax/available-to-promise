<template>
  <ion-menu content-id="main" type="overlay" :disabled="!isUserAuthenticated">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ translate("Available to Promise") }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-menu-toggle auto-hide="false" v-for="(page, index) in appPages" :key="index">
          <ion-item 
            button
            router-direction="root"
            :router-link="page.url"
            class="hydrated"
            :class="{ selected: selectedIndex === index}">
            <ion-icon slot="start" :ios="page.iosIcon" :md="page.mdIcon"></ion-icon>
            <ion-label>{{ page.title }}</ion-label>
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
          <ion-note slot="end">{{ userProfile?.timeZone }}</ion-note>
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
  
<script setup lang="ts">
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
  import { computed } from "vue";
  import { useStore } from "@/store";
  import { useRouter } from "vue-router";
  import { cloudUploadOutline, globeOutline, optionsOutline, settingsOutline, sendOutline, storefrontOutline, pulseOutline } from 'ionicons/icons';
  import { translate } from "@/i18n";

  const store = useStore();
  const router = useRouter();
  const appPages = [
        {
          title: "Threshold",
          url: "/threshold",
          childRoutes: ["/create-threshold"],
          iosIcon: globeOutline,
          mdIcon: globeOutline
        },
        {
          title: "Safety stock",
          url: "/safety-stock",
          childRoutes: ["/create-safety-stock"],
          iosIcon: pulseOutline,
          mdIcon: pulseOutline
        },
        {
          title: "Store pickup",
          url: "/store-pickup",
          childRoutes: ["/create-store-pickup"],
          iosIcon: storefrontOutline,
          mdIcon: storefrontOutline
        },
        {
          title: "Shipping",
          url: "/shipping",
          childRoutes: ["/create-shipping"],
          iosIcon: sendOutline,
          mdIcon: sendOutline
        },
        {
          title: "Inventory channels",
          url: "/inventory-channels",
          iosIcon: cloudUploadOutline,
          mdIcon: cloudUploadOutline
        },
        {
          title: "Settings",
          url: "/settings",
          iosIcon: settingsOutline,
          mdIcon: settingsOutline
        }
      ];

  const userProfile = computed(() => store.getters["user/getUserProfile"])
  const isUserAuthenticated = computed(() => store.getters["user/isUserAuthenticated"])
  const eComStore = computed(() => store.getters["user/getCurrentEComStore"])
  const instanceUrl = computed(() => store.getters["user/getInstanceUrl"])
  const selectedIndex = computed(() => {
    const path = router.currentRoute.value.path;
    return appPages.findIndex((screen) => screen.url === path);
  });

  function setEComStore(event: CustomEvent) {
    if(userProfile.value?.stores) {
      store.dispatch("user/setEcomStore", {
        "productStoreId": event.detail.value
      })
    }
  }
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
  

