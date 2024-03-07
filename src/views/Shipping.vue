<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>{{ translate("Shipping") }}</ion-title>
      </ion-toolbar>

      <ion-toolbar>
        <ion-segment v-model="selectedSegment">
          <ion-segment-button value="productAndFacility">
            <ion-label>{{ translate("Product and facility") }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="productAndChannel">
            <ion-label>{{ translate("Product and channel") }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="facility">
            <ion-label>{{ translate("Facility") }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main>
        <section v-if="selectedSegment === 'productAndFacility'">
          <RuleItem />
          <RuleItem />
        </section>
        <section v-else-if="selectedSegment === 'productAndChannel'">
          <RuleItem />
          <RuleItem />
        </section>
        <section v-else>
          <FacilityItem />
          <FacilityItem />
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
import { translate } from '@hotwax/dxp-components';
import FacilityItem from '@/components/FacilityItem.vue';

export default defineComponent({
  name: 'Shipping',
  components: {
    FacilityItem,
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
  data() {
    return {
      selectedSegment: 'productAndFacility'
    }
  },
  setup() {
    return {
      addOutline,
      translate
    };
  },
});
</script>