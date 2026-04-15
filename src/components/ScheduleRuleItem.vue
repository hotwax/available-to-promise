<template>
  <ion-accordion-group :value="isReorderActive.toString()">
    <ion-accordion value="false">
      <div slot="header" @click="$event.stopImmediatePropagation()"></div>
      <ion-card slot="content">
        <ion-card-header>
          <ion-card-title>{{ translate("Schedule") }}</ion-card-title>
          <ion-badge :color="ruleGroup.schedule?.paused === 'Y' ? 'warning' : 'dark'">{{ ruleGroup.schedule?.paused === "Y" ? translate("Paused") : commonUtil.getRelativeTime(ruleGroup.schedule?.nextExecutionDateTime) }}</ion-badge>
        </ion-card-header>

        <ion-item>
          <ion-icon slot="start" :icon="timeOutline"/>
          <ion-label>{{ translate("Run time") }}</ion-label>
          <!-- When the group is in draft status, do not display the runTime from the schedule -->
          <ion-label slot="end">{{ ruleGroup.schedule?.paused === 'N' ? commonUtil.getDateAndTime(ruleGroup.schedule?.nextExecutionDateTime) : "-" }}</ion-label>
        </ion-item>
        <ion-item lines="full">
          <ion-icon slot="start" :icon="timerOutline"/>
          <!-- When the group is in draft status or the job is not present, do not display the frequency and just display the label for schedule -->
          <ion-select :label="translate('Schedule')" interface="popover" :placeholder="translate('Select')" value="0 0 0 * * ?" :disabled="true">
            <ion-select-option v-for="(expression, description) in cronExpressions" :key="expression" :value="expression">{{ description }}</ion-select-option>
          </ion-select>
        </ion-item>
      
        <div class="actions">
          <ion-button fill="clear" :disabled="ruleGroup.schedule?.paused === 'N'" @click="saveSchedule()">{{ translate("Schedule") }}</ion-button>
          <ion-button color="medium" fill="clear" slot="end" @click="openScheduleActionsPopover($event)">
            <ion-icon :icon="ellipsisVerticalOutline" slot="icon-only"/>
          </ion-button>
        </div>
      </ion-card>
    </ion-accordion>
  </ion-accordion-group>
</template>

<script setup lang="ts">
import { IonAccordion, IonAccordionGroup, IonBadge, IonButton, IonCard, IonCardHeader, IonCardTitle, IonIcon, IonItem, IonLabel, IonSelect, IonSelectOption, popoverController } from '@ionic/vue';
import { emitter, logger, translate } from '@common';
import { ellipsisVerticalOutline, timeOutline, timerOutline } from 'ionicons/icons';
import ScheduleActionsPopover from "@/components/ScheduleActionsPopover.vue";
import { computed } from 'vue';
import { commonUtil } from '@common'
import { useRuleStore } from '@/store/rule';
import { DateTime } from 'luxon';

const ruleStore = useRuleStore();
const ruleGroup = computed(() => ruleStore.getRuleGroup);
const isReorderActive = computed(() => ruleStore.isReorderActive);

const cronExpressions = JSON.parse(import.meta.env.VITE_CRON_EXPRESSIONS)

async function openScheduleActionsPopover(event: Event) {
  const popover = await popoverController.create({
    component: ScheduleActionsPopover,
    showBackdrop: false,
    event
  });

  return popover.present();
}

async function saveSchedule() {
  const payload = {
    ruleGroupId: ruleGroup.value.ruleGroupId,
    paused: 'N',
    ...ruleGroup.value,
    cronExpression: "0 0 0 * * ?",
    // Hardcoding for now, need to fetch system message remote id for the ftp server config.
    systemMessageRemoteId: "RemoteSftp"
  }

  emitter.emit("presentLoader");
  try {
    const resp = await ruleStore.scheduleRuleGroup(payload)
    if(!commonUtil.hasError(resp)) {
      commonUtil.showToast(translate("Service has been scheduled."))
      await ruleStore.fetchRules({ groupTypeEnumId: ruleGroup.value.groupTypeEnumId, pageSize: 50 })
    } else {
      throw resp.data
    }
  } catch(err) {
    commonUtil.showToast(translate("Failed to schedule service."))
    logger.error(err)
  }
  emitter.emit("dismissLoader");
}



</script>

<style scoped>
ion-card-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.actions {
  display: flex;
  justify-content: space-between;
}
</style>