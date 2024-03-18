<template>
  <ion-card v-if="selectedPage.path === '/store-pickup'">
    <ion-card-header>
      <ion-card-subtitle class="overline">{{ "Facility ID" }}</ion-card-subtitle>
      <ion-card-title>{{ "Facility Name" }}</ion-card-title>
    </ion-card-header>

    <ion-item lines="none">
      <ion-icon :icon="storefrontOutline" slot="start" />
      <ion-toggle>{{ translate("Store pickup") }}</ion-toggle>
    </ion-item>
  </ion-card>

  <ion-card v-else>
    <ion-card-header>
      <ion-card-subtitle class="overline">{{ "Facility ID" }}</ion-card-subtitle>
      <ion-card-title>{{ "Facility Name" }}</ion-card-title>
    </ion-card-header>

    <ion-item lines="none">
      <ion-text slot="start">10</ion-text>
      <ion-progress-bar />
      <ion-chip slot="end" outline>20</ion-chip>
    </ion-item>

    <ion-item detail button lines="none">
      <ion-label>{{ translate("View order count history") }}</ion-label>
    </ion-item>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonIcon, IonItem, IonLabel, IonProgressBar, IonText, IonToggle } from '@ionic/vue';
import { onMounted, ref } from 'vue';
import { storefrontOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { translate } from '@hotwax/dxp-components';

const selectedPage = ref({
  path: '',
  name: ''
}) as any
const router = useRouter();

onMounted(() => {
    selectedPage.value.path = router.currentRoute.value.path
    selectedPage.value.name = router.currentRoute.value.name
})
</script>