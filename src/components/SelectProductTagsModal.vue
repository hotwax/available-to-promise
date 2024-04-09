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
    <ion-searchbar :placeholder="translate('Search tags')" v-model="queryString" @keyup.enter="filterProductTags()" />

    <ion-list>
      <ion-item v-for="tag in filteredTags" :key="tag.keyword">
        <ion-checkbox>{{ tag.keyword }}</ion-checkbox>
      </ion-item>
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
const filteredTags = ref([]) as any

const productTags = computed(() => store.getters["util/getProductTags"])

onMounted(async () => {
  await store.dispatch("util/fetchProductTags")
  filteredTags.value = productTags.value
})

function closeModal() {
  modalController.dismiss()
}

function filterProductTags() {
  filteredTags.value = productTags.value.filter((tag: any) => tag.keyword.toLowerCase().includes(queryString.value.toLowerCase()))
}

</script>