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
      <ion-item button @click="runNow(job)">
        <ion-icon slot="start" :icon="flashOutline" />
        <ion-label>{{ translate("Run now") }}</ion-label>
      </ion-item> 
      <ion-item button lines="none" :disabled="job.statusId === 'SERVICE_DRAFT'" @click="disableJob()">
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
import logger from "@/logger";
import { ChannelService } from "@/services/ChannelService";
import { DateTime } from 'luxon';
import { useStore } from "vuex";

const store = useStore();

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

async function disableJob() {
  const alert = await alertController.create({
    header: translate('Cancel job'),
    message: translate('Canceling this job will cancel this occurrence and all following occurrences. This job will have to be re-enabled manually to run it again.'),
    buttons: [{
      text: translate("Don't cancel"),
      role: 'cancel'
    }, {
      text: translate('Cancel'),
      handler: async() => {
        if(isRuntimePassed()) {
          showToast(translate("Job runtime has passed. Please refresh to get the latest job data in order to perform any action."))
          return;
        }

        try {
          const resp = await ChannelService.disableJob({ 
            jobId: props.job.jobId
          })

          if(!hasError(resp)) {
            showToast(translate("Successfully cancelled this job."))
            await store.dispatch("channel/fetchJobs");
            closePopover();
          } else {
            throw resp.data;
          }
        } catch(error: any) {
          showToast(translate("Failed to cancel this job."))
          logger.error(error);
        }
      }
    }],
  });

  return alert.present();
}

async function runNow(job: any) {
  const jobAlert = await alertController.create({
    header: translate("Run now"),
    message: translate('Running this job now will not replace this job. A copy of this job will be created and run immediately. You may not be able to reverse this action.', { space: '<br/><br/>' }),
    buttons: [
      {
        text: translate("Cancel"),
        role: 'cancel',
      },
      {
        text: translate('Run now'),
        handler: async() => {
          if (job) {
            await store.dispatch('channel/runServiceNow', job)
            closePopover();
          }
        }
      }
    ]
  });

  return jobAlert.present();
}

function isRuntimePassed() {
  return props.job.runTime <= DateTime.now().toMillis()
}
</script> 