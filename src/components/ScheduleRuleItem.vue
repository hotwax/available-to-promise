<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>{{ translate("Schedule") }}</ion-card-title>
      <ion-badge :color="ruleGroup.schedule?.paused === 'Y' ? 'warning' : 'dark'">{{ ruleGroup.schedule?.paused === "Y" ? translate("Paused") : timeTillJob(ruleGroup.schedule?.nextExecutionDateTime) }}</ion-badge>
    </ion-card-header>

    <ion-item>
      <ion-icon slot="start" :icon="timeOutline"/>
      <ion-label>{{ translate("Run time") }}</ion-label>
      <!-- When the group is in draft status, do not display the runTime from the schedule -->
      <ion-label slot="end">{{ ruleGroup.schedule?.paused === 'N' ? getDateAndTime(ruleGroup.schedule?.nextExecutionDateTime) : "-" }}</ion-label>
    </ion-item>
    <ion-item>
      <ion-icon slot="start" :icon="timerOutline"/>
      <!-- When the group is in draft status or the job is not present, do not display the frequency and just display the label for schedule -->
      <ion-select :label="translate('Schedule')" interface="popover" :placeholder="translate('Select')" value="0 0 0 * * ?" :disabled="true">
        <ion-select-option v-for="(expression, description) in cronExpressions" :key="expression" :value="expression">{{ description }}</ion-select-option>
      </ion-select>
    </ion-item>
  
    <ion-item lines="none">
      <ion-button fill="clear" @click="saveSchedule()">{{ translate("Schedule") }}</ion-button>
      <ion-button color="medium" fill="clear" slot="end" @click="OpenScheduleActionsPopover($event)">
        <ion-icon :icon="ellipsisVerticalOutline" slot="icon-only"/>
      </ion-button>
    </ion-item>
  </ion-card>
</template>

<script setup lang="ts">
import { IonBadge, IonButton, IonCard, IonCardHeader, IonCardTitle, IonIcon, IonItem, IonLabel, IonSelect, IonSelectOption, onIonViewDidEnter, popoverController } from '@ionic/vue';
import { translate } from '@/i18n';
import { ellipsisVerticalOutline, timeOutline, timerOutline } from 'ionicons/icons';
import ScheduleActionsPopover from "@/components/ScheduleActionsPopover.vue";
import { computed, ref, onMounted } from 'vue';
import { getDateAndTime, hasError, showToast } from '@/utils'
import { useStore } from 'vuex';
import logger from '@/logger';
import { RuleService } from '@/services/RuleService';
import { DateTime } from 'luxon';

const store = useStore();
const ruleGroup = computed(() => store.getters["rule/getRuleGroup"]);

const cronExpressions = JSON.parse(process.env?.VUE_APP_CRON_EXPRESSIONS as string)

async function OpenScheduleActionsPopover(event: Event) {
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

  try {
    const resp = await RuleService.scheduleRule(payload)
    if(!hasError(resp)) {
      showToast(translate("Service has been scheduled"))
      await store.dispatch('rule/fetchRules', { groupTypeEnumId: 'RG_THRESHOLD' })
    } else {
      throw resp.data
    }
  } catch(err) {
    showToast(translate("Failed to schedule service"))
    logger.error(err)
  }
}

function timeTillJob(time: any) {
  if(!time) {
    return;
  }
  const timeDiff = DateTime.fromMillis(time).diff(DateTime.local());
  return DateTime.local().plus(timeDiff).toRelative();
}

</script>

<style scoped>
ion-card-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>