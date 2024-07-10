<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title slot="start">{{ translate("Inventory channels") }}</ion-title>

        <ion-segment :value="selectedSegment" @ionChange="updateSegment($event)" slot="end">
          <ion-segment-button value="channels">
            <ion-label>{{ translate("Channels") }}</ion-label>
          </ion-segment-button>
          <!-- Todo: add functionality to the Publish segment -->
          <ion-segment-button value="publish">
            <ion-label>{{ translate("Publish") }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main>
        <section v-if="selectedSegment === 'channels'">
          <template v-if="inventoryChannels.length">
            <ion-card v-for="channel in inventoryChannels" :key="channel.facilityGroupId">
              <ion-card-header>
                <div>
                  <ion-card-subtitle class="overline">{{ channel.facilityGroupId }}</ion-card-subtitle>
                  <ion-card-title>{{ channel.facilityGroupName }}</ion-card-title>
                  <ion-card-subtitle>{{ channel.description }}</ion-card-subtitle>
                </div>
              </ion-card-header>
  
              <ion-item lines="full">
                <ion-icon slot="start" :icon="globeOutline"/>
                <ion-label>
                  {{ channel.selectedConfigFacility?.facilityName }}
                  <p>{{ channel.selectedConfigFacility?.facilityId }}</p>
                </ion-label>
                <ion-button slot="end" fill="clear" color="medium" @click="openLinkThresholdFacilitiesToGroupModal(channel)">
                  <ion-icon :icon="optionsOutline" slot="icon-only" />
                </ion-button>
              </ion-item>
  
              <ion-list>
                <ion-item-divider color="light">
                  <ion-label>{{ translate("Facilities") }}</ion-label>
                  <ion-button slot="end" fill="clear" color="medium" @click="openLinkFacilitiesToGroupModal(channel)">
                    <ion-icon :icon="optionsOutline" slot="icon-only" />
                  </ion-button>
                </ion-item-divider>
  
                <ion-item>
                  <ion-icon slot="start" :icon="storefrontOutline"/>
                  <ion-label>{{ translate("retail facilities", { count: getFacilityCount(channel, "STORE") })}}</ion-label>
                </ion-item>
  
                <ion-item lines="full">
                  <ion-icon slot="start" :icon="businessOutline"/>
                  <ion-label>{{ translate("warehouse", { count: getFacilityCount(channel, "WAREHOUSE") })}}</ion-label>
                </ion-item>
    
                <div class="actions">
                  <ion-button fill="clear" @click="openEditGroupModal(channel)">{{ translate("Edit group") }}</ion-button>
                  <!-- Functionality is not defined for this button hence commented it for now. -->
                  <!-- <ion-button color="medium" fill="clear" slot="end">
                    <ion-icon :icon="ellipsisVerticalOutline" slot="icon-only"/>
                  </ion-button> -->
                </div>
              </ion-list>
            </ion-card>
          </template>

          <div class="empty-state" v-else>
            <p>{{ translate("No inventory channel found.") }}</p>
          </div>
        </section>
 
        <section v-else-if="selectedSegment === 'publish'">
          <ion-card v-for="job in shopifyJobs" :key="job.shopId">
            <ion-card-header>
              <div>
                <ion-card-subtitle class="overline">{{ job.shopifyConfigId }}</ion-card-subtitle>
                <ion-card-title>{{ job.name ? job.name : job.shopifyConfigId }}</ion-card-title>
              </div>
              <ion-badge v-if="job.statusId === 'SERVICE_PENDING'" color="dark">{{ translate("running") }} {{ timeFromNow(job.runTime) }}</ion-badge>
            </ion-card-header>

            <ion-list>
              <ion-item lines="full">
                <ion-icon slot="start" :icon="timeOutline"/>
                <ion-select :label="translate('Run time')" :placeholder="translate('Select')" interface="popover" :value="job.runTimeValue" @ionChange="updateRunTime($event, job)">
                  <ion-select-option v-for="runTime in jobRuntimeOptions" :key="runTime.value" :value="runTime.value">{{ runTime.label }}</ion-select-option>
                </ion-select>

                <ion-modal class="date-time-modal" :is-open="isDateTimeModalOpen" @didDismiss="() => isDateTimeModalOpen = false">
                  <ion-content :force-overscroll="false">
                    <ion-datetime          
                      show-default-buttons
                      hour-cycle="h23"
                      :value="job.runTimeValue ? (isCustomRunTime(job.runTimeValue) ? getDateTime(job.runTimeValue) : getDateTime(DateTime.now().toMillis() + job.runTimeValue)) : getNowTimestamp()"
                      @ionChange="updateCustomTime($event, job)"
                    />
                  </ion-content>
                </ion-modal>
              </ion-item>

              <ion-item lines="full">
                <ion-icon slot="start" :icon="timerOutline"/>
                <ion-select :label="translate('Frequency')" :value="getJobStatus(job)" :placeholder="translate('Select')" interface="popover" @ionDismiss="updateFrequency($event, job)">
                  <ion-select-option v-for="freq in jobFrequencyOptions" :key="freq.id" :value="freq.id">{{ freq.description }}</ion-select-option>
                </ion-select>
              </ion-item>

              <ion-item lines="full">
                <ion-icon slot="start" :icon="albumsOutline"/>
                <ion-select :label="translate('Inventory group')" v-model="job.runtimeData.facilityGroupId" :disabled="job.statusId === 'SERVICE_PENDING'" :placeholder="translate('Select')" interface="popover">
                  <ion-select-option v-for="channel in inventoryChannels" :key="channel.facilityGroupId" :value="channel.facilityGroupId">{{ channel.facilityGroupName ? channel.facilityGroupName : channel.facilityGroupId }}</ion-select-option>
                </ion-select>
              </ion-item>

              <div class="actions">
                <ion-button fill="clear" @click="saveChanges(job)">{{ translate("Save changes") }}</ion-button>
                <ion-button color="medium" fill="clear" slot="end" @click="openShopActionsPopover($event, job)">
                  <ion-icon :icon="ellipsisVerticalOutline" slot="icon-only"/>
                </ion-button>
              </div>
            </ion-list>
          </ion-card>
        </section>
      </main>
    </ion-content>

    <ion-fab v-if="selectedSegment === 'channels'" vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="openCreateGroupModal()">
        <ion-icon :icon="addOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBadge, IonButton, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonDatetime, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonItemDivider, IonLabel, IonList, IonMenuButton, IonModal, IonPage, IonSegment, IonSegmentButton, IonSelect, IonSelectOption, IonTitle, IonToolbar, modalController, onIonViewDidEnter, onIonViewWillLeave, alertController, popoverController } from '@ionic/vue';
import { computed, ref } from 'vue';
import { addOutline, albumsOutline, businessOutline, ellipsisVerticalOutline, globeOutline, optionsOutline, storefrontOutline, timeOutline, timerOutline } from 'ionicons/icons';
import { translate } from '@/i18n';
import ShopActionsPopover from '@/components/ShopActionsPopover.vue'
import CreateGroupModal from '@/components/CreateGroupModal.vue'
import LinkFacilitiesToGroupModal from '@/components/LinkFacilitiesToGroupModal.vue'
import LinkThresholdFacilitiesToGroupModal from '@/components/LinkThresholdFacilitiesToGroupModal.vue'
import { useStore } from 'vuex';
import EditGroupModal from '@/components/EditGroupModal.vue';
import emitter from '@/event-bus';
import { DateTime } from 'luxon';
import CustomFrequencyModal from "@/components/CustomFrequencyModal.vue";
import { hasError, hasJobDataError, showToast } from "@/utils";
import { ChannelService } from '@/services/ChannelService';
import logger from "@/logger";

const store = useStore();

const inventoryChannels = computed(() => store.getters["channel/getInventoryChannels"])
const selectedSegment = computed(() => store.getters["util/getSelectedSegment"])
const shopifyJobs = computed(() => store.getters["channel/getJobs"])
const getTemporalExpr = computed(() => store.getters["channel/getTemporalExpr"])

const isDateTimeModalOpen = ref(false);
const allowedFrequencies = ref([
  {
    "id": "HOURLY",
    "description": "Hourly"
  }, {
    "id": "EVERY_6_HOUR",
    "description": "Every 6 hours"
  }, {
    "id": "EVERYDAY",
    "description": "Every day"
  }, {
    "id": "CUSTOM",
    "description": "Custom"
  }
])
const allowedRunTimes = ref([
  {
    "value": 0,
    "label": "Now"
  }, {
    "value": 300000,
    "label": "In 5 minutes"
  }, {
    "value": 900000,
    "label": "In 15 minutes"
  }, {
    "value": 3600000,
    "label": "In an hour"
  }, {
    "value": 86400000,
    "label": "Tomorrow"
  }, {
    "value": "CUSTOM",
    "label": "Custom"
  }
]);
const jobFrequencyOptions = ref([]) as any;
const jobRuntimeOptions = ref([]) as any;

onIonViewDidEnter(async() => {
  fetchInventoryChannels()
  emitter.on("productStoreOrConfigChanged", fetchInventoryChannels);
})

onIonViewWillLeave(() => {
  emitter.off("productStoreOrConfigChanged", fetchInventoryChannels);
})

async function fetchInventoryChannels() {
  emitter.emit("presentLoader");
  if(!selectedSegment.value || (selectedSegment.value !== 'channels' && selectedSegment.value !== 'publish')) store.dispatch("util/updateSelectedSegment", "channels");
  await Promise.allSettled([store.dispatch("channel/fetchInventoryChannels"), store.dispatch("util/fetchConfigFacilities")]);
  if(selectedSegment.value === "publish") {
    await Promise.allSettled([store.dispatch("channel/fetchJobs"), store.dispatch("channel/findTemporalExpression")]);
    generateFrequencyOptions();
    generateRuntimeOptions();
  }
  emitter.emit("dismissLoader");
}

async function openShopActionsPopover(event: Event, job: any) {
  const popover = await popoverController.create({
    component: ShopActionsPopover,
    componentProps: { job },
    showBackdrop: false,
    event
  });

  return popover.present();
}

async function openEditGroupModal(group: any) {
  const modal = await modalController.create({
    component: EditGroupModal,
    componentProps: { group }
  })

  modal.present()
}

async function openCreateGroupModal() {
  const popover = await modalController.create({
    component: CreateGroupModal
  });

  return popover.present();
}

async function openLinkFacilitiesToGroupModal(group: any) {
  const popover = await modalController.create({
    component: LinkFacilitiesToGroupModal,
    componentProps: { group, selectedFacilities: group.selectedFacilities }
  });

  return popover.present();
}

async function openLinkThresholdFacilitiesToGroupModal(group: any) {
  const popover = await modalController.create({
    component: LinkThresholdFacilitiesToGroupModal,
    componentProps: { group, selectedConfigFacilityId: group.selectedConfigFacility }
  });

  return popover.present();
}

function getFacilityCount(channel: any, facilityTypeId: string) {
  if(!channel.selectedFacilities?.length) return 0;

  if(facilityTypeId === 'STORE') {
    return channel.selectedFacilities.filter((facility: any) => facility.facilityTypeId === "RETAIL_STORE" || facility.facilityTypeId === "OUTLET_STORE").length;
  } else {
    return channel.selectedFacilities.filter((facility: any) => facility.facilityTypeId === "WAREHOUSE" || facility.facilityTypeId === "OUTLET_WAREHOUSE").length;
  }
}

async function updateSegment(event: any) {
  await store.dispatch("util/updateSelectedSegment", event.detail.value);
  if(selectedSegment.value === "publish") {
    await store.dispatch("channel/fetchJobs");
    await store.dispatch("channel/findTemporalExpression")
    generateFrequencyOptions()
    generateRuntimeOptions();
  }
}

function isCustomRunTime(value: number) {
  return !allowedRunTimes.value.some((runTime: any) => runTime.value === value)
}

function getJobStatus(job: any) {
  return job.statusId === "SERVICE_DRAFT" ? job.statusId : job.tempExprId;
}

function updateFrequency(event: any, job: any) {
  let selectedFrequency = event.target.value
  if(selectedFrequency === "CUSTOM") {
    setCustomFrequency(job);
    return;
  }

  job.tempExprId = selectedFrequency
}

async function setCustomFrequency(currentJob: any) {
  const customFrequencyModal = await modalController.create({
    component: CustomFrequencyModal,
  });

  await customFrequencyModal.present();

  await customFrequencyModal.onDidDismiss().then((result) => {
    if(result.data?.frequencyId) {
      currentJob.tempExprId = result.data.frequencyId
    }
    generateFrequencyOptions()
  });
}

function generateFrequencyOptions() {
  const frequencyOptions = JSON.parse(JSON.stringify(allowedFrequencies.value));

  shopifyJobs.value.map((job: any) => {
    const option = frequencyOptions.find((option: any) => option.id === job.tempExprId)
    if(!option) {
      const tempExpression = getTemporalExpr.value(job.tempExprId)
      if(tempExpression) frequencyOptions.push({ id: tempExpression.tempExprId, description: tempExpression.description });
    }
  })
  jobFrequencyOptions.value = frequencyOptions
}

function generateRuntimeOptions() {
  const runTimeOptions = JSON.parse(JSON.stringify(allowedRunTimes.value));

  shopifyJobs.value.map((job: any) => {
    if(job.statusId === "SERVICE_PENDING") {
      const selectedTime = runTimeOptions.find((option: any) => option.value === job.runTimeValue);
      if(!selectedTime) {
        runTimeOptions.push({ label: getTime(job.runTimeValue), value: job.runTimeValue })
      }
    }
  })
  jobRuntimeOptions.value = runTimeOptions
}

function updateRunTime(event: CustomEvent, currentJob: any) {
  const value = event.detail.value
  if (value != 'CUSTOM') {
    currentJob.runTimeValue = value
    generateRuntimeOptions()
  } else {
    isDateTimeModalOpen.value = true
  }
}

function updateCustomTime(event: CustomEvent, currentJob: any) {
  const currTime = DateTime.now().toMillis();
  const setTime = handleDateTimeInput(event.detail.value);
  if(setTime > currTime) {
    currentJob.runTimeValue = setTime
    generateRuntimeOptions()
  } else {
    showToast(translate("Provide a future date and time"))
  }
}

async function saveChanges(job: any) {
  const alert = await alertController
    .create({
      header: translate("Save changes"),
      message: translate("Are you sure you want to save these changes?"),
      buttons: [{
        text: translate("Cancel"),
        role: "cancel"
      }, {
        text: translate("Save"),
        handler: async() => {
          if(isCustomRunTime(job.runTimeValue) && isRuntimePassed(job)) {
            showToast(translate("Job runtime has passed. Please refresh to get the latest job data in order to perform any action."))
            return;
          }

          // return if job has missing data or error
          if(hasJobDataError(job)) return;

          job['jobStatus'] = job.tempExprId !== 'SERVICE_DRAFT' ? job.tempExprId : 'HOURLY';

          // Handling the case for 'Now'. Sending the now value will fail the API as by the time
          // the job is ran, the given 'now' time would have passed. Hence, passing empty 'run time'
          job.runTime = job.runTimeValue != 0 ? (!isCustomRunTime(job.runTimeValue) ? DateTime.now().toMillis() + job.runTimeValue : job.runTimeValue) : ''

          if (job?.statusId === 'SERVICE_DRAFT') {
            await scheduleService(job)
          } else if (job?.statusId === 'SERVICE_PENDING') {
            await updateJob(job);
            await store.dispatch('channel/updateJob', job)
          }
        }
      }]
    });
  return alert.present();
}

async function scheduleService(job: any) {
  let resp;

  const payload = {
    'JOB_NAME': job.jobName,
    'SERVICE_NAME': job.serviceName,
    'SERVICE_COUNT': '0',
    'SERVICE_TEMP_EXPR': job.jobStatus,
    'SERVICE_RUN_AS_SYSTEM':'Y',
    'jobFields': {
      'productStoreId': store.state.user.currentEComStore.productStoreId,
      'systemJobEnumId': job.systemJobEnumId,
      'tempExprId': job.jobStatus, // Need to remove this as we are passing frequency in SERVICE_TEMP_EXPR, currently kept it for backward compatibility
      'maxRecurrenceCount': '-1',
      'parentJobId': job.parentJobId,
      'runAsUser': 'system', //default system, but empty in run now.  TODO Need to remove this as we are using SERVICE_RUN_AS_SYSTEM, currently kept it for backward compatibility
      'recurrenceTimeZone': store.state.user.current.timeZone,
      'createdByUserLogin': store.state.user.current.username,
      'lastModifiedByUserLogin': store.state.user.current.username,
    },
    'statusId': "SERVICE_PENDING",
    'systemJobEnumId': job.systemJobEnumId
  } as any

  Object.keys(job.runtimeData).map((key: any) => {
    if(key !== "productStoreId" && key !== "shopifyConfigId" && key !== "shopId") {
      payload[key] = job.runtimeData[key];
    }
  })

  const jobRunTimeDataKeys = job?.runtimeData ? Object.keys(job?.runtimeData) : [];
  if (jobRunTimeDataKeys.includes('shopifyConfigId') || jobRunTimeDataKeys.includes('shopId')) {
    jobRunTimeDataKeys.includes('shopifyConfigId') && (payload['shopifyConfigId'] = job.shopifyConfigId);
    jobRunTimeDataKeys.includes('shopId') && (payload['shopId'] = job.shopId);
    payload['jobFields']['shopId'] = job.shopId;
  }

  // checking if the runtimeData has productStoreId, and if present then adding it on root level
  job?.runtimeData?.productStoreId?.length >= 0 && (payload['productStoreId'] = job.productStoreId)
  job?.priority && (payload['SERVICE_PRIORITY'] = job.priority.toString())
  job?.runTime && (payload['SERVICE_TIME'] = job.runTime.toString())

  try {
    resp = await ChannelService.scheduleJob({ ...payload });
    if (resp.status == 200 && !hasError(resp)) {
      showToast(translate("Service has been scheduled."));
      await store.dispatch("channel/fetchJobs");
      generateFrequencyOptions();
      generateRuntimeOptions();
    } else {
      throw resp.data;
    }
  } catch (err) {
    showToast(translate("Failed to schedule service."))
    logger.error(err)
  }
}

async function updateJob(job: any) {
  const payload = {
    'jobId': job.jobId,
    'systemJobEnumId': job.systemJobEnumId,
    'recurrenceTimeZone': store.state.user.current.userTimeZone,
    'tempExprId': job.jobStatus,
    'statusId': "SERVICE_PENDING",
    'runTimeEpoch': '',  // when updating a job clearning the epoch time, as job honors epoch time as runTime and the new job created also uses epoch time as runTime
    'lastModifiedByUserLogin': store.state.user.current.username
  } as any

  job?.runTime && (payload['runTime'] = job.runTime)
  job?.jobName && (payload['jobName'] = job.jobName)

  try {
    const resp = await ChannelService.updateJob(payload)
    if (!hasError(resp)) {
      showToast(translate("Service has been scheduled."))
      await store.dispatch("channel/fetchJobs");
      generateFrequencyOptions();
      generateRuntimeOptions();
    } else {
      throw resp.data;
    }
  } catch(error: any) {
    showToast(translate("Failed to schedule service."))
    logger.error(error)
  }
}

function isRuntimePassed(currentJob: any) {
  return currentJob.runTimeValue && currentJob.runTimeValue <= DateTime.now().toMillis()
}

function handleDateTimeInput(dateTimeValue: any) {
  // TODO Handle it in a better way
  // Remove timezone and then convert to timestamp
  // Current date time picker picks browser timezone and there is no supprt to change it
  const dateTime = DateTime.fromISO(dateTimeValue, { setZone: true}).toFormat("yyyy-MM-dd'T'HH:mm:ss")
  return DateTime.fromISO(dateTime).toMillis()
}

function getDateTime(time: any) {
  return DateTime.fromMillis(time).toISO()
}

const getNowTimestamp = () => {
  return DateTime.now().toISO();
}

function getTime (time: any) {
  return DateTime.fromMillis(time).toLocaleString(DateTime.DATETIME_MED);
}

function timeFromNow(time: any) {
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

.actions {
  display: flex;
  justify-content: space-between;
}

ion-modal.date-time-modal {
  --width: 290px;
  --height: 440px;
  --border-radius: 8px;
}
</style>