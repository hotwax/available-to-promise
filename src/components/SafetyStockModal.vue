<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal">
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Set safety stock") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-item>
      <ion-label>{{ translate("Safety stock") }}</ion-label>
      <ion-input placeholder="new safety stock" />
    </ion-item>
    
    <ion-list>
      <ion-list-header>{{ translate("Info") }}</ion-list-header>
    
      <ion-item>
        <ion-icon :icon="shirtOutline" slot="start" />
        <ion-label>56 SKUs</ion-label>
      </ion-item>
      <ion-item>
        <ion-icon :icon="businessOutline" slot="start" />
        <ion-label>20 locations</ion-label>
      </ion-item>

      <ion-item lines="none">
        <ion-label class="ion-text-wrap">{{ translate("You can also download the products, locations and safety stock you selected in a CSV to upload in other systems") }}</ion-label>
      </ion-item>
    </ion-list>

    <ion-button fill="outline" color="medium">{{ translate("Download data in csv") }}</ion-button>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button>
        <ion-icon :icon="cloudUploadOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-content>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonTitle,
  IonToolbar,
  modalController
} from '@ionic/vue';
import {
  closeOutline,
  shirtOutline,
  businessOutline,
  cloudUploadOutline
} from 'ionicons/icons';
import { translate } from '@hotwax/dxp-components';

export default defineComponent({
  name: 'SatetyStockModal',
  components: {
    IonButton,
    IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonTitle,
    IonToolbar
  },
  methods: {
    closeModal() {
      modalController.dismiss({ dismissed: true });
    },
  },
  setup() {
    return {
      closeOutline,
      cloudUploadOutline,
      shirtOutline,
      businessOutline,
      translate
    };
  },
});
</script>