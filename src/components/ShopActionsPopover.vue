<template>
  <ion-content>
    <ion-list>
      <ion-list-header>{{ translate("More options") }}</ion-list-header>
      <ion-item button>
        <ion-icon slot="start" :icon="timeOutline" />
        <ion-label>{{ translate("History") }}</ion-label>
      </ion-item> 
      <ion-item button>
        <ion-icon slot="start" :icon="copyOutline" />
        <ion-label>{{ translate("Copy details") }}</ion-label>
      </ion-item> 
      <ion-item button>
        <ion-icon slot="start" :icon="flashOutline" />
        <ion-label>{{ translate("Run now") }}</ion-label>
      </ion-item> 
      <ion-item button lines="none">
        <ion-icon slot="start" :icon="stopCircleOutline" color="danger" />
        <ion-label color="danger">{{ translate("Disable") }}</ion-label>
      </ion-item> 
    </ion-list>
  </ion-content>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonItem, IonLabel, IonList, IonListHeader } from "@ionic/vue";
import { translate } from "@hotwax/dxp-components";
import { copyOutline, flashOutline, stopCircleOutline, timeOutline } from 'ionicons/icons'
</script> 