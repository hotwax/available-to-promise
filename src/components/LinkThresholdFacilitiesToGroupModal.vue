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
    <ion-radio-group v-if="configFacilities.length">
      <ion-item v-for="facility in configFacilities" :key="facility.facilityId">
        <ion-radio>
          <ion-label>
            {{ facility.facilityName }}
            <p>{{ facility.facilityId }}</p>
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
import { useStore } from "vuex";
import { computed } from "vue";

const store = useStore();
const configFacilities = computed(() => store.getters["util/getConfigFacilities"])
</script>