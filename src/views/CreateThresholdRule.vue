<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/threshold" />
        <ion-title>{{ translate("New threshold rule") }}</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <section>
        <div class="rule-config">
          <ion-card>
            <ion-card-header>
              <ion-card-title>{{ translate("Rule Configuration") }}</ion-card-title>
            </ion-card-header>

            <div class="rule-inputs ion-padding">
              <ion-item>
                <ion-input :label="translate('Name')" v-model="formData.name" />
              </ion-item>
              <ion-item>
                <ion-input :label="translate('Threshold')" v-model="formData.threshold" />
              </ion-item>
            </div>
          </ion-card>
        </div>
      </section>
      <div class="section-header">
        <h1>{{ translate("Channels") }}</h1>
      </div>

      <section> 
        <ion-card v-for="facility in configFacilities" :key="facility.facilityId" @click="toggleFacilitySelection(facility.facilityId)" button>
          <ion-card-header>
            <div>
              <ion-card-title>{{ facility.facilityName }}</ion-card-title>
              <ion-card-subtitle>{{ facility.facilityId }}</ion-card-subtitle>
            </div>
            <ion-checkbox :checked="isFacilitySelected(facility.facilityId)" />
          </ion-card-header>
        </ion-card>
      </section>

      <ProductFilters />
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button>
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCheckbox,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/vue';
import { saveOutline } from 'ionicons/icons'
import { translate } from "@/i18n";
import ProductFilters from '@/components/ProductFilters.vue';
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const formData = ref({
  name: '',
  threshold: '',
  selectedConfigFacilites: []
}) as any;

const configFacilities = computed(() => store.getters["util/getConfigFacilities"])

onMounted(async () => {
  await store.dispatch("util/fetchConfigFacilities");
})

function toggleFacilitySelection(facilityId: any) {
  if(formData.value.selectedConfigFacilites.includes(facilityId)) {
    formData.value.selectedConfigFacilites = formData.value.selectedConfigFacilites.filter((currentFacilityId: string) => currentFacilityId !== facilityId)
  } else {
    formData.value.selectedConfigFacilites.push(facilityId)
  }
}

function isFacilitySelected(facilityId: any) {
  return formData.value.selectedConfigFacilites.includes(facilityId)
}
</script>

<style scoped>
ion-card-header {
  display: flex;
  flex-direction: row ;
  justify-content: space-between;
  align-items: center;
}

ion-card-header > ion-checkbox {
  flex-shrink: 0;
}
</style>