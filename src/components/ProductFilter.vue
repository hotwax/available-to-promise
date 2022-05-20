<template>
  <ion-list>
    <ion-item lines="inset">
      <ion-label>{{ $t("Threshold") }}</ion-label>
      <ion-input
        type="number"
        :placeholder="$t('global threshold')"
        v-model="threshold"
      />
    </ion-item>
    <ion-list-header>
      <div>
        <h3>{{ $t("Include") }}</h3>
        <ion-button
          fill="clear"
          color="warning"
          @click="resetFilters('included')"
          >{{ $t("reset") }}</ion-button
        >
      </div>
    </ion-list-header>
    <ion-card>
      <ion-toolbar>
        <ion-item lines="none">
          <ion-label>{{ $t("Tags") }}</ion-label>
          <ion-button
            fill="clear"
            slot="end"
            size="small"
            @click="searchFilter('tags', 'tagsFacet', 'tags', 'included')"
          >
            <ion-label>{{ $t("add") }}</ion-label>
            <ion-icon :icon="addCircleOutline" />
          </ion-button>
        </ion-item>
      </ion-toolbar>
      <ion-card-content>
        <ion-chip
          v-for="(tag, index) in appliedFilters['included']['tags']"
          :key="index"
        >
          <ion-icon :icon="pricetagOutline" />
          <ion-label>{{ tag }}</ion-label>
          <ion-icon
            :icon="closeCircle"
            @click="removeFilters('included', 'tags', tag)"
          />
        </ion-chip>
      </ion-card-content>
    </ion-card>
  </ion-list>
  <ion-list>
    <ion-list-header>
      <div>
        <h3>{{ $t("Exclude") }}</h3>
        <ion-button
          fill="clear"
          color="warning"
          @click="resetFilters('excluded')"
          >{{ $t("reset") }}</ion-button
        >
      </div>
    </ion-list-header>
    <ion-card>
      <ion-toolbar>
        <ion-item lines="none">
          <ion-label>{{ $t("Tags") }}</ion-label>
          <ion-button
            fill="clear"
            slot="end"
            size="small"
            @click="searchFilter('tags', 'tagsFacet', 'tags', 'excluded')"
          >
            <ion-label>{{ $t("add") }}</ion-label>
            <ion-icon :icon="addCircleOutline" />
          </ion-button>
        </ion-item>
      </ion-toolbar>
      <ion-card-content>
        <ion-chip
          v-for="(tag, index) in appliedFilters['excluded']['tags']"
          :key="index"
        >
          <ion-icon :icon="pricetagOutline" />
          <ion-label>{{ tag }}</ion-label>
          <ion-icon
            :icon="closeCircle"
            @click="removeFilters('excluded', 'tags', tag)"
          />
        </ion-chip>
      </ion-card-content>
    </ion-card>
  </ion-list>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonButton,  
  IonCard,
  IonCardContent,
  IonChip,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,  
  IonToolbar,  
  modalController,
} from "@ionic/vue";
import { mapGetters, useStore } from "vuex";
import ProductFilterModal from "@/components/ProductFilterModal.vue";
import { addCircleOutline, closeCircle, pricetagOutline } from "ionicons/icons";

export default defineComponent({
  name: "ProductFilters",
  components: {
    IonButton,  
    IonCard,
    IonCardContent,
    IonChip,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,  
    IonToolbar,  
  },
  data() {
    return {
      threshold: "" as any,
      queryString: "",
    };
  },
  computed: {
    ...mapGetters({
      appliedFilters: "product/getAppliedFilters",
    }),
  },
  methods: {
    async resetFilters(type: string) {
      // checking that if any of the current type does not have any attribute selected than not making solr query
      if (
        Object.entries(this.appliedFilters[type]).every(
          (filter: any) => filter[1].length <= 0
        )
      ) {
        return;
      }
      await this.store.dispatch("product/resetFilters", { type });
      this.queryString = "";
    },
    async searchFilter(
      label: string,
      facetToSelect: string,
      searchfield: string,
      type: string
    ) {
      const modal = await modalController.create({
        component: ProductFilterModal,
        componentProps: {
          label,
          facetToSelect,
          searchfield,
          type,
        },
      });
      modal.onDidDismiss().then((payload) => {
        if (payload.data.isFilterChanged) {
          this.queryString = "";
        }
      });
      modal.present();
    },
    async removeFilters(type: string, id: string, value: string) {
      await this.store.dispatch("product/updateAppliedFilters", {
        type,
        id,
        value,
      });
      this.queryString = "";
    },
  },

  ionViewDidLeave() {
    //Cleared query string to clear search keyword whenever user navigates to SelectProduct page
    this.queryString = "";
    this.threshold = "";
  },

  setup() {
    const store = useStore();

    return {
      addCircleOutline,
      closeCircle,
      pricetagOutline,
      store,
    };
  },
});
</script>

<style scoped>
ion-modal {
  --width: 290px;
  --height: 382px;
  --border-radius: 8px;
}
</style>
