<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" />
        <ion-title>{{ $t("Schedule new threshold") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="find">
        <aside class="filters">
          <ion-list>
            <ion-list-header>{{ $t("Info") }}</ion-list-header>
            <ion-item>
              <ion-icon :icon="shirtOutline" slot="start" />
              <ion-label>{{ totalSKUs }} {{ $t('SKUs') }}</ion-label>
            </ion-item>
            <ion-item>
              <ion-icon :icon="optionsOutline" slot="start" />
              <ion-label>{{ threshold }} {{ $t('threshold') }}</ion-label>
            </ion-item>

            <ion-item>
              <ion-label>{{ $t("Rule name") }}</ion-label>
              <ion-input :placeholder="$t('rule name')" v-model="jobName"/>
            </ion-item>
          </ion-list>
        </aside>

        <main class="main">
          <ion-reorder-group @ionItemReorder="doReorder($event)" disabled="false">
            <ion-card v-for="job in getJob(jobEnumId)" :key="job.jobId" v-show="job.statusId === 'SERVICE_PENDING'">
              <ion-item>
                <ion-reorder slot="end"></ion-reorder>
              </ion-item>
              <ion-card-header>
                <ion-card-title>{{ getEnumDescription(job.systemJobEnumId) ? getEnumDescription(job.systemJobEnumId) : job.systemJobEnumId }}</ion-card-title>
              </ion-card-header>

              <ion-item>
                <ion-icon slot="start" :icon="timeOutline" />
                <ion-label class="ion-text-wrap">{{ job.runTime ? getTime(job.runTime) : "-"  }}</ion-label>
                <ion-badge v-if="job.runTime" color="dark">{{ timeTillJob(job.runTime)}}</ion-badge>
              </ion-item>

              <ion-item>
                <ion-icon slot="start" :icon="timerOutline" />
                <ion-label class="ion-text-wrap">{{ job.tempExprId ? temporalExpr(job.tempExprId)?.description : "🙃"  }}</ion-label>
              </ion-item>

              <div class="actions">
                <div>
                  <ion-button fill="clear" @click.stop="skipJob(job)">{{ $t("Skip") }}</ion-button>
                  <ion-button color="danger" fill="clear" @click.stop="cancelJob(job)">{{ $t("Cancel") }}</ion-button>
                </div>
                <div>
                  <ion-button fill="clear" color="medium" @click.stop="copyJobInformation(job)">
                    <ion-icon slot="icon-only" :icon="copyOutline" />
                  </ion-button>
                  <ion-button fill="clear" color="medium" slot="end" @click.stop="viewJobHistory(job)">
                    <ion-icon slot="icon-only" :icon="timeOutline" />
                  </ion-button>
                </div>
              </div>
            </ion-card>
          </ion-reorder-group>
        </main>
      </div>

      <div class="action desktop-only">
        <ion-button>
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
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
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
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
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
      isServiceScheduling: false
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
      getStatusDesc: 'util/getStatusDesc',
      temporalExpr: 'job/getTemporalExpr',
      getEnumDescription: 'job/getEnumDescription'
    })
  },
  methods: {
    closeModal() {
      modalController.dismiss({ dismissed: true });
    },
    doReorder(event: CustomEvent) {
      let jobs = this.getJob[this.jobEnumId]
      // const jobRunTime = jobs.map((job: any) => job.runTime)
      // const updatedSeq = event.detail.complete(JSON.parse(JSON.stringify(jobs)));

      event.detail.complete(jobs);

      // const diffSeq: any = Object.keys(jobs).reduce((diff, key) => {
      //   if (updatedSeq[key].jobId === jobs[key].jobId) return diff
      //   return {
      //     ...diff,
      //     [key]: updatedSeq[key]
      //   }
      // }, {})

      // Object.keys(diffSeq).map((key: any) => {
      //   diffSeq[key].runTime = jobRunTime[key]
      // })

      // jobs = updatedSeq
    },
    async displayJobsInformation() {
      const jobEnums = JSON.parse(process.env?.VUE_APP_JOB_ENUMS as string) as any
      console.log(jobEnums)
      await this.store.dispatch('job/fetchJobs', {
        inputFields: {
          systemJobEnumId: jobEnums,
          systemJobEnumId_op: "in"
        },
        viewSize: 50
      })
    },
    getDate (runTime: any) {
      return DateTime.fromMillis(runTime).toLocaleString(DateTime.DATE_MED);
    },
    getTime (runTime: any) {
      return DateTime.fromMillis(runTime).toLocaleString(DateTime.TIME_SIMPLE);
    },
    timeTillJob (time: any) {
      const timeDiff = DateTime.fromMillis(time).diff(DateTime.local());
      return DateTime.local().plus(timeDiff).toRelative();
    },
    async saveThresholdRule() {
      this.isServiceScheduling = true;
      const solrQuery = this.query

      this.displayJobsInformation();

      // // re-initialized params object from query as there is no need for grouping or pagination when storing the query
      // solrQuery.json.params = {
      //   "q.op": "AND"
      // }
      // // made the query to default (*:*) before storing, as the threshold will be set for all the products those
      // // are fullfilling the filters condition
      // solrQuery.json['query'] = "*:*"

      // try {
      //   const resp = await ProductService.createSearchPreference({
      //     searchPrefValue: JSON.stringify(solrQuery)
      //   });

      //   if (resp.status == 200 && resp?.data?.searchPrefId) {
      //     const searchPreferenceId = resp.data.searchPrefId;
      //     await this.scheduleService(searchPreferenceId, this.threshold)
      //   } else {
      //     showToast(translate('Something went wrong'))
      //   }
      // } catch (err) {
      //   console.error(err)
      //   showToast(translate('Something went wrong'))
      // }
      this.isServiceScheduling = false
    },
    async scheduleService(searchPreferenceId: string, threshold: string) {
      let job = this.jobs[this.jobEnumId]
      const productStoreId = this.currentEComStore.productStoreId
      let shopifyConfigId = this.shopifyConfig[productStoreId]
      let facilityId = this.facilitiesByProductStore[productStoreId]
      let resp = '' as any;

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
        'JOB_NAME': this.jobName ? this.jobName : job.jobName,
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

      try {
        resp = await JobService.scheduleJob({ ...job.runtimeData, ...payload });
        if (resp.status == 200 && !hasError(resp)) {
          showToast(translate('Service has been scheduled'))
          this.closeModal();
        } else {
          showToast(translate('Something went wrong'))
        }
      } catch (err) {
        showToast(translate('Something went wrong'))
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
  },
  setup() {
    const store = useStore();

    return {
      arrowForwardOutline,
      copyOutline,
      optionsOutline,
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
</style>
