<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ $t("Threshold management") }}</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="mobile-only">
            <ion-icon :icon="downloadOutline" />
          </ion-button>
          <ion-button fill="clear" class="mobile-only">
            <ion-icon :icon="filterOutline" />
          </ion-button>
          <ion-button class="desktop-only" @click="() => router.push('/select-product-csv-upload')">{{ $t("Upload CSV") }}</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="find">
        <section class="search">
          <ion-searchbar :placeholder="$t('Search products')" />
        </section>

        <aside class="filters desktop-only">
          <ion-card>
            <ion-toolbar>
              <ion-title>{{ $t("Tags") }}</ion-title>
            </ion-toolbar>
            <ion-card-content>
              <ion-chip outline>
                <ion-label>{{ 'Sample' }}</ion-label>
              </ion-chip>
            </ion-card-content>
          </ion-card>
        </aside>

        <main class="main">
          <section class="sort">
            <ion-item lines="none">
              <h2>{{ $t("Results") }}:</h2>
            </ion-item>

            <div>
              <ion-item lines="none">
                <ion-icon :icon="documentTextOutline" slot="start" />
                <ion-label class="ion-text-wrap">{{ $t("Show order items") }}</ion-label>
                <ion-toggle slot="end" checked></ion-toggle>
              </ion-item>
            </div>
          </section>

          <hr />

          <section class="section-header">
            <div class="primary-info">
              <ion-item lines="none">
                <ion-label>
                  Parent Product
                  <p>5 {{ $t("variants") }}</p>
                </ion-label>
              </ion-item>
            </div>

            <div class="tags"></div>
          </section>

          <section class="section-grid">
            <ion-card>
              <Image src="https://cdn.shopify.com/s/files/1/0069/7384/9727/products/test-track.jpg?v=1626255137" />
              <ion-item lines="none">
                <ion-label>
                  SKU
                  <p>Color: Blue</p>
                  <p>Size: XL</p>
                </ion-label>
                <ion-checkbox slot="end" />
              </ion-item>
            </ion-card>
            <ion-card>
              <Image src="https://cdn.shopify.com/s/files/1/0069/7384/9727/products/test-track.jpg?v=1626255137" />
              <ion-item lines="none">
                <ion-label>
                  SKU
                  <p>Color: Blue</p>
                  <p>Size: XL</p>
                </ion-label>
                <ion-checkbox slot="end" />
              </ion-item>
            </ion-card>
          </section>
          <hr />
        </main>
      </div>

      <div class="action desktop-only">
        <ion-button @click="() => router.push('/select-facility')">
          {{ $t("Select locations") }}
          <ion-icon :icon="arrowForwardOutline" />
        </ion-button>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="mobile-only">
        <ion-fab-button>
          <ion-icon :icon="arrowForwardOutline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import Image from '@/components/Image.vue';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCheckbox,
  IonChip,
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
  IonToolbar
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { arrowForwardOutline, downloadOutline, filterOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'SelectProduct',
  components: {
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCheckbox,
    IonChip,
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
    Image
  },
  setup() {
    const router = useRouter();

    return {
      arrowForwardOutline,
      downloadOutline,
      filterOutline,
      router
    };
  },
});
</script>

<style scoped>
.section-grid {
  grid-template-columns: repeat(auto-fill, 200px);
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
