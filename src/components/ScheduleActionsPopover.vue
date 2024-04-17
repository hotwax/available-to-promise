<template>
  <ion-content>
    <ion-list>
      <ion-list-header>{{ translate("More options") }}</ion-list-header>
      <ion-item button>
        <ion-icon slot="start" :icon="timeOutline" />
        <ion-label>{{ translate("History") }}</ion-label>
      </ion-item> 
      <ion-item button>
        <ion-icon slot="start" :icon="flashOutline" />
        <ion-label>{{ translate("Run now") }}</ion-label>
      </ion-item> 
      <ion-item button lines="none" @click="disableRuleGroup()">
        <ion-icon slot="start" :icon="stopCircleOutline" color="danger" />
        <ion-label color="danger">{{ translate("Disable") }}</ion-label>
      </ion-item> 
    </ion-list>
  </ion-content>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonItem, IonLabel, IonList, IonListHeader } from "@ionic/vue";
import { translate } from "@/i18n";
import { flashOutline, stopCircleOutline, timeOutline } from 'ionicons/icons'
import { useStore } from "vuex";
import { computed } from "vue";
import { RuleService } from "@/services/RuleService";
import { hasError, showToast } from "@/utils";
import logger from "@/logger";

const store = useStore();
const ruleGroup = computed(() => store.getters["rule/getRuleGroup"]);

async function disableRuleGroup() {
  const payload = {
    ruleGroupId: ruleGroup.value.ruleGroupId,
    paused: "Y",
    systemMessageRemoteId: "RemoteSftp"
  }

  try {
    const resp = await RuleService.scheduleRule(payload)
    if(!hasError(resp)){
      const ruleGroupValue = JSON.parse(JSON.stringify(ruleGroup.value))
      ruleGroupValue.schedule.paused = "Y"
      store.dispatch("rule/updateRuleGroup", ruleGroupValue)
      showToast(translate("Rule group disabled successfully."))
    } else {
      throw resp.data
    }
  } catch(err) {
    showToast(translate("Failed to disable rule group."))
    logger.error(err)
  }
}
</script> 