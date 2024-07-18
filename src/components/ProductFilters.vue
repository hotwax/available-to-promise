<template>
  <div class="section-header">
    <h1>{{ translate("Products by tags") }}</h1>
  </div>

  <section>
    <ion-card>
      <ion-item lines="none">
        <ion-label>{{ translate("Included") }}</ion-label>
        <ion-button fill="clear" @click="openProductFilterModal('tags', 'tagsFacet', 'tags', 'included')">
          {{ translate("Add") }}
          <ion-icon :icon="addCircleOutline" slot="end" />
        </ion-button>
      </ion-item>
      <ion-card-content>
        <ion-chip outline v-for="(tag, index) in appliedFilters['included']['tags']" :key="index">
          {{ tag }}
          <ion-icon :icon="closeCircle" @click="removeFilters('included', 'tags', tag)" />
        </ion-chip>
      </ion-card-content>
    </ion-card>

    <ion-card>
      <ion-item lines="none"> 
        <ion-label>{{ translate("Excluded") }}</ion-label>
        <ion-button fill="clear" @click="openProductFilterModal('tags', 'tagsFacet', 'tags', 'excluded')">
          {{ translate("Add") }}
          <ion-icon :icon="addCircleOutline" slot="end" />
        </ion-button>
      </ion-item>
      <ion-card-content>
        <ion-chip outline v-for="(tag, index) in appliedFilters['excluded']['tags']" :key="index">
          {{ tag }}
          <ion-icon :icon="closeCircle" @click="removeFilters('excluded', 'tags', tag)" />
        </ion-chip>
      </ion-card-content>
    </ion-card>
  </section>

  <div class="section-header">
    <h1>{{ translate("Products by feature") }}</h1>
  </div>

  <section>
    <ion-card>
      <ion-item lines="none">
        <ion-label>{{ translate("Included") }}</ion-label>
        <ion-button fill="clear" @click="openProductFilterModal('product features', 'productFeaturesFacet', 'productFeatures', 'included')">
          {{ translate("Add") }}
          <ion-icon :icon="addCircleOutline" slot="end" />
        </ion-button>
      </ion-item>
      <ion-card-content>
        <ion-chip outline v-for="(feature, index) in appliedFilters['included']['productFeatures']" :key="index">
          {{ feature }}
          <ion-icon :icon="closeCircle" @click="removeFilters('included', 'productFeatures', feature)" />
        </ion-chip>
      </ion-card-content>
    </ion-card>

    <ion-card>
      <ion-item lines="none"> 
        <ion-label>{{ translate("Excluded") }}</ion-label>
        <ion-button fill="clear" @click="openProductFilterModal('product features', 'productFeaturesFacet', 'productFeatures', 'excluded')">
          {{ translate("Add") }}
          <ion-icon :icon="addCircleOutline" slot="end" />
        </ion-button>
      </ion-item>
      <ion-card-content>
        <ion-chip outline v-for="(feature, index) in appliedFilters['excluded']['productFeatures']" :key="index">
          {{ feature }}
          <ion-icon :icon="closeCircle" @click="removeFilters('excluded', 'productFeatures', feature)" />
        </ion-chip>
      </ion-card-content>
    </ion-card>
  </section>
</template>

<script setup lang="ts">
import { IonButton, IonCard, IonCardContent, IonChip, IonIcon, IonItem, IonLabel, modalController } from '@ionic/vue';
import { addCircleOutline, closeCircle } from 'ionicons/icons'
import { translate } from '@hotwax/dxp-components';
import AddProductFiltersModal from '@/components/AddProductFiltersModal.vue';
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const appliedFilters = computed(() => store.getters["util/getAppliedFilters"]);

async function openProductFilterModal(label: string, facetToSelect: string, searchfield: string, type: string) {
  const modal = await modalController.create({
    component: AddProductFiltersModal,
    componentProps: {
      label,
      facetToSelect,
      searchfield,
      type
    },
  })

  modal.present()
}

async function removeFilters(type: string, id: string, value: string) {
  const selectedFilters = JSON.parse(JSON.stringify(appliedFilters.value))
  selectedFilters[type][id] = selectedFilters[type][id].filter((filter: any) => filter !== value)

  await store.dispatch('util/updateAppliedFilters', selectedFilters)
}
</script>