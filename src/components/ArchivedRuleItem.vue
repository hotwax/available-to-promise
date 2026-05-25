<template>
  <ion-accordion-group :value="isReorderActive.toString()">
    <ion-accordion value="false">
      <div slot="header" @click="$event.stopImmediatePropagation()"></div>

      <ion-card slot="content">
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
import { useRuleStore } from '@/store/rule';
import { commonUtil, emitter, translate } from '@common';

const ruleStore = useRuleStore();

const archivedRules = computed(() => ruleStore.getArchivedRules);
const isReorderActive = computed(() => ruleStore.isReorderActive);
const ruleGroup = computed(() => ruleStore.getRuleGroup);

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
        await ruleStore.updateRuleApi(rule, rule.ruleId)
      }))

      const hasFailedResponses = responses.some((response: any) => response.status !== "fulfilled")
      if(hasFailedResponses) {
        commonUtil.showToast(translate("Failed to unarchive some rules."))
      }
      await ruleStore.fetchRules({ ruleGroupId: ruleGroup.value.ruleGroupId })
      emitter.emit("dismissLoader")
    }
  })

  archivedRuleModal.present();
}
</script>