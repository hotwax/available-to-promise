<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button>
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Link facilities") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-searchbar v-model="queryString" @keyup.enter="getFilteredFacilities()" />

    <ion-list>
      <ion-item lines="none" v-for="facility in filteredFacilities" :key="facility.facilityId">
        <ion-checkbox>
          <ion-label>
            {{ facility.facilityName }}
            <p>{{ facility.facilityId }}</p>
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
import { IonButton, IonButtons, IonCheckbox, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonSearchbar, IonTitle, IonToolbar } from "@ionic/vue";
import { closeOutline, saveOutline } from "ionicons/icons";
import { translate } from '@/i18n'
import { computed, onMounted, ref } from "vue";
import { useStore } from "vuex";

const store = useStore();
const filteredFacilities = ref([]);
const queryString = ref('');

const facilities = computed(() => store.getters["util/getFacilities"])

onMounted(() => {
  filteredFacilities.value = JSON.parse(JSON.stringify(facilities.value));
})

function getFilteredFacilities() {
  filteredFacilities.value = JSON.parse(JSON.stringify(facilities.value.filter((facility: any) => facility.facilityName.toLowerCase().includes(queryString.value.toLowerCase()))))
}
</script>