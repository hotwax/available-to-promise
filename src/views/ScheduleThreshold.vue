<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/select-product"/>
        <ion-title>{{ $t("Schedule new threshold") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div>
        <aside>
          <ion-list>
            <ion-list-header>{{ $t("Info") }}</ion-list-header>
            <ion-item>
              <ion-icon :icon="shirtOutline" slot="start" />
              <ion-label>{{ products.total.variant }} {{ $t('SKUs') }}</ion-label>
            </ion-item>
            <ion-item>
              <ion-icon :icon="optionsOutline" slot="start" />
              <ion-label>{{ threshold }} {{ $t('threshold') }}</ion-label>
            </ion-item>

            <ion-item>
              <ion-label color="medium">{{ $t("Name") }}</ion-label>
              <ion-input :placeholder="$t('rule name')" v-model="jobName"/>
            </ion-item>

            <ion-item>
              <ion-icon slot="start" :icon="timeOutline" />
              <ion-label>{{ $t("Run time") }}</ion-label>
              <ion-label id="open-run-time-modal" slot="end">{{ initialRunTime ? getTime(initialRunTime) : $t('Select run time') }}</ion-label>
              <ion-modal trigger="open-run-time-modal">
                <ion-content force-overscroll="false">
                  <ion-datetime
                    :value="initialRunTime ? getDateTime(initialRunTime) : ''"
                    @ionChange="updateRunTime($event)"
                  />
                </ion-content>
              </ion-modal>
            </ion-item>
          </ion-list>
        </aside>

        <main>
          <h2>{{ $t("Threshold pipeline") }}</h2>
          <ion-reorder-group @ionItemReorder="doReorder($event)" disabled="false">
            <div v-for="job in jobsForReorder" :key="job.jobId">
              <ion-card>
                <ion-card-header>
                  <ion-card-title>
                    {{ job.jobId ? job.jobName : jobName }}
                  </ion-card-title>
                  <ion-reorder></ion-reorder>
                </ion-card-header>

                <ion-item>
                  <ion-label>{{ getEnumDescription(job.systemJobEnumId) ? getEnumDescription(job.systemJobEnumId) : job.systemJobEnumId }}</ion-label>
                  <ion-icon :icon="checkmarkCircleOutline" color="success" v-if="successJobs.includes(job.jobId)" />
                  <ion-icon :icon="closeCircleOutline" color="danger" v-if="failedJobs.includes(job.jobId)" />
                </ion-item>

                <ion-item>
                  <ion-icon slot="start" :icon="timeOutline" />
                  <ion-label class="ion-text-wrap">{{ job.runTime ? getTime(job.runTime) : "-"  }}</ion-label>
                  <ion-badge v-if="job.runTime" color="dark">{{ timeTillJob(job.runTime)}}</ion-badge>
                </ion-item>

                <ion-item lines="none">
                  <ion-icon slot="start" :icon="timerOutline" />
                  <ion-label class="ion-text-wrap">{{ job.tempExprId && temporalExpr(job.tempExprId)?.description ? temporalExpr(job.tempExprId)?.description : "🙃"  }}</ion-label>
                </ion-item>
              </ion-card>
            </div>
          </ion-reorder-group>
        </main>
      </div>

      <div class="action desktop-only">
        <!-- disabling button as once user have clicked schedule job and some jobs have failed then clicking the button again will re-run the whole process -->
        <ion-button @click="saveThresholdRule()" :disabled="failedJobs.length || isServiceScheduling">
          <ion-icon slot="start" :icon="saveOutline" />
          {{ $t("Schedule Job") }}
        </ion-button>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="mobile-only">
        <ion-fab-button @click="saveThresholdRule()" :disabled="failedJobs.length || isServiceScheduling">
          <ion-icon :icon="arrowForwardOutline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { arrowForwardOutline, checkmarkCircleOutline, closeCircleOutline, copyOutline, optionsOutline, saveOutline, shirtOutline, timerOutline, timeOutline } from 'ionicons/icons'
import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonDatetime,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonModal,
  IonPage,
  IonReorder,
  IonReorderGroup,
  IonTitle,
  IonToolbar
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { getResponseError, handleDateTimeInput, hasError, showToast } from '@/utils';
import { translate } from '@/i18n';
import { JobService } from '@/services/JobService';
import { DateTime } from 'luxon';
import { mapGetters, useStore } from 'vuex';
import { ProductService } from '@/services/ProductService';
import { useRouter } from 'vue-router';
import logger from '@/logger';
import emitter from '@/event-bus';

export default defineComponent({
  name: 'SelectProduct',
  components: {
    IonBackButton,
    IonBadge,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonDatetime,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonModal,
    IonPage,
    IonReorder,
    IonReorderGroup,
    IonTitle,
    IonToolbar
  },
  data() {
    return {
      jobName: '',
      jobEnumId: 'JOB_EXP_PROD_THRSHLD',
      isServiceScheduling: false,
      jobsForReorder: [] as any,
      initialJobsOrder: [] as any,
      initialRunTime: '',
      updatedJobsOrder: [] as any,
      failedJobs: [] as any,
      successJobs: [] as any,
      job: {} as any
    }
  },
  computed: {
    ...mapGetters({
      currentEComStore: 'user/getCurrentEComStore',
      shopifyConfig: 'util/getShopifyConfig',
      facilitiesByProductStore: 'util/getFacilityByProductStore',
      query: 'product/getQuery',
      temporalExpr: 'job/getTemporalExpr',
      getEnumDescription: 'job/getEnumDescription',
      userProfile: 'user/getUserProfile',
      threshold: 'product/getThreshold',
      products: 'product/getProducts',
    })
  },
  methods: {
    // method to update the run time for all the jobs, for now hardcoded the time diff of 15 mins.
    updateRunTime(ev: CustomEvent, timeDiff = 900000) {
      const changedDateTime = handleDateTimeInput(ev['detail'].value)
      const previousSeq = JSON.parse(JSON.stringify(this.jobsForReorder))

      // added this condition to handle the case of method called twice
      if (changedDateTime === previousSeq[0].runTime) return;

      // assigning the selected time to the first job and then updating the runTime by timediff for
      // each next jobs
      let threshold = 0;
      this.jobsForReorder.map((job: any) => {
        job.runTime = changedDateTime + threshold;
        threshold += timeDiff
      })
      const updatedSeq = JSON.parse(JSON.stringify(this.jobsForReorder))
      this.initialRunTime = this.jobsForReorder.find((job: any) => job.statusId !== 'SERVICE_DRAFT').runTime

      // return the jobs that have a difference from the original sequence
      let diffSeq = this.findJobDiff(previousSeq, updatedSeq)

      const updatedRunTime = updatedSeq.map((job: any) => job.runTime)
      Object.keys(diffSeq).map((key: any) => {
        diffSeq[key].runTime = updatedRunTime[key]
      })

      diffSeq = Object.keys(diffSeq).map((key) => diffSeq[key])

      // assigned the diffSeq to the updatedJobsOrder and initialJobsOrder as the updatedJobsOrder will
      // be used to determine which jobs to update and initialJobsOrder will be used when reordering the
      // jobs
      this.updatedJobsOrder = this.initialJobsOrder = diffSeq
    },
    findJobDiff(previousSeq: any, updatedSeq: any) {
      const diffSeq: any = Object.keys(previousSeq).reduce((diff, key) => {
        if (updatedSeq[key].jobId === previousSeq[key].jobId && updatedSeq[key].runTime === previousSeq[key].runTime) return diff
        return {
          ...diff,
          [key]: updatedSeq[key]
        }
      }, {})
      return diffSeq;
    },
    doReorder(event: CustomEvent) {
      const previousSeq = JSON.parse(JSON.stringify(this.initialJobsOrder))

      // returns the updated sequence after reordering
      const updatedSeq = event.detail.complete(JSON.parse(JSON.stringify(this.jobsForReorder)));

      let diffSeq = this.findJobDiff(previousSeq, updatedSeq)

      const updatedRunTime = previousSeq.map((job: any) => job.runTime)
      Object.keys(diffSeq).map((key: any) => {
        diffSeq[key].runTime = updatedRunTime[key]
      })

      diffSeq = Object.keys(diffSeq).map((key) => diffSeq[key])

      this.jobsForReorder = updatedSeq
      this.updatedJobsOrder = diffSeq
    },
    getDate (runTime: any) {
      return DateTime.fromMillis(runTime).toLocaleString(DateTime.DATE_MED);
    },
    getTime (runTime: any) {
      return DateTime.fromMillis(runTime).toLocaleString(DateTime.TIME_SIMPLE);
    },
    getDateTime(time: any) {
      return DateTime.fromMillis(time)
    },
    timeTillJob (time: any) {
      const timeDiff = DateTime.fromMillis(time).diff(DateTime.local());
      return DateTime.local().plus(timeDiff).toRelative();
    },
    async saveThresholdRule() {
      emitter.emit('presentLoader');

      this.isServiceScheduling = true;
      this.failedJobs = []
      this.successJobs = []
      const solrQuery = this.query

      const jobRunTime = this.updatedJobsOrder.find((job: any) => !job.jobId)?.runTime

      let diffSeq = this.findJobDiff(this.initialJobsOrder, this.jobsForReorder)
      this.updatedJobsOrder = Object.keys(diffSeq).map((key) => diffSeq[key])

      // filtered jobs by removing the new job as we need to update already existing job
      const jobsToUpdate = this.updatedJobsOrder.filter((job: any) => job.jobId)

      // re-initialized params object from query as there is no need for grouping or pagination when storing the query
      solrQuery.json.params = {
        "q.op": "AND"
      }
      // made the query to default (*:*) before storing, as the threshold will be set for all the products those
      // are fullfilling the filters condition
      solrQuery.json['query'] = "*:*"

      try {
        const resp = await ProductService.createSearchPreference({
          searchPrefValue: JSON.stringify(solrQuery)
        });

        if (resp.status == 200 && resp?.data?.searchPrefId) {
          const searchPreferenceId = resp.data.searchPrefId;
          const params = {
            "searchPrefId": searchPreferenceId,
            "userSearchPrefTypeId": "THRESHOLD_INV_QUERY"
          }
          // TODO: Handle the case whether we will schedule service if searchPrefId is not associated with user.
          await ProductService.associateSearchPrefToUser(params);
          await this.scheduleService(searchPreferenceId, this.threshold, jobRunTime)

          // checking whether the service has been scheduled successfully, if yes then only updating other jobs otherwise not
          if (this.successJobs.includes('')) {

            await Promise.allSettled(jobsToUpdate.map(async (job: any) => {
              // using resp and checking it, as we need jobId that will not be available in case
              // of promise is rejected
              try {

                const payload = {
                  'jobId': job.jobId,
                  'systemJobEnumId': job.systemJobEnumId,
                  'tempExprId': job.frequency ? job.frequency : job.jobStatus,
                  'statusId': "SERVICE_PENDING"
                } as any

                job?.runTime && (payload['runTime'] = job.runTime)
                job?.sinceId && (payload['sinceId'] = job.sinceId)
                job?.jobName && (payload['jobName'] = job.jobName)

                const resp = await JobService.updateJob(payload)
                if(resp.status == 200 && !hasError(resp) && resp.data.successMessage) {
                  // if the job succeded when updating then adding the jobId to the successJobs array
                  this.successJobs.push(job.jobId)
                } else {
                  // if the job failed when updating then adding the jobId to the failedJobs array
                  this.failedJobs.push(job.jobId)
                  showToast(translate('Failed to update some jobs'))
                  logger.error('Failed to update some jobs')
                }
              } catch(err) {
                this.failedJobs.push(job.jobId)
                showToast(translate('Failed to update some jobs'))
                logger.error(err)
              }
            }))
          } else {
            logger.error('Failed to schedule service, hence other jobs are not updated')
            this.failedJobs = this.updatedJobsOrder.map((job: any) => job.jobId)
            showToast(translate('Failed to schedule service, hence other jobs are not updated'))
          }
        } else {
          showToast(translate('Failed to schedule service, hence other jobs are not updated'))
          logger.error('Failed to schedule service as search preference is not created, hence other jobs are not updated')
          this.failedJobs = this.updatedJobsOrder.map((job: any) => job.jobId)
          this.failedJobs.push('')
        }
      } catch (err) {
        logger.error(err)
        showToast(translate('Something went wrong'))
        this.failedJobs = this.updatedJobsOrder.map((job: any) => job.jobId)
        this.failedJobs.push('')
      }
      this.isServiceScheduling = false
      emitter.emit('dismissLoader');

      // If there are no failed jobs then redirecting the user to the select product page
      if (!this.failedJobs.length) {
        this.store.dispatch('product/clearAllFilters')
        this.router.push('/select-product')
      } else {
        logger.error('Some jobs have failed while updating/scheduling')
      }
    },
    async scheduleService(searchPreferenceId: string, threshold: string, runTime: string) {
      const productStoreId = this.currentEComStore.productStoreId
      let shopifyConfigId = this.shopifyConfig[productStoreId]
      let facilityId = this.facilitiesByProductStore[productStoreId]

      // Used Guard Clause
      if (!Object.keys(this.job).length) {
        // adding new job in failed status if the draft job data is not available
        this.failedJobs.push('')
        showToast(translate('Configuration missing'))
        return;
      }

      if(!shopifyConfigId) {
        const shopifyConfig = await this.store.dispatch('util/getShopifyConfig', productStoreId)
        shopifyConfigId = shopifyConfig.shopifyConfigId
      }

      if (!facilityId) {
        const resp = await this.store.dispatch('util/fetchFacilitiesByProductStore', {
          inputFields: {
            productStoreId,
            facilityTypeId: 'CONFIGURATION'
          },
          entityName: 'ProductStoreFacilityDetail',
          fieldList: ['facilityId', 'productStoreId'],
          distinct: 'Y',
          noConditionFind: 'Y',
          filterByDate: 'Y',
          viewSize: 10
        })
        facilityId = resp[productStoreId]
      }

      if (!facilityId.length) {
        // adding new job in failed status if the facilityId is not available
        this.failedJobs.push('')
        showToast(translate('Configuration missing'))
        return;
      }

      const payload = this.job ? {
        'JOB_NAME': this.jobName ? this.jobName : this.userProfile.partyName,
        'SERVICE_NAME': this.job.serviceName,
        'SERVICE_COUNT': '0',
        'jobFields': {
          'productStoreId': productStoreId,
          'systemJobEnumId': this.job.systemJobEnumId,
          'maxRecurrenceCount': '-1',
          'parentJobId': this.job.parentJobId,
          'recurrenceTimeZone': this.userProfile?.userTimeZone
        },
        'shopifyConfigId': shopifyConfigId,
        'statusId': "SERVICE_PENDING",
        'systemJobEnumId': this.job.systemJobEnumId,
        'includeAll': true, // true: includes all the product, false: includes only products updated in the last 24 hours
        searchPreferenceId,
        threshold,
        facilityId
      } as any : {}

      // checking if the runtimeData has productStoreId, and if present then adding it on root level
      this.job?.runtimeData?.productStoreId?.length >= 0 && (payload['productStoreId'] = productStoreId)
      this.job?.priority && (payload['SERVICE_PRIORITY'] = this.job.priority.toString())

      try {
        const scheduleJobRequests = [];
        // Job will be scheduled for single run where include all will be true
        // This will apply threshold on exisiting products
        // Deep cloning payload so that both the schedules do not share same reference
        scheduleJobRequests.push(JobService.scheduleJob(JSON.parse(JSON.stringify({ ...this.job.runtimeData, ...payload }))).catch(error => { return error }))
        payload['SERVICE_TEMP_EXPR'] = 'EVERYDAY';
        payload['jobFields'].tempExprId = 'EVERYDAY'; // Need to remove this as we are passing frequency in SERVICE_TEMP_EXPR, currently kept it for backward compatibility
        payload['SERVICE_RUN_AS_SYSTEM'] = 'Y';
        payload['jobFields'].runAsUser = 'system';// default system, but empty in run now. TODO Need to remove this as we are using SERVICE_RUN_AS_SYSTEM, currently kept it for backward compatibility
        payload['includeAll'] =  false;
        this.job.runTime && (payload['SERVICE_TIME'] = runTime.toString())

        // Scheduling Job that will run everyday and as system
        scheduleJobRequests.push(JobService.scheduleJob({ ...this.job.runtimeData, ...payload }).catch(error => { return error }))
        let scheduleJobResponse = await Promise.all(scheduleJobRequests);
        let ifScheduleJobSuccess = scheduleJobResponse.every((response: any) => {
          return response.status == 200 && !hasError(response);
        })
        if (ifScheduleJobSuccess) {
          showToast(translate('Service has been scheduled'))
          this.successJobs.push('')
        } else {
          let errorMessage = scheduleJobResponse.reduce((errorMessage: string, response: any) => {
            return errorMessage += getResponseError(response);
          }, "")
          logger.error(errorMessage)
          this.failedJobs.push('')
        }
      } catch (err) {
        this.failedJobs.push('')
        this.$log.error(err);
      }
    },
    async fetchExportThresholdJobs() {
      // added loader as fetching jobs information may take some time
      emitter.emit('presentLoader');

      const payload = {
        "inputFields": {
          "statusId": "SERVICE_DRAFT",
          "statusId_op": "equals",
          "systemJobEnumId": "JOB_EXP_PROD_THRSHLD",
          "systemJobEnumId_op": "equals"
        },
        "fieldList": [ "systemJobEnumId", "runTime", "tempExprId", "parentJobId", "serviceName", "jobId", "jobName", "currentRetryCount", "statusId", "runtimeDataId", "productStoreId", "priority"],
        "noConditionFind": "Y",
        "viewSize": 1,
        "orderBy": "runTime ASC"
      }

      // making separate api calls for draft and pending jobs information and not using promise.all
      // as the api calls are not dependent on each other and also we don't need to take any decision based on success
      // of these api calls together
      try {
        let exportProductThresholdRequests = [];

        exportProductThresholdRequests.push(JobService.fetchJobInformation(JSON.parse(JSON.stringify(payload)), true).catch(error => { return error }))

        exportProductThresholdRequests.push(JobService.fetchJobInformation({
          ...payload,
          "inputFields": {
            "statusId": "SERVICE_PENDING",
            "statusId_op": "equals",
            "productStoreId": this.currentEComStore.productStoreId,
            "productStoreId_op": "equals",
            "systemJobEnumId": "JOB_EXP_PROD_THRSHLD",
            "systemJobEnumId_op": "equals"
          },
          viewSize: 50
        }).catch(error => { return error }))

        let exportProductThresholdResponses = await Promise.allSettled(exportProductThresholdRequests);

        // using specific index as the promise will return the result in the same order as request
        let draftExportProductThresholdResponse = exportProductThresholdResponses[0]
        let pendingExportProductThresholdResponse = exportProductThresholdResponses[1]

        if (draftExportProductThresholdResponse.status === 'fulfilled' && !hasError(draftExportProductThresholdResponse.value) && draftExportProductThresholdResponse.value.data.count) {
          let job = draftExportProductThresholdResponse.value.data.docs[0] // using 0th index as we will only have a single draft data for a job

          this.job = {
            ...job,
            id: job.jobId,
            frequency: job.tempExprId,
            enumId: job.systemJobEnumId,
            status: job.statusId
          }
        } else {
          logger.error('Failed to fetch export product threshold draft job information')
        }

        if (pendingExportProductThresholdResponse.status === 'fulfilled' && !hasError(pendingExportProductThresholdResponse.value) && pendingExportProductThresholdResponse.value.data.count) {
          let jobs = pendingExportProductThresholdResponse.value.data.docs // using 0th index as we will only have a single draft data for a job

          // storing the pending jobs in reorder array as those jobs will always available for reordering
          this.jobsForReorder = jobs.map((job: any) => ({
            ...job,
            id: job.jobId,
            frequency: job.tempExprId,
            enumId: job.systemJobEnumId,
            status: job.statusId
          }))
        } else {
          logger.error('Failed to fetch export product threshold pending jobs information')
        }

        const exportProductThresholdJobs = [...this.jobsForReorder, ...[this.job]]
        const tempExpr = exportProductThresholdJobs.map((job: any) => job.tempExprId)

        await this.store.dispatch('job/fetchJobDescription', [this.jobEnumId]);
        await this.store.dispatch('job/fetchTemporalExpression', tempExpr)
      } catch(err) {
        logger.error('Failed to fetch product threshold jobs information')
      }

      emitter.emit('dismissLoader');
    }
  },
  async ionViewWillEnter() {
    await this.fetchExportThresholdJobs();

    // Finding the runTime of the first job or if there are no pending jobs then assigning current time
    // to initialRunTime and similarly finding last run time to assign a time to the new job
    this.initialRunTime = this.jobsForReorder[0]?.runTime || DateTime.now().toMillis()
    let lastRunTime = this.jobsForReorder[this.jobsForReorder.length - 1]?.runTime || DateTime.now().toMillis()
    const newJob = {
      'jobName': (this as any).jobName,
      'systemJobEnumId': 'JOB_EXP_PROD_THRSHLD',
      'tempExprId': 'EVERYDAY',
      'statusId': 'SERVICE_PENDING',
      'runTime': this.jobsForReorder.length ? lastRunTime + 900000 : this.initialRunTime,
      'jobId': '' // adding jobId as to identify the new job to be scheduled
    }

    this.jobsForReorder?.push(newJob)

    // dispatching temp expr action to fetch the description for EVERYDAY as if in some case we don't get
    // the desc for temp expr and thus have an empty field
    await this.store.dispatch('job/fetchTemporalExpression', ['EVERYDAY'])

    // maintaining the initial order of jobs to take the diff from the updated seq after reordering
    this.initialJobsOrder = JSON.parse(JSON.stringify(this.jobsForReorder))
    this.updatedJobsOrder = [ newJob ]
  },
  ionViewDidLeave() {
    // TODO: remove this initialization from the hook and update the code accordingly
    // Done this as currently the component is not being unmounted when changing the route as there exist
    // a connection between parent and child and ionViewWillEnter hook does not reinitialize the
    // local data property
    this.jobName = ''
    this.jobsForReorder = []
    this.initialJobsOrder = []
    this.initialRunTime = ''
    this.updatedJobsOrder = []
    this.failedJobs = []
    this.successJobs = []
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    return {
      arrowForwardOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      copyOutline,
      optionsOutline,
      router,
      saveOutline,
      shirtOutline,
      store,
      timerOutline,
      timeOutline
    }
  }
});
</script>

<style scoped>
ion-card-header {
  display: flex;
  justify-content: space-between;
}

h2 {
  font-size: 18px;
  margin-left: 10px;
}
@media (min-width: 991px) {
  ion-content > div:first-child {
    display: grid;
    grid-template-columns: 600px 50ch;
    gap: var(--spacer-xl);
    width: max-content;
    margin: auto;
  }

  h2 {
    font-size: revert;
    text-align: center;
  }

  aside {
    position: sticky;
    top: var(--spacer-sm);
    height: max-content;
  }

  .action {
    position: fixed;
    z-index: 3;
    bottom: 10%;
    left: 50%;
    transform: translate(-50%, 0);
  }
}

ion-modal {
  --width: 290px;
  --height: 385px;
  --border-radius: 8px;
}
</style>