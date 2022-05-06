<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal">
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ $t(label) }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-searchbar :placeholder="$t(`Search ${searchfield}`)" v-model="queryString" @keyup.enter="search($event)"/>

    <ion-list>
      <ion-item v-for="value in list" :key="value">
        <ion-label>{{ value }}</ion-label>
        <ion-checkbox v-if="!isSelected(value)" :checked="appliedFilters[type][searchfield].includes(value)" @click="applyFilter(value)"/>
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
      list: []
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

      const resp = await ProductService.fetchAutoCompleteSolrFacet(payload);
      if (resp.status == 200 && resp.data.length > 0) {
        this.list = resp.data.map((obj: any) => obj.id)
      } else {
        this.list = []
      }
    },
    async applyFilter(value: string) {
      await this.store.dispatch('product/updateAppliedFilters', {
        type: this.type,
        id: this.searchfield,
        value
      })
    },
    isSelected(value: string) {
      if (this.type === 'included') {
        return this.appliedFilters['excluded'][this.searchfield].includes(value)
      } else {
        return this.appliedFilters['included'][this.searchfield].includes(value)
      }
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