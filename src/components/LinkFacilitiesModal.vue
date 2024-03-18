<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button>
          <ion-icon slot="icon-only" :icon="close" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Link facilities") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-searchbar />

    <ion-list>
      <ion-item lines="none">
        <ion-checkbox>
          <ion-label>
            {{ "facilityName" }}
            <p>{{ "facilityId" }}</p>
          </ion-label>
        </ion-checkbox>
      </ion-item>
      <ion-item lines="none">
        <ion-checkbox>
          <ion-label>
            {{ "facilityName" }}
            <p>{{ "facilityId" }}</p>
          </ion-label>
        </ion-checkbox>
      </ion-item>
      <ion-item lines="none">
        <ion-checkbox>
          <ion-label>
            {{ "facilityName" }}
            <p>{{ "facilityId" }}</p>
          </ion-label>
        </ion-checkbox>
      </ion-item> 
    </ion-list>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button>
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-content>
</template>

<script setup lang="ts">
import { IonButton, IonButtons, IonCheckbox, IonChip, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonSearchbar, IonTitle, IonToolbar } from "@ionic/vue";
import { close, saveOutline } from "ionicons/icons";
import { translate } from '@hotwax/dxp-components'


</script>