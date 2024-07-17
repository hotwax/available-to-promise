<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ $t("Safety stock") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main v-if="ruleGroup.ruleGroupId && rules.length">
        <ScheduleRuleItem />

        <section>
          <ion-reorder-group :disabled="false" @ionItemReorder="updateReorderingRules($event)">
            <RuleItem v-for="(rule, ruleIndex) in (isReorderActive ? reorderingRules : rules)" :rule="rule" :ruleIndex="ruleIndex" :key="rule.ruleId" />
          </ion-reorder-group>
        </section>
      </main>

      <div class="empty-state" v-else>
       <p>{{ translate("No safety stock rule found.") }}</p>
      </div>
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="ion-margin">
      <ion-fab-button :disabled="!rules.length" class="ion-margin-bottom" color="light" @click="isReorderActive ? saveReorder() : activateReordering()">
        <ion-icon :icon="isReorderActive ? saveOutline : balloonOutline" />
      </ion-fab-button>
      <ion-fab-button :disabled="isReorderActive" @click="createRule()">
        <ion-icon :icon="addOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonMenuButton, IonPage, IonReorderGroup, IonTitle, IonToolbar, onIonViewDidLeave, onIonViewDidEnter } from '@ionic/vue';
import { addOutline, saveOutline, balloonOutline } from 'ionicons/icons';
import RuleItem from '@/components/RuleItem.vue';
import { useRouter } from "vue-router";
import ScheduleRuleItem from '@/components/ScheduleRuleItem.vue';
import { useStore } from 'vuex';
import { computed, ref } from 'vue';
import { translate } from '@hotwax/dxp-components';
import emitter from '@/event-bus';
import { RuleService } from '@/services/RuleService';
import { doReorder, showToast } from '@/utils';

const store = useStore();
const router = useRouter()

const rules = computed(() => store.getters["rule/getRules"]);
const ruleGroup = computed(() => store.getters["rule/getRuleGroup"]);
const isReorderActive = computed(() => store.getters["rule/isReorderActive"]);
const reorderingRules = ref([]);

onIonViewDidEnter(async() => {
  fetchRules();
  emitter.on("productStoreOrConfigChanged", fetchRules);
})

onIonViewDidLeave(() => {
  emitter.off("productStoreOrConfigChanged", fetchRules);
  store.dispatch("rule/updateIsReorderActive", false)
})

async function fetchRules() {
  emitter.emit("presentLoader");
  store.dispatch("util/updateSelectedSegment", "");
  store.dispatch("rule/updateIsReorderActive", false)
  await Promise.allSettled([store.dispatch('rule/fetchRules', { groupTypeEnumId: 'RG_SAFETY_STOCK', pageSize: 50 }), store.dispatch("util/fetchConfigFacilities"), store.dispatch("util/fetchFacilityGroups")]);
  emitter.emit("dismissLoader");
}

function activateReordering() {
  store.dispatch("rule/updateIsReorderActive", true)
  reorderingRules.value = rules.value;
}

async function saveReorder() {
  const diffRules = reorderingRules.value.filter((reorderRule: any) => rules.value.some((rule: any) => rule.ruleId === reorderRule.ruleId && rule.sequenceNum !== reorderRule.sequenceNum))
  if(!diffRules.length) {
    store.dispatch("rule/updateIsReorderActive", false)
    showToast(translate("No sequence has been changed."))
    return;
  }

  emitter.emit("presentLoader", { messgae: "Saving changes.." })
  const responses = await Promise.allSettled(diffRules.map(async (rule: any) => {
    await RuleService.updateRule(rule, rule.ruleId)
  }))

  const isFailedToUpdateSomeRule = responses.some((response) => response.status === 'rejected')
  if(isFailedToUpdateSomeRule) {
    showToast(translate("Failed to update sequence for some rules."))
  } else {
    showToast(translate("Sequence for rules updated successfully."))
  }
  emitter.emit("dismissLoader");
  await store.dispatch('rule/updateRules', { rules: reorderingRules.value })
  store.dispatch("rule/updateIsReorderActive", false)
}

function updateReorderingRules(event: any) {
  reorderingRules.value = doReorder(event, reorderingRules.value)
}

function createRule() {
  router.push({ path: '/create-safety-stock' })
}
</script>