<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/select-product"/>
        <ion-title>{{ $t("Schedule new threshold") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="find">
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
              <ion-label>{{ $t("Rule name") }}</ion-label>
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

        <main class="main">
          <ion-reorder-group @ionItemReorder="doReorder($event)" disabled="false">
            <ion-card v-for="job in jobsForReorder" :key="job.jobId" v-show="job.statusId === 'SERVICE_PENDING'">
              <ion-item>
                <ion-label>{{ job.jobName }}</ion-label>
                <ion-reorder slot="end"></ion-reorder>
              </ion-item>
              <ion-card-header>
                <ion-card-title>{{ getEnumDescription(job.systemJobEnumId) ? getEnumDescription(job.systemJobEnumId) : job.systemJobEnumId }}</ion-card-title>
                <p v-if="failedJobs.includes(job.jobId)">{{ $t('Failed') }}</p>
                <p v-if="successJobs.includes(job.jobId)">{{ $t('Success') }}</p>
              </ion-card-header>

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
          </ion-reorder-group>
        </main>
      </div>

      <div class="action desktop-only">
        <ion-button @click="saveThresholdRule()">
          <ion-icon slot="start" :icon="saveOutline" />
          {{ $t("Schedule Job") }}
        </ion-button>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="mobile-only">
        <ion-fab-button>
          <ion-icon :icon="arrowForwardOutline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { arrowForwardOutline, copyOutline, optionsOutline, saveOutline, shirtOutline, timerOutline, timeOutline } from 'ionicons/icons'
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
  IonToolbar,
  modalController,
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { hasError, showToast } from '@/utils';
import { translate } from '@/i18n';
import { JobService } from '@/services/JobService';
import { DateTime } from 'luxon';
import { mapGetters, useStore } from 'vuex';
import { ProductService } from '@/services/ProductService';
import { useRouter } from 'vue-router';

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
      successJobs: [] as any
    }
  },
  computed: {
    ...mapGetters({
      currentEComStore: 'user/getCurrentEComStore',
      shopifyConfig: 'util/getShopifyConfig',
      jobs: 'job/getJobs',
      getJob: 'job/getJob',
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
    updateRunTime(ev: CustomEvent, timeDiff = 900000) {
      const changedDateTime = DateTime.fromISO(ev['detail'].value).toMillis()
      const previousSeq = JSON.parse(JSON.stringify(this.jobsForReorder))

      if (changedDateTime === previousSeq[0].runTime) return;

      let threshold = 0;
      this.jobsForReorder.map((job: any) => {
        job.runTime = changedDateTime + threshold;
        threshold += timeDiff
      })
      const updatedSeq = JSON.parse(JSON.stringify(this.jobsForReorder))
      this.initialRunTime = this.jobsForReorder.find((job: any) => job.statusId !== 'SERVICE_DRAFT').runTime

      let diffSeq = this.findJobDiff(previousSeq, updatedSeq)

      const updatedRunTime = updatedSeq.map((job: any) => job.runTime)
      Object.keys(diffSeq).map((key: any) => {
        diffSeq[key].runTime = updatedRunTime[key]
      })

      diffSeq = Object.keys(diffSeq).map((key) => diffSeq[key])

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
      this.isServiceScheduling = true;
      const solrQuery = this.query

      const jobRunTime = this.updatedJobsOrder.find((job: any) => job.isNew)?.runTime
      const jobsToUpdate = this.updatedJobsOrder.filter((job: any) => !job.isNew)

      await Promise.all(jobsToUpdate.map(async (job: any) => {
        const resp = await JobService.updateJob(job)
        if (!resp) {
          this.failedJobs.push(job.jobId)
        } else if (resp?.status === 200) {
          this.successJobs.push(job.jobId)
        }
        return resp
      }))

      this.store.dispatch('job/fetchJobs', {
        inputFields: {
          'systemJobEnumId': this.jobEnumId,
          'systemJobEnumId_op': 'equals'
        }
      })

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
          await this.scheduleService(searchPreferenceId, this.threshold, jobRunTime)
        } else {
          showToast(translate('Something went wrong'))
        }
      } catch (err) {
        console.error(err)
        showToast(translate('Something went wrong'))
      }
      this.isServiceScheduling = false

      if (!this.failedJobs.length) {
        this.store.commit('job/clearJobState')
        this.router.push('/select-product')
      }
    },
    async scheduleService(searchPreferenceId: string, threshold: string, runTime?: string) {
      let job = this.jobs[this.jobEnumId]
      job = job?.find((job: any) => job.statusId === 'SERVICE_DRAFT')
      const productStoreId = this.currentEComStore.productStoreId
      let shopifyConfigId = this.shopifyConfig[productStoreId]
      let facilityId = this.facilitiesByProductStore[productStoreId]
      let resp = '' as any;
      job.jobId = 'newJob'

      if (!job) {
        await this.store.dispatch('job/fetchJobs', {
          inputFields: {
            statusId: "SERVICE_DRAFT",
            statusId_op: "equals",
            systemJobEnumId: this.jobEnumId,
          },
          viewSize: 1
        })
        job = this.jobs[this.jobEnumId]
      }

      if(!shopifyConfigId) {
        const resp = await this.store.dispatch('util/getShopifyConfig', productStoreId)
        shopifyConfigId = resp[productStoreId]
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

      const payload = job ? {
        'JOB_NAME': this.jobName ? this.jobName : this.userProfile.partyName,
        'SERVICE_NAME': job.serviceName,
        'SERVICE_COUNT': '0',
        'jobFields': {
          'productStoreId': productStoreId,
          'systemJobEnumId': job.systemJobEnumId,
          'tempExprId': 'EVERYDAY',
          'maxRecurrenceCount': '-1',
          'parentJobId': job.parentJobId,
          'runAsUser': 'system', // default system, but empty in run now
          'recurrenceTimeZone': DateTime.now().zoneName
        },
        'shopifyConfigId': shopifyConfigId,
        'statusId': "SERVICE_PENDING",
        'systemJobEnumId': job.systemJobEnumId,
        searchPreferenceId,
        threshold,
        facilityId
      } as any : {}

      // checking if the runtimeData has productStoreId, and if present then adding it on root level
      job?.runtimeData?.productStoreId?.length >= 0 && (payload['productStoreId'] = productStoreId)
      job?.priority && (payload['SERVICE_PRIORITY'] = job.priority.toString())
      runTime && (job['runTime'] = runTime)

      try {
        resp = await JobService.scheduleJob({ ...job.runtimeData, ...payload });
        if (resp.status == 200 && !hasError(resp)) {
          showToast(translate('Service has been scheduled'))
          this.successJobs.push(job.jobId)
        } else {
          showToast(translate('Something went wrong'))
          this.failedJobs.push(job.jobId)
        }
      } catch (err) {
        showToast(translate('Something went wrong'))
        this.failedJobs.push(job.jobId)
        console.error(err)
      }
      return resp;
    }
  },
  async mounted() {
    const jobEnums = JSON.parse(process.env?.VUE_APP_JOB_ENUMS as string) as any
    await this.store.dispatch('job/fetchJobs', {
      inputFields: {
        systemJobEnumId: jobEnums,
        systemJobEnumId_op: "in"
      },
      viewSize: 20
    })
    this.jobsForReorder = this.getJob(this.jobEnumId).filter((job: any) => job.statusId === 'SERVICE_PENDING')
    this.initialRunTime = this.jobsForReorder[0]?.runTime || DateTime.now().toMillis()
    let lastRunTime = this.jobsForReorder[this.jobsForReorder.length - 1]?.runTime || DateTime.now().toMillis()
    this.jobsForReorder?.push({
      'jobName': (this as any).jobName,
      'systemJobEnumId': 'JOB_EXP_PROD_THRSHLD',
      'tempExprId': 'EVERYDAY',
      'statusId': 'SERVICE_PENDING',
      'isNew': true,
      'runTime': lastRunTime + 900000,
      'jobId': 'newJob'
    })
    await this.store.dispatch('job/fetchTemporalExpression', ['EVERYDAY'])
    this.initialJobsOrder = JSON.parse(JSON.stringify(this.jobsForReorder))
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    return {
      arrowForwardOutline,
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
.actions {
  display: flex;
  justify-content: space-between;
}

aside {
  position: sticky;
  top: var(--spacer-lg);
}

.find {
  padding: var( --spacer-lg);
  gap: var(--spacer-lg);
}

ion-list-header > div {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

@media (min-width: 991px) {
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
  --height: 382px;
  --border-radius: 8px;
}
</style>
