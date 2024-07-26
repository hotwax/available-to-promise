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

    <ion-list v-if="facetOptions.length">
      <ion-item v-for="option in facetOptions" :key="option.id"  @click="!isAlreadyApplied(option.id) ? updateSelectedValues(option.id) : null">
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

    <ion-infinite-scroll @ionInfinite="loadMoreFilters($event)" threshold="100px" :disabled="!isScrollable">
      <ion-infinite-scroll-content loading-spinner="crescent" :loading-text="translate('Loading')"/>
    </ion-infinite-scroll>
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
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonRow,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { closeOutline, saveOutline } from 'ionicons/icons';
import { useStore } from "vuex";
import { UtilService } from "@/services/UtilService";
import { translate } from '@hotwax/dxp-components';
import { hasError } from "@/utils";

const queryString = ref('');
const facetOptions = ref([]) as any;
const isScrollable = ref(true);
const selectedValues = ref([]) as any;

const props = defineProps(["label", "facetToSelect", "searchfield", "type"]);
const store = useStore();

const appliedFilters = computed(() => store.getters["util/getAppliedFilters"]);

onMounted(() => {
  selectedValues.value = JSON.parse(JSON.stringify(appliedFilters.value[props.type][props.searchfield]))
})

function closeModal() {
  modalController.dismiss({ dismissed: true });
}

function search() {
  getFilters();
}

async function getFilters(vSize?: any, vIndex?: any) {
  const viewSize = vSize ? vSize : process.env.VUE_APP_VIEW_SIZE;
  const viewIndex = vIndex ? vIndex : 0;
  
  const payload = {
    facetToSelect: props.facetToSelect,
    docType: 'PRODUCT',
    coreName: 'enterpriseSearch',
    searchfield: props.searchfield,
    jsonQuery: '{"query":"*:*","filter":["docType:PRODUCT"]}',
    noConditionFind: 'N',
    limit: viewSize,
    q: queryString.value,
    term: queryString.value,
    offset: viewSize * viewIndex,
  }

  const resp = await UtilService.fetchFacets(payload);
  if(!hasError(resp)) {
    const results = resp.data.facetResponse.response
    facetOptions.value = viewIndex === 0 ? results : [...facetOptions.value , ...results];
    isScrollable.value = (facetOptions.value.length % process.env.VUE_APP_VIEW_SIZE) === 0;

  } else {
    facetOptions.value = [];
    isScrollable.value = false;
  }
}

async function loadMoreFilters(event: any){
  getFilters(
    undefined,
    Math.ceil(facetOptions.value.length / process.env.VUE_APP_VIEW_SIZE).toString() 
  ).then(() => {
    event.target.complete();
  })
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