<template>
  <ion-content>
    <ion-list>
      <ion-list-header>{{ translate("More options") }}</ion-list-header>
      <ion-item button @click="viewJobHistory()">
        <ion-icon slot="start" :icon="timeOutline" />
        <ion-label>{{ translate("History") }}</ion-label>
      </ion-item> 
      <ion-item button @click="copyJobInformation()">
        <ion-icon slot="start" :icon="copyOutline" />
        <ion-label>{{ translate("Copy details") }}</ion-label>
      </ion-item> 
      <ion-item button @click="runNow()">
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
import { computed, defineProps } from "vue";
import JobHistoryModal from "@/components/JobHistoryModal.vue"
import { Plugins } from '@capacitor/core';
import { hasError, showToast } from "@/utils";
import logger from "@/logger";
import { ChannelService } from "@/services/ChannelService";
import { DateTime } from 'luxon';
import { useStore } from "vuex";

const store = useStore();

const props = defineProps(["job"]);
const currentEComStore = computed(() => store.getters["user/getCurrentEComStore"])

function closePopover() {
  popoverController.dismiss({ dismissed: true });
}

async function viewJobHistory() {
  const jobHistoryModal = await modalController.create({
    component: JobHistoryModal,
    componentProps: { currentJob: props.job }
  });

  jobHistoryModal.onDidDismiss().then(() => {
    closePopover();
  })

  await jobHistoryModal.present();
}

async function copyJobInformation() {
  const job = props.job;

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
    header: translate("Cancel job"),
    message: translate("Canceling this job will cancel this occurrence and all following occurrences. This job will have to be re-enabled manually to run it again."),
    buttons: [{
      text: translate("Don't cancel"),
      role: "cancel"
    }, {
      text: translate("Cancel"),
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

async function runNow() {
  const jobAlert = await alertController.create({
    header: translate("Run now"),
    message: translate("Running this job now will not replace this job. A copy of this job will be created and run immediately. You may not be able to reverse this action.", { space: '<br/><br/>' }),
    buttons: [
      {
        text: translate("Cancel"),
        role: 'cancel',
      },
      {
        text: translate("Run now"),
        handler: async() => {
          if(props.job) {
            runServiceNow(props.job);
          }
        }
      }
    ]
  });

  return jobAlert.present();
}

async function runServiceNow(job: any) {
  let resp;

  const payload = {
    'JOB_NAME': job.jobName,
    'SERVICE_NAME': job.serviceName,
    'SERVICE_COUNT': '0',
    'SERVICE_TEMP_EXPR': job.jobStatus,
    'jobFields': {
      'productStoreId': job.status === "SERVICE_PENDING" ? job.productStoreId : currentEComStore.value.productStoreId,
      'systemJobEnumId': job.systemJobEnumId,
      'tempExprId': job.jobStatus, // Need to remove this as we are passing frequency in SERVICE_TEMP_EXPR, currently kept it for backward compatibility
      'parentJobId': job.parentJobId,
      'recurrenceTimeZone': store.state.user.current.timeZone,
      'createdByUserLogin': store.state.user.current.username,
      'lastModifiedByUserLogin': store.state.user.current.username
    },
    'statusId': "SERVICE_PENDING",
    'systemJobEnumId': job.systemJobEnumId
  } as any

  Object.keys(job.runtimeData).map((key: any) => {
    if(key !== "productStoreId" && key !== "shopifyConfigId" && key !== "shopId") {
      payload[key] = job.runtimeData[key];
    }
  })

  // checking if the runtimeData has productStoreId, and if present then adding it on root level
  job?.runtimeData?.productStoreId?.length >= 0 && (payload['productStoreId'] = job.status === "SERVICE_PENDING" ? job.productStoreId : store.state.user.currentEComStore.productStoreId)
  job?.priority && (payload['SERVICE_PRIORITY'] = job.priority.toString())
  job?.sinceId && (payload['sinceId'] = job.sinceId)

  // ShopifyConfig and ShopifyShop should be set based upon runtime data
  // If existing job is run now, copy as is else set the current shop of user
  const jobRunTimeDataKeys = job?.runtimeData ? Object.keys(job?.runtimeData) : [];
  if (jobRunTimeDataKeys.includes('shopifyConfigId') || jobRunTimeDataKeys.includes('shopId')) {
    if (job.status !== "SERVICE_PENDING" && !job.shopifyConfigId) {
      showToast(translate('Shopify configuration not found. Scheduling failed.'))
      return;
    }

    jobRunTimeDataKeys.includes('shopifyConfigId') && (payload['shopifyConfigId'] = job.status === "SERVICE_PENDING" ? job.runtimeData?.shopifyConfigId : job.shopifyConfigId);
    jobRunTimeDataKeys.includes('shopId') && (payload['shopId'] = job.status === "SERVICE_PENDING" ? job.runtimeData?.shopId : job?.shopId);
    payload['jobFields']['shopId'] = job.status === "SERVICE_PENDING" ? job.shopId : job?.shopId;
  }

  try {
    resp = await ChannelService.scheduleJob({ ...payload });
    if(!hasError(resp)) {
      showToast(translate("Service has been scheduled."))
      closePopover();
    } else {
      throw resp.data;
    }
  } catch(err) {
    showToast(translate("Failed to schedule service."))
    logger.error(err)
  }
}

function isRuntimePassed() {
  return props.job.runTime <= DateTime.now().toMillis()
}
</script> 