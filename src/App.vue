<template>
  <ion-app>
    <ion-split-pane content-id="main-content" when="lg">
      <ion-menu side="start" content-id="main-content" type="overlay" :disabled="!isAuthenticated || (router.currentRoute.value.name as string) === 'Login'">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ translate("Available to Promise") }}</ion-title>
          </ion-toolbar>
        </ion-header>

        <ion-content>
          <ion-list>
            <ion-menu-toggle :auto-hide="false" v-for="(page, index) in menuItems" :key="index">
              <ion-item
                button
                router-direction="root"
                :router-link="page.url"
                class="hydrated"
                :class="{ selected: selectedIndex === index }">
                <ion-icon slot="start" :ios="page.icon" :md="page.icon" />
                <ion-label>{{ translate(page.title) }}</ion-label>
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
            <ion-item v-if="productStores?.length > 1" lines="none">
              <ion-select interface="popover" :value="currentProductStore.productStoreId" @ionChange="setProductStore($event)">
                <ion-select-option v-for="store in productStores" :key="store.productStoreId" :value="store.productStoreId" >{{ store.storeName ? store.storeName : store.productStoreId }}</ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item v-else lines="none">
              <ion-label class="ion-text-wrap">
                {{ currentProductStore.storeName ? currentProductStore.storeName : currentProductStore.productStoreId }}
              </ion-label>
            </ion-item>
          </ion-toolbar>
        </ion-footer>
      </ion-menu>
      <ion-router-outlet id="main-content" />
    </ion-split-pane>
  </ion-app>
</template>

<script setup lang="ts">
import { alertController, IonApp, IonContent, IonFooter, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle, IonNote, IonRouterOutlet, IonSelect, IonSelectOption, IonSplitPane, IonTitle, IonToolbar, loadingController, SelectCustomEvent } from "@ionic/vue";
import { computed, onBeforeMount, onMounted, onUnmounted, ref } from "vue";
import { translate, emitter, commonUtil } from "@common";
import { Settings } from "luxon";
import { useUserStore } from "@/store/user";
import { useProductStore } from "@/store/productStore";
import router from './router';
import { useAuth } from "@common/composables/auth";

const userStore = useUserStore();
const productStore = useProductStore();
const { isAuthenticated } = useAuth();
const loader = ref<any>(null);

const userProfile = computed(() => userStore.getUserProfile);
const currentProductStore = computed(() => productStore.getCurrentProductStore);
const productStores = computed(() => productStore.getProductStores);
const instanceUrl = computed(() => commonUtil.getOmsURL());

const menuItems = computed(() => {
  return router.getRoutes()
    .filter(route => route.meta && route.meta.menuIndex)
    .filter(route => !route.meta.permissionId || (userStore as any).hasPermission(route.meta.permissionId as string))
    .sort((a, b) => (a.meta!.menuIndex as number) - (b.meta!.menuIndex as number))
    .map(route => ({
      title: route.meta!.title as string,
      url: route.path,
      icon: route.meta!.icon as string,
      childRoutes: route.meta!.childRoutes as string[],
      menuIndex: route.meta!.menuIndex as number
    }));
});

const selectedIndex = computed(() => {
  const path = router.currentRoute.value.path;
  return menuItems.value.findIndex((item) => item.url === path || item.childRoutes?.includes(path) || item.childRoutes?.some((route: any) => path.includes(route)));
});

async function presentLoader(options = { message: "", backdropDismiss: true }) {
  if (options.message && loader.value) dismissLoader();

  if (!loader.value) {
    loader.value = await loadingController.create({
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
    loader.value = null;
  }
}

async function setProductStore(event: SelectCustomEvent) {
  const createUpdateRoute = ["/create-threshold", "/update-threshold/", "/create-safety-stock", "/update-safety-stock/", "/create-store-pickup", "update-store-pickup/", "/create-shipping", "/update-shipping/"]
  const path = router.currentRoute.value.path;
  if(productStores.value) {
    if(createUpdateRoute.some((route) => path.includes(route))) {
      const alert = await alertController.create({
        header: translate("Leave page"),
        message: translate("Any page made on this page will be lost. You will not be able to reverse this action."),
        buttons: [
          {
            text: translate("No"),
            role: "cancel",
            handler: async () => {
              // Reverting the selected productStore in ion-select if user select no to change product store.
              event.target.value = currentProductStore.value.productStoreId
            }
          },
          {
            text: translate("Yes"),
            handler: async () => {
              await productStore.setCurrentProductStore({
                "productStoreId": event.detail.value
              })
              emitter.emit("productStoreOrConfigChanged")
            }
          }
        ]
      })
 
      alert.present();
    } else {
      productStore.setCurrentProductStore({
        "productStoreId": event.detail.value
      })
      emitter.emit("productStoreOrConfigChanged")
    }
  }
}

onBeforeMount(() => {
  emitter.on("presentLoader", presentLoader as any);
  emitter.on("dismissLoader", dismissLoader as any);
});

onMounted(() => {
  if (userProfile.value && userProfile.value.timeZone) {
    Settings.defaultZone = userProfile.value.timeZone;
  }
});

onUnmounted(() => {
  emitter.off("presentLoader", presentLoader as any);
  emitter.off("dismissLoader", dismissLoader as any);
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
