<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal">
          <ion-icon slot="icon-only" :icon="arrowBackOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ $t(`${ type === 'included' ? `Include ${label}` : `Exclude ${label}` }`) }}</ion-title>
      <ion-buttons slot="end">
        <ion-button fill="clear" color="danger" @click="selectedValues = []">{{ $t("Clear All") }}</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-searchbar :placeholder="translate('Search', { label })" v-model="queryString" @keyup.enter="search()"/>

    <ion-list>
      <ion-item v-for="option in facetOptions" :key="option.id"  @click="updateSelectedValues(option.id)">
        <ion-checkbox :checked="selectedValues.includes(option.id)">
          {{ option.label }}
        </ion-checkbox>
        <!-- <ion-note v-else slot="end" color="danger">{{ type === 'included' ? $t("excluded") : $t("included") }}</ion-note> -->
      </ion-item>
    </ion-list>

    <!-- Added padding for better visiblity of the checkboxes beside the FAB -->
    <ion-fab class="ion-padding" vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button>
        <ion-icon :icon="checkmarkOutline" />
      </ion-fab-button>
    </ion-fab>

    <ion-infinite-scroll @ionInfinite="loadMoreTags($event)" threshold="100px" :disabled="!isScrollable">
      <ion-infinite-scroll-content loading-spinner="crescent" :loading-text="$t('Loading')"/>
    </ion-infinite-scroll>
  </ion-content>
</template>

<script setup lang="ts">
import { defineComponent } from "vue";
import {
  IonButton,
  IonButtons,
  IonCheckbox,
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
  IonSearchbar,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { arrowBackOutline, checkmarkOutline } from 'ionicons/icons';
import { mapGetters, useStore } from "vuex";
import { UtilService } from "@/services/UtilService";
import { defineProps, ref } from "vue";
import { translate } from "@/i18n";
import { hasError } from "@/utils";

const queryString = ref('');
const facetOptions = ref([]) as any;
const isFilterChanged = ref(false);
const isScrollable = ref(true);
const selectedValues = ref([]) as any;

const props = defineProps(["label", "facetToSelect", "searchfield", "type"])

function closeModal() {
  modalController.dismiss({ dismissed: true });
}

function search() {
  getTags();
}

async function getTags(vSize?: any, vIndex?: any) {
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
    offset: 0,
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

async function loadMoreTags(event: any){
  getTags(
    undefined,
    Math.ceil(facetOptions.value.length / process.env.VUE_APP_VIEW_SIZE).toString() 
  ).then(() => {
    event.target.complete();
  })
}

function updateSelectedValues(value: string) {
  selectedValues.value.includes(value) ? selectedValues.value.splice(selectedValues.value.indexOf(value), 1) : selectedValues.value.push(value);
}

// async updateFilters() {
//   this.isFilterChanged = true;
//   this.selectedValues.length ? await this.updateAppliedFilters() : await this.clearFilters();
//   this.closeModal();
// },
// async updateAppliedFilters() {
//   // if filters are not updated
//   if (JSON.stringify(this.appliedFilters[this.type][this.searchfield].list) == JSON.stringify(this.selectedValues)) {
//     this.isFilterChanged = false;
//     return;
//   }

//   const appliedFilters = JSON.parse(JSON.stringify(this.appliedFilters[this.type][this.searchfield]))
//   appliedFilters.list = this.selectedValues
  
//   await this.store.dispatch('product/updateAppliedFilters', {
//     type: this.type,
//     id: this.searchfield,
//     value: appliedFilters
//   })
// },
// async clearFilters() {
//   // if no filters are already not applied
//   if (!this.appliedFilters[this.type][this.searchfield].list.length) {
//     this.isFilterChanged = false;
//     return;
//   }

//   await this.store.dispatch('product/clearFilters', {
//     type: this.type,
//     id: this.searchfield,
//     value: {
//       list: [],
//       operator: 'OR'
//     }
//   })
// },
// isAlreadyApplied(value: string) {
//   const type = this.type === 'included' ? 'excluded' : 'included'
//   return this.appliedFilters[type][this.searchfield].list.includes(value)
// }
</script>