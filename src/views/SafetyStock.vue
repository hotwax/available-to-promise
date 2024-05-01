<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ $t("Safety stock") }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="updateReorderStatus()">
            <ion-icon slot="icon-only" :icon="reorderTwoOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main v-if="ruleGroup.ruleGroupId">
        <ScheduleRuleItem />

        <section>
          <RuleItem v-for="(rule, ruleIndex) in rules" :rule="rule" :ruleIndex="ruleIndex" :key="rule.ruleId" />
        </section>
      </main>

      <div class="empty-state" v-else>
       <p>{{ translate("No threshold rules found") }}</p>
      </div>
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="createRule()">
        <ion-icon :icon="addOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonMenuButton, IonPage, IonTitle, IonToolbar, onIonViewWillEnter } from '@ionic/vue';
import { addOutline, reorderTwoOutline } from 'ionicons/icons';
import RuleItem from '@/components/RuleItem.vue';
import { useRouter } from "vue-router";
import ScheduleRuleItem from '@/components/ScheduleRuleItem.vue';
import { useStore } from 'vuex';
import { computed, ref } from 'vue';
import { translate } from '@/i18n';
import emitter from '@/event-bus';

const store = useStore();
const router = useRouter()

const rules = computed(() => store.getters["rule/getRules"]);
const ruleGroup = computed(() => store.getters["rule/getRuleGroup"]);
const isReorderActive = computed(() => store.getters["rule/getIsReorderActive"]);

onIonViewWillEnter(async() => {
  emitter.emit("presentLoader");
  await Promise.allSettled([store.dispatch('rule/fetchRules', { groupTypeEnumId: 'RG_SAFETY_STOCK' }), store.dispatch("util/fetchConfigFacilities"), store.dispatch("util/fetchFacilityGroups")]);
  emitter.emit("dismissLoader");
})

function updateReorderStatus() {
  if(isReorderActive.value === false) {
    store.dispatch("rule/updateIsReorderActive", true);
  } else {
    store.dispatch("rule/updateIsReorderActive", false);
  }
}

function createRule() {
  router.push({ path: '/create-safety-stock' })
}
</script>