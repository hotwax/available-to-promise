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

  <ion-content ref="contentRef" :scroll-events="true" @ionScroll="enableScrolling()">
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

    <ion-infinite-scroll @ionInfinite="loadMoreFilters($event)" threshold="100px" v-show="isScrollable" ref="infiniteScrollRef">
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
  IonSpinner,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { closeOutline, saveOutline } from 'ionicons/icons';
import { useStore } from "vuex";
import { translate } from '@hotwax/dxp-components';

const queryString = ref('');
const selectedValues = ref([]) as any;
const filteredOptions = ref([]) as any;
const pageSize = process.env.VUE_APP_VIEW_SIZE;
const currentPage = ref(0);

const isScrollable = ref(true);
const isLoading = ref(false);
const isScrollingEnabled = ref(false);
const contentRef = ref({}) as any;
const infiniteScrollRef = ref({}) as any;

const props = defineProps(["label", "facetToSelect", "searchfield", "type"]);
const store = useStore();

const appliedFilters = computed(() => store.getters["util/getAppliedFilters"]);
const facetOptions = computed(() => store.getters["util/getFacetOptions"]);

onMounted(async() => {
  isLoading.value = true;
  await store.dispatch("util/fetchProductFilters", { facetToSelect: props.facetToSelect, searchfield: props.searchfield })
  getFilters();
  selectedValues.value = JSON.parse(JSON.stringify(appliedFilters.value[props.type][props.searchfield]))
  isLoading.value = false;
})

function closeModal() {
  modalController.dismiss({ dismissed: true });
}

function search() {
  isScrollable.value = true;
  currentPage.value = 0;
  filteredOptions.value = []

  getFilters();
}

async function loadMoreFilters(event: any){
  getFilters().then(() => {
    event.target.complete();
  })
}

async function getFilters() {
  let options = facetOptions.value
  if(queryString.value) {
    options = facetOptions.value.filter((option: any) => option.label.toLowerCase().includes(queryString.value.toLowerCase()))
  }

  const nextPageItems = options.slice(currentPage.value * pageSize, (currentPage.value + 1) * pageSize);
  filteredOptions.value = filteredOptions.value.concat(nextPageItems);
  currentPage.value += 1;

  if(filteredOptions.value.length >= facetOptions.value.length) {
    isScrollable.value = false;
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

function enableScrolling() {
  const parentElement = contentRef.value.$el
  const scrollEl = parentElement.shadowRoot.querySelector("main[part='scroll']")
  let scrollHeight = scrollEl.scrollHeight, infiniteHeight = infiniteScrollRef.value.$el.offsetHeight, scrollTop = scrollEl.scrollTop, threshold = 100, height = scrollEl.offsetHeight
  const distanceFromInfinite = scrollHeight - infiniteHeight - scrollTop - threshold - height
  if(distanceFromInfinite < 0) {
    isScrollingEnabled.value = false;
  } else {
    isScrollingEnabled.value = true;
  }
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