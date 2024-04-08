<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button>
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Link threshold") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-searchbar />

    <ion-radio-group>
      <ion-item>
        <ion-radio>
          <ion-label>
            {{ "Facility name" }}
            <p>{{ "Facility ID" }}</p>
          </ion-label>
        </ion-radio>
      </ion-item>
      <ion-item>
        <ion-radio>
          <ion-label>
            {{ "Facility name" }}
            <p>{{ "Facility ID" }}</p>
          </ion-label>
        </ion-radio>
      </ion-item>
      <ion-item>
        <ion-radio>
          <ion-label>
            {{ "Facility name" }}
            <p>{{ "Facility ID" }}</p>
          </ion-label>
        </ion-radio>
      </ion-item>
    </ion-radio-group>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button>
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-content>
</template>

<script setup lang="ts">
import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonRadio, IonRadioGroup, IonSearchbar, IonTitle, IonToolbar } from "@ionic/vue";
import { closeOutline, saveOutline } from "ionicons/icons";
import { translate } from '@/i18n'
</script>