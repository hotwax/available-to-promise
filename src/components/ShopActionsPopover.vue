<template>
  <ion-content>
    <ion-list>
      <ion-list-header>{{ translate("More options") }}</ion-list-header>
      <ion-item button @click="viewJobHistory(job)">
        <ion-icon slot="start" :icon="timeOutline" />
        <ion-label>{{ translate("History") }}</ion-label>
      </ion-item> 
      <ion-item button @click="copyJobInformation(job)">
        <ion-icon slot="start" :icon="copyOutline" />
        <ion-label>{{ translate("Copy details") }}</ion-label>
      </ion-item> 
      <ion-item button>
        <ion-icon slot="start" :icon="flashOutline" />
        <ion-label>{{ translate("Run now") }}</ion-label>
      </ion-item> 
      <ion-item button lines="none" :disabled="job.statusId === 'SERVICE_DRAFT'">
        <ion-icon slot="start" :icon="stopCircleOutline" color="danger" />
        <ion-label color="danger">{{ translate("Disable") }}</ion-label>
      </ion-item> 
    </ion-list>
  </ion-content>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonItem, IonLabel, IonList, IonListHeader, alertController, modalController, popoverController } from "@ionic/vue";
import { translate } from "@/i18n";
import { copyOutline, flashOutline, stopCircleOutline, timeOutline } from 'ionicons/icons'
import { defineProps } from "vue";
import JobHistoryModal from "@/components/JobHistoryModal.vue"
import { Plugins } from '@capacitor/core';
import { hasError, showToast } from "@/utils";
import { DateTime } from 'luxon';

const props = defineProps(["job"]);

function closePopover() {
  popoverController.dismiss({ dismissed: true });
}

async function viewJobHistory(job: any) {
  const jobHistoryModal = await modalController.create({
    component: JobHistoryModal,
    componentProps: { currentJob: job }
  });

  jobHistoryModal.onDidDismiss().then(() => {
    closePopover();
  })

  await jobHistoryModal.present();
}

async function copyJobInformation(job: any) {
  const { Clipboard } = Plugins;
  const jobDetails = `jobId: ${job.jobId}, jobName: ${job.enumName}, jobDescription: ${job.description} ${job.runtimeData ? (", runtimeData: " + JSON.stringify(job.runtimeData)) : ""}`;

  await Clipboard.write({
    string: jobDetails
  }).then(() => {
    showToast(translate("Copied to clipboard"));
  })

  closePopover();
}
</script> 