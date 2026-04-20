<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ translate("Settings") }}</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <div class="user-profile">
        <ion-card>
          <ion-item lines="full">
            <ion-avatar slot="start" v-if="userProfile?.partyImageUrl">
              <Image :src="userProfile.partyImageUrl"/>
            </ion-avatar>
            <!-- ion-no-padding to remove extra side/horizontal padding as additional padding 
            is added on sides from ion-item and ion-padding-vertical to compensate the removed
            vertical padding -->
            <ion-card-header class="ion-no-padding ion-padding-vertical">
              <ion-card-subtitle>{{ userProfile.userId }}</ion-card-subtitle>
              <ion-card-title>{{ userProfile?.userFullName }}</ion-card-title>
            </ion-card-header>
          </ion-item>
          <ion-button color="danger" @click="logout()">{{ translate("Logout") }}</ion-button>
          <ion-button :standalone-hidden="!userStore.hasPermission('COMMON_ADMIN')" fill="outline" @click="goToLaunchpad()">
            {{ translate("Go to Launchpad") }}
            <ion-icon slot="end" :icon="openOutline" />
          </ion-button>
        </ion-card>
      </div>
      <div class="section-header">
        <h1>{{ translate('OMS') }}</h1>
      </div>
      <section>
        <DxpOmsInstanceNavigator />

        <ion-card>
          <ion-card-header>
            <ion-card-subtitle>
              {{ translate("Product Store") }}
            </ion-card-subtitle>
            <ion-card-title>
              {{ translate("Store") }}
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            {{ translate('A store repesents a company or a unique catalog of products. If your OMS is connected to multiple eCommerce stores sellling different collections of products, you may have multiple Product Stores set up in HotWax Commerce.') }}
          </ion-card-content>
          <ion-item lines="none">
            <ion-select :label="translate('Select store')" interface="popover" :value="currentProductStore.productStoreId" @ionChange="setProductStore($event)">
              <ion-select-option v-for="store in (productStores)" :key="store.productStoreId" :value="store.productStoreId" >{{ store.storeName ? store.storeName : store.productStoreId }}</ion-select-option>
            </ion-select>
          </ion-item>
        </ion-card>
      </section>
      <hr />

      <DxpAppVersionInfo />

      <section>
        <DxpTimeZoneSwitcher />
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {  IonAvatar, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonMenuButton, IonPage, IonSelect, IonSelectOption, IonTitle, IonToolbar, modalController } from '@ionic/vue';
import { computed, ref } from 'vue';
import router from "@/router";
import { openOutline } from 'ionicons/icons'
import { useUserStore } from '@/store/user';
import { useRuleStore } from '@/store/rule';
import { useProductStore } from '@/store/productStore';
import Image from '@/components/Image.vue'
import { translate } from "@common";
import DxpAppVersionInfo from '@/components/DxpAppVersionInfo.vue';
import DxpOmsInstanceNavigator from '@/components/DxpOmsInstanceNavigator.vue';
import DxpTimeZoneSwitcher from '@/components/DxpTimeZoneSwitcher.vue';
import { useAuth } from '@common/composables/auth';

const userStore = useUserStore()
const ruleStore = useRuleStore()
const { logout: authLogout } = useAuth();

const userProfile = computed(() => userStore.getUserProfile)
const currentProductStore = computed(() => useProductStore().getCurrentProductStore)
const productStores = computed(() => useProductStore().getProductStores)
const props = defineProps({
  showBrowserTimeZone: {
    type: Boolean,
    default: true
  },
  showDateTime: {
    type: Boolean,
    default: true
  },
  dateTimeFormat: {
    type: String,
    default: 't ZZZZ'
  }
})

function setProductStore(event: CustomEvent) {
  if (productStores) {
    useProductStore().setCurrentProductStore({
      "productStoreId": event.detail.value
    })
    ruleStore.clearRuleState()
  }
}

async function logout() {
  useAuth().logout({ isUserUnauthorised: false }).then((redirectionUrl: any) => {
    // redirectionUrl is only present when SSO enables, thus when not present redirect user to login
    if(!redirectionUrl) {
      router.replace("/login");
    } else {
      window.location.href = redirectionUrl
    }
  })
}

function goToLaunchpad() {
  window.location.href = `${import.meta.env.VITE_LOGIN_URL}`
}
</script>

<style scoped>
  ion-card > ion-button {
    margin: var(--spacer-xs);
  }
  section {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    align-items: start;
  }
  .user-profile {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  }
  hr {
    border-top: 1px solid var(--border-medium);
  }
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacer-xs) 10px 0px;
  }
</style>
