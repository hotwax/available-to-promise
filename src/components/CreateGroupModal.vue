<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal()">
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Create group") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-list>
      <ion-item>
        <ion-input :label="translate('Name')" labelPlacement="floating" />
      </ion-item>

      <ion-item lines="none">
        <ion-input :label="translate('ID')" labelPlacement="floating" :errorText="translate('Internal ID cannot be more than 20 characters.')" />
      </ion-item>

      <ion-item>
        <ion-textarea :label="translate('Description')" labelPlacement="floating" />
      </ion-item>
    </ion-list>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button>
        <ion-icon :icon="checkmarkDone" />
      </ion-fab-button>
    </ion-fab>
  </ion-content>
</template>

<script setup lang="ts">
import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonList, IonNote, IonTextarea, IonTitle, IonToolbar, modalController } from "@ionic/vue";
import { closeOutline, checkmarkDone } from "ionicons/icons";
import { translate } from '@hotwax/dxp-components'

function closeModal() {
  modalController.dismiss();
}
</script>