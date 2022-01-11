<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button />
        <ion-title>{{ $t("Threshold management") }}</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear">{{ $t("Upload CSV") }}</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="find">
        <section class="search">
          <ion-searchbar />
        </section>

        <aside class="filters desktop-only">
          <ion-item>
            <ion-label>{{ $t("Only show selected products") }}</ion-label>
            <ion-toggle slot="end" />
          </ion-item>
        </aside>

        <main class="main">
          <section class="sort"></section>

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

            <div class="metadata">
              <ion-item lines="none">
                <ion-label>{{ $t("Select all variants") }}</ion-label>
                <ion-toggle />
              </ion-item>
            </div>
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
              </ion-item>
            </ion-card>
          </section>
          <hr />
        </main>
      </div>

      <div class="action">
        <ion-button>
          {{ $t("Select locations") }}
          <ion-icon :icon="arrowForwardOutline" />
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import Image from '@/components/Image.vue';
import {
  IonButton,
  IonCard,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonMenuButton,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToggle,
  IonToolbar
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { arrowForwardOutline } from 'ionicons/icons';

export default defineComponent({
  name: 'SelectProduct',
  components: {
    IonButton,
    IonCard,
    IonContent,
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
    Image
  },
  setup() {
    return {
      arrowForwardOutline
    };
  },
});
</script>

<style scoped>

.filters {
  border-right: 1px solid var(--ion-color-medium);
}
.section-grid {
  grid-template-columns: repeat(auto-fill, 200px);
}

.action {
  /* TODO use spacer variable */
  margin: 250px 0;
  text-align: center;
}
</style>
