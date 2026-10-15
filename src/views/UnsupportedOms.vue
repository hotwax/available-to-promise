<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>{{ translate("Available to Promise") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-card>
        <ion-card-header>
          <ion-card-subtitle v-if="omsVersion">
            {{ translate("OMS version {version}", { version: omsVersion }) }}
          </ion-card-subtitle>
          <ion-card-title>{{ translate("This app is no longer compatible with your OMS") }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          {{ translate("Inventory rules for your OMS are now managed in the Order Routing app.") }}
        </ion-card-content>
        <ion-button fill="clear" :disabled="!orderRoutingUrl" @click="openOrderRouting()">
          {{ translate("Open Order Routing") }}
          <ion-icon slot="end" :icon="openOutline" />
        </ion-button>
        <ion-button fill="clear" color="danger" @click="logout()">
          {{ translate("Logout") }}
        </ion-button>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { buildAppUrl, translate } from "@common";
import { useAuth } from "@common/composables/useAuth";
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from "@ionic/vue";
import { openOutline } from "ionicons/icons";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/store/user";
import { getOrderRoutingPath } from "@/utils/omsCompatibility";

const route = useRoute();
const userStore = useUserStore();

const omsVersion = computed(() => userStore.omsCompatibility.omsVersion);
const orderRoutingUrl = computed(() => buildAppUrl("order-routing", getOrderRoutingPath(route.query.from)));

function openOrderRouting() {
  if(orderRoutingUrl.value) {
    window.location.assign(orderRoutingUrl.value);
  }
}

async function logout() {
  await useAuth().logout({ isUserUnauthorised: false });
}
</script>
