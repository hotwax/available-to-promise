<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>{{ $t("Shipping") }}</ion-title>
      </ion-toolbar>

      <ion-toolbar>
        <ion-segment>
          <ion-segment-button value="productAndFacility">
            <ion-label>{{ $t("Product and facility") }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="productAndChannel">
            <ion-label>{{ $t("Product and channel") }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main>
        <section>
          <RuleItem />
          <RuleItem />
        </section>
      </main>
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button>
        <ion-icon :icon="addOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script lang="ts">
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { addOutline } from 'ionicons/icons';
import RuleItem from '@/components/RuleItem.vue'

export default defineComponent({
  name: 'Shipping',
  components: {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonLabel,
    IonPage,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToolbar,
    RuleItem
  },
  setup() {
    return {
      addOutline,
    };
  },
});
</script>