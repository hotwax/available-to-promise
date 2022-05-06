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
      <ion-item v-for="id in list" :key="id">
        <ion-label>{{ id }}</ion-label>
        <ion-checkbox />
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
  IonSearchbar,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { closeOutline } from 'ionicons/icons'
import { ProductService } from "@/services/ProductService";

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
  props: ["label", "facetToSelect", "searchfield"],
  methods: {
    closeModal() {
      modalController.dismiss({ dismissed: true });
    },
    async search(event: any) {
      const payload = {
        facetToSelect: this.facetToSelect,
        docType: 'PRODUCT',
        coreName: 'enterpriseSearch',
        searchfield: this.searchfield,
        jsonQuery: '{"query":"*:*","filter":["docType:PRODUCT","companyIds:NN_COMPANY"]}',
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
        console.error('No results found')
      }
    }
  },
  setup() {
    return {
      closeOutline
    }
  }
})
</script>