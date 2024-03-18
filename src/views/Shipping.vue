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
        <ScheduleRuleItem v-if="selectedSegment !== 'facility'" />

        <section v-if="selectedSegment === 'productAndFacility' || selectedSegment === 'productAndChannel'">
          <RuleItem :selectedSegment="selectedSegment" />
          <RuleItem :selectedSegment="selectedSegment" />
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

<script setup lang="ts">
import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonLabel, IonPage, IonSegment, IonSegmentButton, IonTitle, IonToolbar } from '@ionic/vue';
import { ref } from 'vue';
import { addOutline } from 'ionicons/icons';
import RuleItem from '@/components/RuleItem.vue'
import { translate } from '@hotwax/dxp-components';
import FacilityItem from '@/components/FacilityItem.vue';
import ScheduleRuleItem from '@/components/ScheduleRuleItem.vue';

const selectedSegment = ref("productAndFacility")
</script>