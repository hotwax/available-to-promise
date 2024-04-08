<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ translate("Store pickup") }}</ion-title>
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

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="createStorePickup()">
          <ion-icon :icon="addOutline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonLabel, IonMenuButton, IonPage, IonSegment, IonSegmentButton, IonTitle, IonToolbar } from '@ionic/vue';
import { ref } from 'vue';
import { addOutline } from 'ionicons/icons';
import RuleItem from '@/components/RuleItem.vue'
import FacilityItem from '@/components/FacilityItem.vue'
import { translate } from '@/i18n';
import ScheduleRuleItem from '@/components/ScheduleRuleItem.vue';
import { useRouter } from 'vue-router';

const selectedSegment = ref("productAndFacility")

const router = useRouter()

function createStorePickup() {
  router.replace({ path: '/create-store-pickup' })
}
</script>