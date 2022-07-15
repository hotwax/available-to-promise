<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal">
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ $t(`${ type === 'included' ? `Include ${label}` : `Exclude ${label}` }`) }}</ion-title>
      <ion-buttons slot="end">
        <ion-button fill="clear" color="danger" @click="clearFilters()">{{ $t("Clear All") }}</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-searchbar :placeholder="$t(`Search ${label}`)" v-model="queryString" @keyup.enter="isScrollable = true, queryString = $event.target.value, search($event)"/>

    <ion-list>
      <ion-item v-for="option in facetOptions" :key="option.id">
        <ion-label>{{ option.label }}</ion-label>
        <!-- Added key on checkbox as when clicking on the checkbox the checked value is changed but not reflected on UI -->
        <ion-checkbox v-if="!isAlreadyApplied(option.id)" :checked="appliedFilters[type][searchfield].list.includes(option.id)" :key="appliedFilters[type][searchfield].list.includes(option.id)" @click="updateFilter(option.id)"/>
        <ion-note v-else slot="end" color="danger">{{ type === 'included' ? $t("excluded") : $t("included") }}</ion-note>
      </ion-item>
    </ion-list>
    <ion-infinite-scroll @ionInfinite="loadMoreTags($event)" threshold="100px" :disabled="!isScrollable">
      <ion-infinite-scroll-content loading-spinner="crescent" :loading-text="$t('Loading')"/>
    </ion-infinite-scroll>
  </ion-content>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
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
import { closeOutline } from 'ionicons/icons'
import { ProductService } from "@/services/ProductService";
import { mapGetters, useStore } from "vuex";

export default defineComponent({
  name: "ProductFilterModal",
  components: {
    IonButton,
    IonButtons,
    IonCheckbox,
    IonContent,
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
    IonToolbar
  },
  data() {
    return {
      queryString: '',
      facetOptions: [] as any,
      isFilterChanged: false,
      offset: 0,
      isScrollable: true,
    }
  },
  computed: {
    ...mapGetters({
      appliedFilters: 'product/getAppliedFilters'
    })
  },
  props: ["label", "facetToSelect", "searchfield", 'type'],
  methods: {
    closeModal() {
      modalController.dismiss({ dismissed: true, isFilterChanged: this.isFilterChanged });
    },
    async search(event: any) {
      this.queryString = event.target.value;
      this.facetOptions = [];
      this.getTags();
    },
    async getTags(vSize?: any, vIndex?: any) {
      const viewSize = vSize ? vSize : process.env.VUE_APP_VIEW_SIZE;
      const viewIndex = vIndex ? vIndex : 0;

      const payload = {
        facetToSelect: this.facetToSelect,
        docType: 'PRODUCT',
        coreName: 'enterpriseSearch',
        searchfield: this.searchfield,
        jsonQuery: '{"query":"*:*","filter":["docType:PRODUCT"]}',
        noConditionFind: 'N',
        limit: viewSize,
        q: this.queryString,
        term: this.queryString,
        offset: viewIndex,
      }

      const resp = await ProductService.fetchFacets(payload);
      if (resp.status == 200 && resp.data.length > 0) {
        if(!this.facetOptions.length) {
          this.facetOptions = resp.data.map((obj: any) => ({ id: obj.id, label: obj.label }))
        } else {
          this.facetOptions.push(...resp.data.map((obj: any) => ({ id: obj.id, label: obj.label })))
        }
      } else {
        this.isScrollable = false;
      }
    },
    async loadMoreTags(event: any){
      this.getTags(
        undefined,
        Math.ceil((this.facetOptions.length / process.env.VUE_APP_VIEW_SIZE) * process.env.VUE_APP_VIEW_SIZE).toString() 
      ).then(() => {
        event.target.complete();
      })
    },
    async updateFilter(value: string) {
      await this.store.dispatch('product/updateAppliedFilters', {
        type: this.type,
        id: this.searchfield,
        value
      })
      this.isFilterChanged = true;
    },
    async clearFilters() {
      // checking that if the current field does not have any attribute selected then not making the solr query
      if (this.appliedFilters[this.type][this.searchfield].length <= 0) {
        return;
      }
      await this.store.dispatch('product/clearFilters', {
        type: this.type,
        id: this.searchfield,
        value: {
          list: [],
          operator: 'OR'
        }
      })
      this.isFilterChanged = true;
    },
    isAlreadyApplied(value: string) {
      const type = this.type === 'included' ? 'excluded' : 'included'
      return this.appliedFilters[type][this.searchfield].list.includes(value)
    }
  },
  setup() {
    const store = useStore();

    return {
      closeOutline,
      store
    }
  }
})
</script>