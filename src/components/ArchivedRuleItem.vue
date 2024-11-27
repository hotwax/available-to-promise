<template>
  <ion-accordion-group :value="isReorderActive">
    <ion-accordion value="false">
      <div slot="header" @click="$event.stopImmediatePropagation()"></div>

      <ion-card slot="content" v-if="archivedRules?.length">
        <ion-item button lines="full" @click="openArchivedRuleModal()">
          <ion-label>{{ translate("Archived") }}</ion-label>
          <ion-badge slot="end" color="medium">{{ archivedRules.length }} {{ translate(archivedRules.length === 1 ? "rule" : "rules") }}</ion-badge>
        </ion-item>
      </ion-card>
    </ion-accordion>
  </ion-accordion-group>
</template>

<script setup lang="ts">
import { IonAccordion, IonAccordionGroup, IonCard, IonBadge, IonItem, IonLabel, modalController } from '@ionic/vue';
import ArchivedRuleModal from "@/components/ArchivedRuleModal.vue";
import { computed } from 'vue';
import { useStore } from 'vuex';
import { translate } from '@hotwax/dxp-components';
import { RuleService } from '@/services/RuleService';
import { showToast } from '@/utils';
import emitter from '@/event-bus';

const store = useStore();

const archivedRules = computed(() => store.getters["rule/getArchivedRules"]);
const isReorderActive = computed(() => store.getters["rule/isReorderActive"]);
const ruleGroup = computed(() => store.getters["rule/getRuleGroup"]);

async function openArchivedRuleModal() {
  const archivedRuleModal = await modalController.create({
    component: ArchivedRuleModal,
    componentProps: {
      archivedRules: archivedRules.value
    }
  })

  archivedRuleModal.onDidDismiss().then(async (result) => {
    if(result?.data?.rulesToUnarchive?.length) {
      emitter.emit("presentLoader")
      const rulesToUnarchive = result.data.rulesToUnarchive
      
      const responses = await Promise.allSettled(rulesToUnarchive.map(async (rule: any) => {
        rule.statusId = "ATP_RULE_ACTIVE"
        await RuleService.updateRule(rule, rule.ruleId)
      }))

      const hasFailedResponses = responses.some((response: any) => response.status !== "fulfilled")
      if(hasFailedResponses) {
        showToast(translate("Failed to unarchive some rules."))
      }
      await store.dispatch("rule/fetchRules", { ruleGroupId: ruleGroup.value.ruleGroupId })
      store.dispatch('rule/fetchArchivedRules')
      emitter.emit("dismissLoader")
    }
  })

  archivedRuleModal.present();
}
</script>