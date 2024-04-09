<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal()">
          <ion-icon slot="icon-only" :icon="arrowBackOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("features", { type }) }}</ion-title>
      <ion-buttons slot="end">
        <ion-button fill="clear" color="danger">{{ translate("Clear All") }}</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-searchbar :placeholder="translate('Search tags')" v-model="queryString" @keyup.enter="filterProductFeatures()" />

    <ion-list>
      <div v-for="type in Object.keys(filteredProductFeaturesByType)" :key="type">
        <ion-item-divider color="light" v-if="filteredProductFeaturesByType[type].length">
          <ion-label>{{ type }}</ion-label>
        </ion-item-divider>

        <ion-item v-for="feature in filteredProductFeaturesByType[type]" :key="feature.productFeatureId">
          <ion-checkbox>{{ feature.description }}</ion-checkbox>
        </ion-item>
      </div>
    </ion-list>
  </ion-content>

  <ion-fab class="ion-padding" vertical="bottom" horizontal="end" slot="fixed">
    <ion-fab-button>
      <ion-icon :icon="checkmarkOutline" />
    </ion-fab-button>
  </ion-fab>
</template>

<script setup lang="ts">
import { computed, defineProps, onMounted, ref } from 'vue';
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { arrowBackOutline, checkmarkOutline } from 'ionicons/icons'
import { translate } from '@/i18n';
import { useStore } from 'vuex';

defineProps(["type"])
const store = useStore();
const queryString = ref('')
const filteredProductFeaturesByType = ref({}) as any;

const productFeaturesByType = computed(() => store.getters["util/getProductFeaturesByType"])

onMounted(async () => {
  await store.dispatch("util/fetchProductFeatures")
  filterProductFeatures()
})

function closeModal() {
  modalController.dismiss()
}

function filterProductFeatures() {
  const filteredFeaturesByType = JSON.parse(JSON.stringify(productFeaturesByType.value))

  Object.keys(filteredFeaturesByType).map((type: any) => {
    filteredFeaturesByType[type] = filteredFeaturesByType[type].filter((feature: any) => feature.description.toLowerCase().includes(queryString.value.toLowerCase()))
  })
  filteredProductFeaturesByType.value = filteredFeaturesByType
}
</script>