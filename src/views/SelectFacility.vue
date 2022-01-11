<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button />
        <ion-title>{{ $t("Select facility") }}</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="mobile-only">
            <ion-icon :icon="downloadOutline" />
          </ion-button>
          <ion-button fill="clear" class="mobile-only">
            <ion-icon :icon="filterOutline" />
          </ion-button>
          <ion-button
            class="desktop-only"
            @click="() => router.push('/select-product-csv-upload')"
            >{{ $t("Upload CSV") }}</ion-button
          >
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="find">
        <section class="search">
          <ion-searchbar :placeholder="$t('Search orders')" />
        </section>

        <aside class="filters desktop-only">
          <ion-list>
            <ion-list-header>Filter stores</ion-list-header>
            <ion-item>
              <ion-label>State</ion-label>
              <ion-select value="all">
                <ion-select-option value="all">All</ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-label>Type</ion-label>
              <ion-select value="any">
                <ion-select-option value="any">Any</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-list>

          <ion-list>
            <ion-list-header>Selected products</ion-list-header>
            <ion-item-divider>Parent</ion-item-divider>
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
            <ion-label>Stores</ion-label>
          </ion-item>

          <section class="section-grid">
            <ion-card>
              <ion-item-divider>Store Group</ion-item-divider>
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
              <ion-item-divider>Store Group</ion-item-divider>
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
        <ion-button>
          {{ $t("Set safety stock") }}
          <ion-icon slot="end" :icon="checkmarkDoneOutline" />
        </ion-button>
      </div>

      <ion-fab
        vertical="bottom"
        horizontal="end"
        slot="fixed"
        class="mobile-only"
      >
        <ion-fab-button>
          <ion-icon :icon="arrowForwardOutline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import Image from "@/components/Image.vue";
import {
  IonButton,
  IonButtons,
  IonCard,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonMenuButton,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/vue";
import { defineComponent } from "vue";
import {
  checkmarkDoneOutline,
  downloadOutline,
  filterOutline,
} from "ionicons/icons";
import { useRouter } from "vue-router";
export default defineComponent({
  name: "SelectProduct",
  components: {
    IonButton,
    IonButtons,
    IonCard,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonMenuButton,
    IonPage,
    IonSearchbar,
    IonTitle,
    IonToolbar,
  },
  setup() {
    const router = useRouter();
    return {
      checkmarkDoneOutline,
      downloadOutline,
      filterOutline,
      router,
    };
  },
});
</script>

<style scoped>
.filters {
  border-right: 1px solid var(--ion-color-medium);
}

@media (min-width: 991px) {
  .action {
    /* desktop-only class is setting display to unset and below properties were not getting applied that is why display is set block here */
    display: block;
    /* TODO use spacer variable */
    margin: 250px 0;
    text-align: center;
  }
}
</style>
