<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal">
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ $t("Save threshold rule") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-list>
      <ion-list-header>{{ $t("Info") }}</ion-list-header>
      <ion-item>
        <ion-icon :icon="shirtOutline" slot="start" />
        <ion-label>56 {{ $t('SKUs') }}</ion-label>
      </ion-item>
      <ion-item>
        <ion-icon :icon="optionsOutline" slot="start" />
        <ion-label>{{ threshold }} {{ $t('threshold') }}</ion-label>
      </ion-item>

      <ion-item>
        <ion-label>{{ $t("Rule name") }}</ion-label>
        <ion-input placeholder="rule name" />
      </ion-item>
    </ion-list>

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
  optionsOutline,
  cloudUploadOutline
} from 'ionicons/icons';

export default defineComponent({
  name: 'SaveThresholdModal',
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
  props: ["threshold"],
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
      optionsOutline,
    };
  },
});
</script>