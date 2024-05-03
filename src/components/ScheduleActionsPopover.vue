<template>
  <ion-content>
    <ion-list>
      <ion-list-header>{{ translate("More options") }}</ion-list-header>
      <ion-item button @click="openRuleGroupHistoryModal()">
        <ion-icon slot="start" :icon="timeOutline" />
        <ion-label>{{ translate("History") }}</ion-label>
      </ion-item>
      <ion-item button @click="runNow()">
        <ion-icon slot="start" :icon="flashOutline" />
        <ion-label>{{ translate("Run now") }}</ion-label>
      </ion-item>
      <ion-item button lines="none" :disabled="!ruleGroup.schedule || (ruleGroup.schedule?.paused === 'Y')" @click="disableRuleGroup()">
        <ion-icon slot="start" :icon="stopCircleOutline" color="danger" />
        <ion-label color="danger">{{ translate("Disable") }}</ion-label>
      </ion-item>
    </ion-list>
  </ion-content>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonItem, IonLabel, IonList, IonListHeader, alertController, modalController } from "@ionic/vue";
import { translate } from '@hotwax/dxp-components';
import { flashOutline, stopCircleOutline, timeOutline } from 'ionicons/icons'
import { useStore } from "vuex";
import { computed } from "vue";
import { RuleService } from "@/services/RuleService";
import { hasError, showToast } from "@/utils";
import logger from "@/logger";
import RuleGroupHistoryModal from '@/components/RuleGroupHistoryModal.vue';
import { popoverController } from "@ionic/core";
import emitter from "@/event-bus";

const store = useStore();
const ruleGroup = computed(() => store.getters["rule/getRuleGroup"]);

async function disableRuleGroup() {
  const payload = {
    ruleGroupId: ruleGroup.value.ruleGroupId,
    paused: "Y",
    systemMessageRemoteId: "RemoteSftp"
  }

  emitter.emit("presentLoader");
  try {
    const resp = await RuleService.scheduleRuleGroup(payload)
    if(!hasError(resp)){
      const ruleGroupValue = JSON.parse(JSON.stringify(ruleGroup.value))
      ruleGroupValue.schedule.paused = "Y"
      store.dispatch("rule/updateRuleGroup", ruleGroupValue)
      showToast(translate("Rule group disabled successfully."))
      popoverController.dismiss();
    } else {
      throw resp.data
    }
  } catch(err) {
    showToast(translate("Failed to disable rule group."))
    logger.error(err)
  }
  emitter.emit("dismissLoader");
}

async function openRuleGroupHistoryModal() {
  const groupHistoryModal = await modalController.create({
    component: RuleGroupHistoryModal
  })

  await popoverController.dismiss();
  groupHistoryModal.present();
}

async function runNow() {
  const scheduleAlert = await alertController
    .create({
      header: translate("Run now"),
      message: translate("Running this schedule now will not replace this schedule. A copy of this schedule will be created and run immediately. You may not be able to reverse this action."),
      buttons: [
        {
          text: translate("Cancel"),
          role: "cancel",
        },
        {
          text: translate("Run now"),
          handler: async () => {
            emitter.emit("presentLoader");
            // Checking that if we already have the job schedule before calling runNow, because if the job scheduler is not present then runNow action can't be performed
            // If the scheduler for the job is available then we will have jobName, if not then first scheduling the job in draft status just to create a routing schedule and then calling runNow action
            if(!ruleGroup.value.jobName) {
              const payload = {
                ruleGroupId: ruleGroup.value.ruleGroupId,
                paused: "Y",  // passing Y as we just need to configure the scheduler and do not need to schedule it in active state
              }

              try {
                const resp = await RuleService.scheduleRuleGroup(payload)
                if(hasError(resp)) {
                  throw resp.data
                }
              } catch(err) {
                logger.error(err)
                emitter.emit("dismissLoader");
                return;
              }
            }

            try {
              const resp = await RuleService.runNow(ruleGroup.value.ruleGroupId)
              if(!hasError(resp) && resp.data.jobRunId) {
                showToast(translate("Service has been scheduled"))
                popoverController.dismiss();
              } else {
                throw resp.data
              }
            } catch(err) {
              showToast(translate("Failed to schedule service"))
              logger.error(err)
            }
            emitter.emit("dismissLoader");
          }
        }
      ]
    });

  return scheduleAlert.present();
}
</script> 