<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal">
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ type === "included" ? translate("Include", { label }) : translate("Exclude", { label }) }}</ion-title>
      <ion-buttons slot="end">
        <!-- Clear all button should be disabled if no facetOptions are available to select or if no filter is selected. -->
        <ion-button fill="clear" color="danger" :disabled="!facetOptions.length || !selectedValues.length" @click="selectedValues = []">{{ translate("Clear All") }}</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-searchbar :placeholder="translate('Search', { label })" v-model="queryString" @keyup.enter="search()"/>
    <ion-row>
      <ion-chip v-for="filter in selectedValues" outline :key="filter.id">
        <ion-label>{{ filter }}</ion-label>
      </ion-chip>
    </ion-row>

    <div class="empty-state" v-if="isLoading">
      <ion-item lines="none">
        <ion-spinner name="crescent" slot="start" />
        {{ translate("Fetching filters") }}
      </ion-item>
    </div>
    <ion-list v-else-if="filteredOptions.length">
      <ion-item v-for="option in filteredOptions" :key="option.id"  @click="!isAlreadyApplied(option.id) ? updateSelectedValues(option.id) : null">
        <ion-label v-if="isAlreadyApplied(option.id)">{{ option.label }}</ion-label>
        <ion-checkbox v-if="!isAlreadyApplied(option.id)" :checked="selectedValues.includes(option.id)">
          {{ option.label }}
        </ion-checkbox>
        <ion-note v-else slot="end" color="danger">{{ type === 'included' ? translate("excluded") : translate("included") }}</ion-note>
      </ion-item>
    </ion-list>
    <div class="empty-state" v-else-if="!queryString">
      <p>{{ translate("Search for to find results", { label }) }}</p>
    </div>
    <div class="empty-state" v-else>
      <p>{{ translate("No result found for", { label: queryString }) }}</p>
    </div>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="saveFilters()">
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-content>
</template>

<script setup lang="ts">
import { computed, defineProps, onMounted, ref } from "vue";
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonChip,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonRow,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { closeOutline, saveOutline } from 'ionicons/icons';
import { useStore } from "vuex";
import { translate } from '@hotwax/dxp-components';

const facetOptions = ref([]) as any;
const queryString = ref('');
const selectedValues = ref([]) as any;
const filteredOptions = ref([]) as any;

const isLoading = ref(false);

const props = defineProps(["label", "facetToSelect", "searchfield", "type"]);
const store = useStore();

const appliedFilters = computed(() => store.getters["util/getAppliedFilters"]);
const getFacetOptions = computed(() => store.getters["util/getFacetOptions"]);

onMounted(async() => {
  isLoading.value = true;
  await store.dispatch("util/fetchProductFilters", { facetToSelect: props.facetToSelect, searchfield: props.searchfield })
  facetOptions.value = getFacetOptions.value(props.searchfield);
  filteredOptions.value = JSON.parse(JSON.stringify(facetOptions.value))
  selectedValues.value = JSON.parse(JSON.stringify(appliedFilters.value[props.type][props.searchfield]))
  isLoading.value = false;
})

function closeModal() {
  modalController.dismiss({ dismissed: true });
}

async function search() {
  filteredOptions.value = []

  if(queryString.value.trim()) {
    isLoading.value = true;
    await store.dispatch("util/fetchProductFilters", { facetToSelect: props.facetToSelect, searchfield: props.searchfield, queryString: queryString.value.trim() })
    filteredOptions.value = getFacetOptions.value(props.searchfield).filter((option: any) => option.label.toLowerCase().includes(queryString.value.trim().toLowerCase()))
    isLoading.value = false;
  } else {
    filteredOptions.value = JSON.parse(JSON.stringify(getFacetOptions.value(props.searchfield)))
  }
}

function updateSelectedValues(value: string) {
  selectedValues.value.includes(value) ? selectedValues.value.splice(selectedValues.value.indexOf(value), 1) : selectedValues.value.push(value);
}

function isAlreadyApplied(value: string) {
  const type = props.type === 'included' ? 'excluded' : 'included'
  return appliedFilters.value[type][props.searchfield].includes(value)
}

async function saveFilters() {
  const selectedFilters = JSON.parse(JSON.stringify(appliedFilters.value))
  selectedFilters[props.type][props.searchfield] = selectedValues.value

  await store.dispatch('util/updateAppliedFilters', selectedFilters)
  modalController.dismiss()
}
</script>

<style scoped>
  ion-content {
    --padding-bottom: 80px;
  }

  ion-row {
    flex-wrap: nowrap;
    overflow: scroll;
  }

  ion-chip {
    flex-shrink: 0;
  }
</style>