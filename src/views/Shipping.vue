<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ translate("Shipping") }}</ion-title>
      </ion-toolbar>

      <ion-toolbar>
        <ion-segment v-model="selectedSegment" @ionChange="updateRuleGroup()">
          <ion-segment-button value="RG_SHIPPING_FACILITY">
            <ion-label>{{ translate("Product and facility") }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="RG_SHIPPING_CHANNEL">
            <ion-label>{{ translate("Product and channel") }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="facility">
            <ion-label>{{ translate("Facility") }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main v-if="ruleGroup.ruleGroupId">
        <ScheduleRuleItem v-if="selectedSegment !== 'facility'" />

        <section v-if="selectedSegment !== 'facility'">
          <RuleItem :selectedSegment="selectedSegment" v-for="(rule, ruleIndex) in rules" :rule="rule" :ruleIndex="ruleIndex" :key="rule.ruleId" />
        </section>
        <section v-else>
          <FacilityItem />
          <FacilityItem />
        </section>
      </main>

      <div class="empty-state" v-else>
        <p>{{ translate("No shipping rules found") }}</p>
      </div>
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="createShipping()">
        <ion-icon :icon="addOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonLabel, IonMenuButton, IonPage, IonSegment, IonSegmentButton, IonTitle, IonToolbar } from '@ionic/vue';
import { ref } from 'vue';
import { addOutline } from 'ionicons/icons';
import RuleItem from '@/components/RuleItem.vue'
import { translate } from '@/i18n';
import FacilityItem from '@/components/FacilityItem.vue';
import ScheduleRuleItem from '@/components/ScheduleRuleItem.vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { computed, onMounted } from 'vue';

const store = useStore();
const router = useRouter()

const rules = computed(() => store.getters["rule/getRules"]);
const ruleGroup = computed(() => store.getters["rule/getRuleGroup"]);

console.log(router.currentRoute.value);


const selectedSegment = ref(router.currentRoute.value.query.groupTypeEnumId ? router.currentRoute.value.query.groupTypeEnumId : "RG_SHIPPING_FACILITY")

onMounted(async() => {
  await store.dispatch('rule/fetchRules', { groupTypeEnumId: router.currentRoute.value.query.groupTypeEnumId ? router.currentRoute.value.query.groupTypeEnumId : "RG_SHIPPING_FACILITY" })
  await store.dispatch("util/fetchConfigFacilities");
})

async function updateRuleGroup() {
  await store.dispatch('rule/fetchRules', { groupTypeEnumId: selectedSegment.value})
}

function createShipping() {
  router.replace({ path: '/create-shipping', query: { groupTypeEnumId: selectedSegment.value } })
}
</script>