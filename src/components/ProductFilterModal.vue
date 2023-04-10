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
        <ion-button fill="clear" color="danger" @click="selectedTags = []">{{ $t("Clear All") }}</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-searchbar :placeholder="$t(`Search ${label}`)" v-model="queryString" @keyup.enter="queryString = $event.target.value; search($event)"/>

    <ion-list>
      <ion-item v-for="option in facetOptions" :key="option.id"  @click="updateSelectedTags(option.id)">
        <ion-label>{{ option.label }}</ion-label>
        <ion-checkbox v-if="!isAlreadyApplied(option.id)" :checked="selectedTags.includes(option.id)" />
        <ion-note v-else slot="end" color="danger">{{ type === 'included' ? $t("excluded") : $t("included") }}</ion-note>
      </ion-item>
    </ion-list>
    <!-- Added padding for better visiblity of the checkboxes beside the FAB -->
    <ion-fab class="ion-padding" vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="updateFilters()">
        <ion-icon :icon="checkmarkOutline" />
      </ion-fab-button>
    </ion-fab>
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
import { arrowBackOutline, checkmarkOutline } from 'ionicons/icons'
import { ProductService } from "@/services/ProductService";
import { mapGetters, useStore } from "vuex";

export default defineComponent({
  name: "ProductFilterModal",
  components: {
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
    IonToolbar
  },
  data() {
    return {
      queryString: '',
      facetOptions: [] as any,
      isFilterChanged: false,
      isScrollable: true,
      selectedTags: [] as Array<string>
    }
  },
  computed: {
    ...mapGetters({
      appliedFilters: 'product/getAppliedFilters'
    })
  },
  props: ["label", "facetToSelect", "searchfield", 'type'],
  mounted() {
    this.selectedTags = JSON.parse(JSON.stringify(this.appliedFilters[this.type][this.searchfield])).list;
  },
  methods: {
    closeModal() {
      modalController.dismiss({ dismissed: true, isFilterChanged: this.isFilterChanged });
    },
    async search(event: any) {
      this.queryString = event.target.value;
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
        offset: viewIndex * viewSize,
      }

      const resp = await ProductService.fetchFacets(payload);
      if (resp.status == 200 && resp.data.length > 0) {
        this.facetOptions = viewIndex === 0 ? resp.data : [...this.facetOptions , ...resp.data];
        this.isScrollable = (this.facetOptions.length % process.env.VUE_APP_VIEW_SIZE) === 0;
      } else {
        this.facetOptions = [];
        this.isScrollable = false;
      }
    },
    async loadMoreTags(event: any){
      this.getTags(
        undefined,
        Math.ceil(this.facetOptions.length / process.env.VUE_APP_VIEW_SIZE).toString() 
      ).then(() => {
        event.target.complete();
      })
    },
    updateSelectedTags(value: string) {
      this.selectedTags.includes(value) ? this.selectedTags.splice(this.selectedTags.indexOf(value), 1) : this.selectedTags.push(value);
    },
    async updateFilters() {
      this.isFilterChanged = true;
      this.selectedTags.length ? await this.updateAppliedFilters() : await this.clearFilters();
      this.closeModal();
    },
    async updateAppliedFilters() {
      // if filters are not updated
      if (JSON.stringify(this.appliedFilters[this.type][this.searchfield].list) == JSON.stringify(this.selectedTags)) {
        this.isFilterChanged = false;
        return;
      }

      await this.store.dispatch('product/updateAppliedFilters', {
        type: this.type,
        id: this.searchfield,
        value: this.selectedTags
      })
    },
    async clearFilters() {
      // if no filters are already not applied
      if (!this.appliedFilters[this.type][this.searchfield].list.length) {
        this.isFilterChanged = false;
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
    },
    isAlreadyApplied(value: string) {
      const type = this.type === 'included' ? 'excluded' : 'included'
      return this.appliedFilters[type][this.searchfield].list.includes(value)
    }
  },
  setup() {
    const store = useStore();

    return {
      arrowBackOutline,
      checkmarkOutline,
      store
    }
  }
})
</script>