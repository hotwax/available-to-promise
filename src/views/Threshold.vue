<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ translate("Threshold") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main v-if="ruleGroup.ruleGroupId && (rules.length || archivedRules.length)">
        <ScheduleRuleItem v-if="rules.length" />
        <ArchivedRuleItem v-if="archivedRules?.length" />

        <section v-if="rules.length">
          <ion-reorder-group :disabled="false" @ionItemReorder="updateReorderingRules($event)">
            <RuleItem v-for="(rule, ruleIndex) in (isReorderActive ? reorderingRules : rules)" :rule="rule" :ruleIndex="ruleIndex" :key="rule.ruleId" />
          </ion-reorder-group>
        </section>
      </main>

      <div class="empty-state" v-else>
       <p>{{ translate("No threshold rule found.") }}</p>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="ion-margin">
        <ion-fab-button :disabled="!rules.length" class="ion-margin-bottom" color="light" @click="isReorderActive ? saveReorder() : activateReordering()">
          <ion-icon :icon="isReorderActive ? saveOutline : balloonOutline" />
        </ion-fab-button>
        <ion-fab-button :disabled="isReorderActive" @click="createRule()">
          <ion-icon :icon="addOutline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonMenuButton, IonPage, IonReorderGroup, IonTitle, IonToolbar, onIonViewDidLeave, onIonViewDidEnter } from '@ionic/vue';
import { addOutline, balloonOutline, saveOutline } from 'ionicons/icons';
import RuleItem from '@/components/RuleItem.vue'
import ScheduleRuleItem from '@/components/ScheduleRuleItem.vue';
import ArchivedRuleItem from '@/components/ArchivedRuleItem.vue';
import { useRouter } from 'vue-router';
import { computed, ref } from 'vue';
import { useRuleStore } from '@/store/rule';
import { useUtilStore } from '@/store/util';
import { translate } from '@hotwax/dxp-components';
import emitter from '@/event-bus';
import { doReorder, showToast } from '@/utils';

const ruleStore = useRuleStore();
const utilStore = useUtilStore();
const router = useRouter()

const rules = computed(() => ruleStore.getRules);
const ruleGroup = computed(() => ruleStore.getRuleGroup);
const isReorderActive = computed(() => ruleStore.isReorderActive);
const archivedRules = computed(() => ruleStore.getArchivedRules);
const reorderingRules = ref([]) as any;

onIonViewDidEnter(async() => {
  fetchRules();
  emitter.on("productStoreOrConfigChanged", fetchRules);
})

onIonViewDidLeave(() => {
  emitter.off("productStoreOrConfigChanged", fetchRules);
  ruleStore.updateIsReorderActive(false)
})

async function fetchRules() {
  emitter.emit("presentLoader");
  utilStore.updateSelectedSegment("");
  ruleStore.updateIsReorderActive(false)
  await Promise.allSettled([ruleStore.fetchRules({ groupTypeEnumId: 'RG_THRESHOLD', pageSize: 50 }), utilStore.fetchConfigFacilities(), utilStore.fetchFacilityGroups()]);
  emitter.emit("dismissLoader");
}


function activateReordering() {
  ruleStore.updateIsReorderActive(true)
  reorderingRules.value = rules.value;
}

async function saveReorder() {
  const diffRules = reorderingRules.value.filter((reorderRule: any) => rules.value.some((rule: any) => rule.ruleId === reorderRule.ruleId && rule.sequenceNum !== reorderRule.sequenceNum))
  if(!diffRules.length) {
    ruleStore.updateIsReorderActive(false)
    showToast(translate("No sequence has been changed."))
    return;
  }

  emitter.emit("presentLoader", { messgae: "Saving changes.." })
  const responses = await Promise.allSettled(diffRules.map(async (rule: any) => {
    await ruleStore.updateRuleApi(rule, rule.ruleId)
  }))

  const isFailedToUpdateSomeRule = responses.some((response: any) => response.status === 'rejected')
  if(isFailedToUpdateSomeRule) {
    showToast(translate("Failed to update sequence for some rules."))
  } else {
    showToast(translate("Sequence for rules updated successfully."))
  }
  emitter.emit("dismissLoader");
  await ruleStore.updateRules({ rules: reorderingRules.value })
  ruleStore.updateIsReorderActive(false)
}

function updateReorderingRules(event: any) {
  reorderingRules.value = doReorder(event, reorderingRules.value)
}

function createRule() {
  router.push({ path: '/create-threshold' })
}
</script>
