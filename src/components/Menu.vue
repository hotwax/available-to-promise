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
            <ion-select-option v-for="store in (userProfile?.stores ? userProfile.stores : [])" :key="store.productStoreId" :value="store.productStoreId" >{{ store.storeName ? store.storeName : store.productStoreId }}</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item v-else lines="none">
          <ion-label class="ion-text-wrap">
            {{ eComStore.storeName ? eComStore.storeName : eComStore.productStoreId }}
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
    alertController,
    SelectCustomEvent
  } from "@ionic/vue";
  import { computed } from "vue";
  import { useStore } from "@/store";
  import { useRouter } from "vue-router";
  import { cloudUploadOutline, globeOutline, settingsOutline, sendOutline, storefrontOutline, pulseOutline } from 'ionicons/icons';
  import { translate } from "@/i18n";
  import emitter from "@/event-bus";

  const store = useStore();
  const router = useRouter();
  const appPages = [
        {
          title: "Threshold",
          url: "/threshold",
          childRoutes: ["/create-threshold", "/update-threshold/"],
          iosIcon: globeOutline,
          mdIcon: globeOutline
        },
        {
          title: "Safety stock",
          url: "/safety-stock",
          childRoutes: ["/create-safety-stock", "/update-safety-stock/"],
          iosIcon: pulseOutline,
          mdIcon: pulseOutline
        },
        {
          title: "Store pickup",
          url: "/store-pickup",
          childRoutes: ["/create-store-pickup", "update-store-pickup/"],
          iosIcon: storefrontOutline,
          mdIcon: storefrontOutline
        },
        {
          title: "Shipping",
          url: "/shipping",
          childRoutes: ["/create-shipping", "/update-shipping/"],
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
    return appPages.findIndex((screen) => screen.url === path || screen.childRoutes?.includes(path) || screen.childRoutes?.some((route) => path.includes(route)));
  });

  async function setEComStore(event: SelectCustomEvent) {
    const createUpdateRoute = ["/create-threshold", "/update-threshold/", "/create-safety-stock", "/update-safety-stock/", "/create-store-pickup", "update-store-pickup/", "/create-shipping", "/update-shipping/"]
    const path = router.currentRoute.value.path;
    if(userProfile.value?.stores) {
      if(createUpdateRoute.some((route) => path.includes(route))) {
        const alert = await alertController.create({
          header: translate("Leave page"),
          message: translate("Any page made on this page will be lost. You will not be able to reverse this action."),
          buttons: [
            {
              text: translate("No"),
              role: "cancel",
              handler: async () => {
                // Reverting the selected ecomStore in ion-select if user select no to change product store.
                event.target.value = eComStore.value.productStoreId
              }
            },
            {
              text: translate("Yes"),
              handler: async () => {
                await store.dispatch("user/setEcomStore", {
                  "productStoreId": event.detail.value
                })
                emitter.emit("productStoreOrConfigChanged")
              }
            }
          ]
        })

        alert.present();
      } else {
        store.dispatch("user/setEcomStore", {
          "productStoreId": event.detail.value
        })
        emitter.emit("productStoreOrConfigChanged")
      }
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
  

