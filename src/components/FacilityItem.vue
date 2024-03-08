<template>
  <ion-card v-if="selectedPage.path === '/store-pickup'">
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

  <ion-card v-else>
    <ion-card-header>
      <ion-card-subtitle class="overline">{{ "Facility ID" }}</ion-card-subtitle>
      <ion-card-title>{{ "Facility Name" }}</ion-card-title>
    </ion-card-header>

    <ion-item lines="none">
      <ion-icon :icon="storefrontOutline" slot="start" />
      <ion-toggle>{{ translate("Store pickup") }}</ion-toggle>
    </ion-item>
  </ion-card>
</template>

<script lang="ts">
import {
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonIcon,
  IonItem,
  IonLabel,
  IonProgressBar,
  IonText,
  IonToggle
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { storefrontOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { translate } from '@hotwax/dxp-components';

export default defineComponent({
  name: 'FacilityItem',
  components: {
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonChip,
    IonIcon,
    IonItem,
    IonLabel,
    IonProgressBar,
    IonText,
    IonToggle
  },
  data() {
    return {
      selectedPage: {
        path: '',
        name: ''
      } as any
    }
  },
  mounted() {
    this.selectedPage.path = this.router.currentRoute.value.path
    this.selectedPage.name = this.router.currentRoute.value.name
  },
  setup() {
    const router = useRouter();

    return {
      router,
      storefrontOutline,
      translate
    };
  },
});
</script>