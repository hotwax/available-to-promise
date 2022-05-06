<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal">
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ $t(label) }}</ion-title>
      <ion-buttons slot="end">
        <ion-button fill="clear" color="danger" @click="clearFilters()">{{ $t("Clear All") }}</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-searchbar :placeholder="$t(`Search ${searchfield}`)" v-model="queryString" @keyup.enter="search($event)"/>

    <ion-list>
      <ion-item v-for="option in facetOptions" :key="option.id">
        <ion-label>{{ option.label }}</ion-label>
        <!-- Added key on checkbox as when clicking on the checkbox the checked value is changed but not reflected on UI -->
        <ion-checkbox v-if="!isAlreadyApplied(option.id)" :checked="appliedFilters[type][searchfield].includes(option.id)" :key="appliedFilters[type][searchfield].includes(option.id)" @click="updateFilter(option.id)"/>
        <ion-note v-else slot="end" color="danger">{{ type === 'included' ? $t("excluded") : $t("included") }}</ion-note>
      </ion-item>
    </ion-list>
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
  name: "IncludeTagsModal",
  components: {
    IonButton,
    IonButtons,
    IonCheckbox,
    IonContent,
    IonHeader,
    IonIcon,
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
      facetOptions: [] as any
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
      modalController.dismiss({ dismissed: true });
    },
    async search(event: any) {
      // TODO: need to implement infinite scroll on the modal search
      const payload = {
        facetToSelect: this.facetToSelect,
        docType: 'PRODUCT',
        coreName: 'enterpriseSearch',
        searchfield: this.searchfield,
        jsonQuery: '{"query":"*:*","filter":["docType:PRODUCT"]}',
        noConditionFind: 'N',
        limit: 10,
        q: event.target.value,
        term: event.target.value
      }

      const resp = await ProductService.fetchFacets(payload);
      if (resp.status == 200 && resp.data.length > 0) {
        resp.data.map((obj: any) => {
          this.facetOptions.push({ id: obj.id, label: obj.label })
        })
      } else {
        this.facetOptions = []
      }
    },
    async updateFilter(value: string) {
      await this.store.dispatch('product/updateAppliedFilters', {
        type: this.type,
        id: this.searchfield,
        value
      })
    },
    async clearFilters() {
      await this.store.dispatch('product/clearFilters', {
        type: this.type,
        id: this.searchfield,
        value: []
      })
    },
    isAlreadyApplied(value: string) {
      const type = this.type === 'included' ? 'excluded' : 'included'
      return this.appliedFilters[type][this.searchfield].includes(value)
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