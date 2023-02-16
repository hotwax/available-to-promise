<template>
  <ion-menu side="start" menu-id="first" content-id="main" type="overlay" :disabled="!isUserAuthenticated">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ $t("Menu") }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item v-if="hasPermission('APP_SELECT_PRODUCT_VIEW')" button @click="closeMenu(); router.push('/select-product')">
          <ion-icon :icon="options" slot="start" />
          <ion-label>{{ $t("Threshold Management") }}</ion-label>
        </ion-item>
        <ion-item v-if="hasPermission('APP_THRESHOLD_UPDATES_VIEW')" button @click="closeMenu(); router.push('/threshold-updates')">
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
    IonNote,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
    menuController
  } from "@ionic/vue";
  import { defineComponent } from "vue";
  import { mapGetters } from "vuex";
  import { useStore } from "@/store";
  import { hasPermission } from "@/authorization";
  import { useRouter } from "vue-router";
import { options, settings, pulseOutline } from 'ionicons/icons';
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
      async closeMenu() {
       await menuController.close();
      },
      async setEComStore(event: CustomEvent) {
        if(this.userProfile && this.eComStore?.productStoreId !== event.detail.value) {
          await this.store.dispatch('user/setEcomStore', { 'productStoreId': event.detail.value })
          emitter.emit("productStoreChanged")
        }
      }
    },
    setup() {
      const store = useStore();
      const router = useRouter();
      return {
        router,
        pulseOutline,
        hasPermission,
        options,
        settings,
        store
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
  

