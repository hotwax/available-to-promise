<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button default-href="/" slot="start" />
        <ion-title>{{ translate("Select facility") }}</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="mobile-only">
            <ion-icon :icon="downloadOutline" />
          </ion-button>
          <ion-button fill="clear" class="mobile-only">
            <ion-icon :icon="filterOutline" />
          </ion-button>
          <ion-button class="desktop-only" @click="() => router.push('/select-facility-csv-upload')">{{ translate("Upload CSV") }}</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="find">
        <section class="search">
          <ion-searchbar :placeholder="translate('Search orders')" />
        </section>

        <aside class="filters desktop-only">
          <ion-list>
            <ion-list-header>{{ translate("Filter stores") }}</ion-list-header>
            <ion-item>
              <ion-label>{{ translate("State") }}</ion-label>
              <ion-select value="all">
                <ion-select-option value="all">All</ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-label>{{ translate("Type") }}</ion-label>
              <ion-select value="any">
                <ion-select-option value="any">Any</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-list>

          <ion-list>
            <ion-list-header>{{ translate("Selected products") }}</ion-list-header>
            <ion-item-divider>
              Parent
              <ion-checkbox slot="end"/>
            </ion-item-divider>
            <ion-item>
              <ion-label>Variant name</ion-label>
              <ion-checkbox slot="end" />
            </ion-item>
            <ion-item>
              <ion-label>Variant name</ion-label>
              <ion-checkbox slot="end" />
            </ion-item>
            <ion-item>
              <ion-label>Variant name</ion-label>
              <ion-checkbox slot="end" />
            </ion-item>
          </ion-list>
        </aside>

        <main class="main">
          <section class="sort"></section>

          <section class="section-header"></section>

          <ion-item lines="none">
            <ion-label>{{ translate("Stores") }}</ion-label>
          </ion-item>

          <section class="section-grid">
            <ion-card>
              <ion-item-divider>
                Store Group
                <ion-checkbox slot="end"/>
              </ion-item-divider>
              <ion-item>
                <ion-label>Store name</ion-label>
                <ion-checkbox slot="end" />
              </ion-item>
              <ion-item>
                <ion-label>Store name</ion-label>
                <ion-checkbox slot="end" />
              </ion-item>
              <ion-item>
                <ion-label>Store name</ion-label>
                <ion-checkbox slot="end" />
              </ion-item>
            </ion-card>
            <ion-card>
              <ion-item-divider>
                Store Group
                <ion-checkbox slot="end"/>
              </ion-item-divider>
              <ion-item>
                <ion-label>Store name</ion-label>
                <ion-checkbox slot="end" />
              </ion-item>
              <ion-item>
                <ion-label>Store name</ion-label>
                <ion-checkbox slot="end" />
              </ion-item>
              <ion-item>
                <ion-label>Store name</ion-label>
                <ion-checkbox slot="end" />
              </ion-item>
            </ion-card>
          </section>
        </main>
      </div>

      <div class="action desktop-only">
        <ion-button @click="setSafetyStock()">
          {{ translate("Set safety stock") }}
          <ion-icon slot="end" :icon="checkmarkDoneOutline" />
        </ion-button>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="mobile-only">
        <ion-fab-button @click="setSafetyStock()">
          <ion-icon :icon="checkmarkDoneOutline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonContent,
  IonCheckbox,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { defineComponent } from "vue";
import {
  checkmarkDoneOutline,
  downloadOutline,
  filterOutline
} from "ionicons/icons";
import { useRouter } from "vue-router";
import SafetyStockModal from "@/components/SafetyStockModal.vue";
import { translate } from "@hotwax/dxp-components";

export default defineComponent({
  name: "SelectFacility",
  components: {
    IonBackButton,
    IonButton,
    IonButtons,
    IonCard,
    IonContent,
    IonCheckbox,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonItemDivider,
    IonLabel,
    IonList,
    IonListHeader,
    IonPage,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar
  },
  methods: {
    async setSafetyStock() {
      const safetystockmodal = await modalController.create({
        component: SafetyStockModal,
      });
      return safetystockmodal.present();
    },
  },
  setup() {
    const router = useRouter();
    return {
      checkmarkDoneOutline,
      downloadOutline,
      filterOutline,
      router,
      translate
    };
  },
});
</script>

<style scoped>
.filters {
  border-right: 1px solid var(--ion-color-medium);
}

ion-item-divider > ion-checkbox {
   margin-inline-end: 16px;
}

@media (min-width: 991px) {
  .action {
    position: absolute;
    bottom: 25%;
    left: 50%;
    transform: translate(-50%, 0);
  }
}
</style>
