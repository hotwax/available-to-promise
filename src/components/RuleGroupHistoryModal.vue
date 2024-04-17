<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal">
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Group history") }}</ion-title>
    </ion-toolbar>
  </ion-header>
  
  <ion-content>
    <ion-list>
      <ion-item v-for="history in groupHistory" :key="history.jobRunId">
        <ion-label>
          <h3>{{ getTime(history.startTime) }}</h3>
          <p>{{ getDate(history.startTime) }}</p>
        </ion-label>
        <ion-badge color="dark" v-if="history.endTime">{{ timeTillRun(history.endTime) }}</ion-badge>
      </ion-item>
    </ion-list>
  </ion-content>
</template>

<script setup lang="ts">
import { translate } from "@/i18n";
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
  modalController,
  onIonViewWillEnter,
} from "@ionic/vue";
import { closeOutline } from "ionicons/icons";
import { computed, onMounted, ref } from "vue";
import { getDate, getTime, timeTillRun, hasError } from "@/utils";
import { useStore } from "vuex";
import { RuleService } from "@/services/RuleService";
import logger from "@/logger";

const store = useStore();
const ruleGroup = computed(() => store.getters["rule/getRuleGroup"]);

let groupHistory = ref([]) as any

onMounted(async () => {
  await fetchGroupHistory()
})

async function fetchGroupHistory() {
  groupHistory.value = []

  if(!ruleGroup.value?.jobName) {
    return;
  }

  try {
    const resp = await RuleService.fetchRuleGroupHistory(ruleGroup.value.jobName)

    if(!hasError(resp)) {
      // Sorting the history based on startTime, as we does not get the records in sorted order from api
      groupHistory.value = resp.data.sort((a: any, b: any) => b.startTime - a.startTime)
    } else {
      throw resp.data;
    }
  } catch(err) {
    logger.error(err)
  }
}

function closeModal() {
  modalController.dismiss();
}
</script>
