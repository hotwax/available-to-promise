<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ $t("Threshold updates") }}</ion-title>
      </ion-toolbar>

      <ion-toolbar>
        <ion-segment v-model="segmentSelected" @ionChange="segmentChanged">
          <ion-segment-button value="pending">
            <ion-label>{{ $t("Pending") }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="running">
            <ion-label>{{ $t("Running") }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="history">
            <ion-label>{{ $t("History") }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main>
        <section v-if="segmentSelected === 'pending'">
          <!-- Empty state -->
          <div v-if="pendingJobs?.length === 0">
            <p class="ion-text-center">{{ $t("There are no jobs pending right now")}}</p>
            <div class="ion-text-center">
              <ion-button fill="outline" @click="refreshJobs()">
                {{ $t('retry') }}
                <ion-spinner v-if="isRetrying" name="crescent" />
              </ion-button>
            </div>
          </div>

          <div v-else>
            <ion-card v-for="job in pendingJobs" :key="job.jobId" @click="viewJobConfiguration(job)" :button="isDesktop">
              <ion-card-header>
                <ion-card-title>{{ getEnumName(job.systemJobEnumId) }}</ion-card-title>
                <ion-badge v-if="job.runTime" color="dark">{{ timeFromNow(job.runTime)}}</ion-badge>
              </ion-card-header>

              <ion-item lines="none">
                <ion-label class="ion-text-wrap">
                  <p>{{ job.jobName }}</p>
                  <p>{{ getEnumDescription(job.systemJobEnumId) }}</p>
                </ion-label>
              </ion-item>

              <ion-item v-if="job.runtimeData && job.runtimeData.threshold !== null && job.runtimeData.threshold !== undefined">
                <ion-icon slot="start" :icon="optionsOutline"/>
                <ion-label class="ion-text-wrap">{{ job.runtimeData.threshold }} {{ $t('threshold') }}</ion-label>
              </ion-item>

              <ion-item v-if="job.runtimeData && job.runtimeData.searchPreferenceId">
                <ion-icon slot="start" :icon="checkmarkCircleOutline" />
                <ion-label class="ion-text-wrap">{{ getTags(job.runtimeData.searchPreferenceId, "included") ? getTags(job.runtimeData.searchPreferenceId, "included") : "-" }}</ion-label>
              </ion-item>

              <ion-item v-if="job.runtimeData && job.runtimeData.searchPreferenceId">
                <ion-icon slot="start" :icon="closeCircleOutline" />
                <ion-label class="ion-text-wrap">{{ getTags(job.runtimeData.searchPreferenceId, "excluded") ? getTags(job.runtimeData.searchPreferenceId, "excluded") : "-" }}</ion-label>
              </ion-item>

              <ion-item>
                <ion-icon slot="start" :icon="timeOutline" />
                <ion-label class="ion-text-wrap">{{ job.runTime ? getTime(job.runTime) : "-"  }}</ion-label>
              </ion-item>

              <ion-item lines="full">
                <ion-icon slot="start" :icon="timerOutline" />
                <ion-label class="ion-text-wrap">{{ job.tempExprId ? temporalExpr(job.tempExprId)?.description : "🙃"  }}</ion-label>
              </ion-item>

              <div class="actions">
                <div>
                  <ion-button fill="clear" @click.stop="skipJob(job)">{{ $t("Skip") }}</ion-button>
                  <ion-button color="danger" fill="clear" @click.stop="cancelJob(job)">{{ $t("Cancel") }}</ion-button>
                </div>
                <div>
                  <ion-button fill="clear" color="medium" slot="end" @click.stop="copyJobInformation(job)">
                    <ion-icon slot="icon-only" :icon="copyOutline" />
                  </ion-button>
                  <ion-button fill="clear" color="medium" slot="end" @click.stop="viewJobHistory(job)">
                    <ion-icon slot="icon-only" :icon="timeOutline" />
                  </ion-button>
                </div>
              </div> 
            </ion-card>
            <ion-refresher slot="fixed" @ionRefresh="refreshJobs($event)">
              <ion-refresher-content pullingIcon="crescent" refreshingSpinner="crescent" />
            </ion-refresher>
            <ion-infinite-scroll @ionInfinite="loadMorePendingJobs($event)" threshold="100px" :disabled="!isPendingJobsScrollable">
              <ion-infinite-scroll-content loading-spinner="crescent" :loading-text="$t('Loading')"/>
            </ion-infinite-scroll>
          </div>
        </section>

        <section v-if="segmentSelected === 'running'">
          <!-- Empty state -->
          <div v-if="runningJobs?.length === 0">
            <p class="ion-text-center">{{ $t("There are no jobs running right now")}}</p>
            <div class="ion-text-center">
              <ion-button fill="outline" @click="refreshJobs()">
                {{ $t('retry') }}
                <ion-spinner v-if="isRetrying" name="crescent" />
              </ion-button>
            </div>
          </div>

          <div v-else>
            <ion-card v-for="job in runningJobs" :key="job.jobId">
              <ion-card-header>
                <div>
                  <ion-card-subtitle class="overline">{{ job.parentJobId }}</ion-card-subtitle>
                  <ion-card-title>{{ getEnumName(job.systemJobEnumId) }}</ion-card-title>
                </div>
                <ion-badge color="dark">Running</ion-badge>
              </ion-card-header>

              <ion-item lines="none">
                <ion-label class="ion-text-wrap">
                  <p>{{ job.jobName }}</p>
                  <p>{{ getEnumDescription(job.systemJobEnumId) }}</p>
                </ion-label>
              </ion-item>
              <ion-item v-if="job.runtimeData && job.runtimeData.threshold !== null && job.runtimeData.threshold !== undefined">
                <ion-icon slot="start" :icon="optionsOutline"/>
                <ion-label class="ion-text-wrap">{{ job.runtimeData.threshold }} {{ $t('threshold') }}</ion-label>
              </ion-item>

              <ion-item v-if="job.runtimeData && job.runtimeData.searchPreferenceId">
                <ion-icon slot="start" :icon="checkmarkCircleOutline" />
                <ion-label class="ion-text-wrap">{{ getTags(job.runtimeData.searchPreferenceId, "included") ? getTags(job.runtimeData.searchPreferenceId, "included") : "-" }}</ion-label>
              </ion-item>

              <ion-item v-if="job.runtimeData && job.runtimeData.searchPreferenceId">
                <ion-icon slot="start" :icon="closeCircleOutline" />
                <ion-label class="ion-text-wrap">{{ getTags(job.runtimeData.searchPreferenceId, "excluded") ? getTags(job.runtimeData.searchPreferenceId, "excluded") : "-" }}</ion-label>
              </ion-item>

              <ion-item>
                <ion-icon slot="start" :icon="timeOutline" />
                <ion-label class="ion-text-wrap">{{ job.runTime ? getTime(job.runTime) : "-"  }}</ion-label>
              </ion-item>

              <ion-item lines="full">
                <ion-icon slot="start" :icon="timerOutline" />
                <ion-label class="ion-text-wrap">{{ job.tempExprId ? temporalExpr(job.tempExprId)?.description : "🙃"  }}</ion-label>
              </ion-item>

              <div class="actions">
                <div></div>
                <div>
                  <ion-button fill="clear" color="medium" slot="end" @click.stop="copyJobInformation(job)">
                    <ion-icon slot="icon-only" :icon="copyOutline" />
                  </ion-button>
                  <ion-button fill="clear" color="medium" slot="end" @click.stop="viewJobHistory(job)">
                    <ion-icon slot="icon-only" :icon="timeOutline" />
                  </ion-button>
                </div>
              </div>
            </ion-card>

            <ion-refresher slot="fixed" @ionRefresh="refreshJobs($event)">
              <ion-refresher-content pullingIcon="crescent" refreshingSpinner="crescent" />
            </ion-refresher>
            <ion-infinite-scroll @ionInfinite="loadMoreRunningJobs($event)" threshold="100px" :disabled="!isRunningJobsScrollable">
              <ion-infinite-scroll-content loading-spinner="crescent" :loading-text="$t('Loading')"/>
            </ion-infinite-scroll>
          </div> 
        </section>

        <section v-if="segmentSelected === 'history'">
          <!-- Empty state -->
          <div v-if="jobHistory?.length === 0">
            <p class="ion-text-center">{{ $t("No jobs have run yet")}}</p>
            <div class="ion-text-center">
              <ion-button fill="outline" @click="refreshJobs()">
                {{ $t('retry') }}
                <ion-spinner v-if="isRetrying" name="crescent" />
              </ion-button>
            </div>
          </div>

          <div v-else>
          <ion-card v-for="job in jobHistory" :key="job.jobId">
            <ion-card-header>
              <div>
                <ion-card-subtitle class="overline">{{ job.parentJobId }}</ion-card-subtitle>
                <ion-card-title>{{ getEnumName(job.systemJobEnumId) }}</ion-card-title>
              </div>
              <div>
                <ion-badge v-if="job.cancelDateTime || job.finishDateTime" color="dark">{{ job.statusId == "SERVICE_CANCELLED" || job.statusId == "SERVICE_CRASHED" ?  timeFromNow(job.cancelDateTime) : timeFromNow(job.finishDateTime) }}</ion-badge>
                <ion-badge v-if="job.statusId" :color="job.statusId === 'SERVICE_FINISHED' ? 'success' : 'danger'">{{ job.statusDesc }}</ion-badge>
              </div>
            </ion-card-header>

            <ion-item lines="none">
              <ion-label class="ion-text-wrap">
                <p>{{ job.jobName }}</p>
                <p>{{ getEnumDescription(job.systemJobEnumId) }}</p>
              </ion-label>
            </ion-item>
            <ion-item v-if="job.runtimeData && job.runtimeData.threshold !== null && job.runtimeData.threshold !== undefined">
              <ion-icon slot="start" :icon="optionsOutline"/>
              <ion-label class="ion-text-wrap">{{ job.runtimeData.threshold }} {{ $t('threshold') }}</ion-label>
            </ion-item>

            <ion-item v-if="job.runtimeData && job.runtimeData.searchPreferenceId">
              <ion-icon slot="start" :icon="checkmarkCircleOutline" />
              <ion-label class="ion-text-wrap">{{ getTags(job.runtimeData.searchPreferenceId, "included") ? getTags(job.runtimeData.searchPreferenceId, "included") : "-" }}</ion-label>
            </ion-item>

            <ion-item v-if="job.runtimeData && job.runtimeData.searchPreferenceId">
              <ion-icon slot="start" :icon="closeCircleOutline" />
              <ion-label class="ion-text-wrap">{{ getTags(job.runtimeData.searchPreferenceId, "excluded") ? getTags(job.runtimeData.searchPreferenceId, "excluded") : "-" }}</ion-label>
            </ion-item>

            <ion-item>
              <ion-icon slot="start" :icon="timeOutline" />
              <ion-label class="ion-text-wrap">{{ job.runTime ? getTime(job.runTime) : "-"  }}</ion-label>
              <ion-note slot="end">{{ job.statusId == "SERVICE_CANCELLED" || job.statusId == "SERVICE_CRASHED" ? getJobExecutionTime(job.startDateTime, job.cancelDateTime) : getJobExecutionTime(job.startDateTime, job.finishDateTime) }}</ion-note>
            </ion-item>

            <ion-item lines="full">
              <ion-icon slot="start" :icon="timerOutline" />
              <ion-label class="ion-text-wrap">{{ job.tempExprId ? temporalExpr(job.tempExprId)?.description : "🙃"  }}</ion-label>
            </ion-item>

            <div class="actions">
              <div></div>
              <div>
                <ion-button fill="clear" color="medium" slot="end" @click.stop="copyJobInformation(job)">
                  <ion-icon slot="icon-only" :icon="copyOutline" />
                </ion-button>
                <ion-button fill="clear" color="medium" slot="end" @click.stop="viewJobHistory(job)">
                  <ion-icon slot="icon-only" :icon="timeOutline" />
                </ion-button>
              </div>
            </div>
          </ion-card>

          <ion-refresher slot="fixed" @ionRefresh="refreshJobs($event)">
            <ion-refresher-content pullingIcon="crescent" refreshingSpinner="crescent" />
          </ion-refresher>
          <ion-infinite-scroll @ionInfinite="loadMoreJobHistory($event)" threshold="100px" :disabled="!isHistoryJobsScrollable">
            <ion-infinite-scroll-content loading-spinner="crescent" :loading-text="$t('Loading')"/>
          </ion-infinite-scroll>
          </div>          
        </section>

        <aside class="desktop-only" v-show="segmentSelected === 'pending' && currentJob">
          <JobConfiguration :title="title" :job="currentJob" :productCount="productCount" :status="currentJobStatus" :type="freqType" :key="currentJob"/>
        </aside>
      </main>
    </ion-content>
  </ion-page>
</template>
<script lang="ts">
import { mapGetters, useStore } from 'vuex'
import { defineComponent, ref } from "vue";
import {
  IonBadge,
  IonButton,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonMenuButton,
  IonNote,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonToolbar,
  IonTitle,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  alertController,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  isPlatform,
  modalController,
  createAnimation
} from "@ionic/vue";
import JobConfiguration from '@/components/JobConfiguration.vue'
import { copyOutline, closeCircleOutline, checkmarkCircleOutline, optionsOutline, timeOutline, timerOutline } from "ionicons/icons";

import { Plugins } from '@capacitor/core';
import { hasError, showToast } from '@/utils'
import JobHistoryModal from '@/components/JobHistoryModal.vue';
import { DateTime } from 'luxon';
import { ProductService } from '@/services/ProductService';

export default defineComponent({
  name: "ThresholdUpdates",
  components: {
    IonBadge,
    IonButton,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonMenuButton,
    IonNote,
    IonPage,
    IonRefresher,
    IonRefresherContent,
    IonToolbar,
    IonTitle,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSegment,
    IonSegmentButton,
    IonSpinner,
    JobConfiguration
  },
  data() {
    return {
      jobFrequencyType: JSON.parse(process.env?.VUE_APP_JOB_FREQUENCY_TYPE as string) as any,
      jobEnums: [
        ...JSON.parse(process.env?.VUE_APP_JOB_ENUMS as string) as any
      ],
      currentJob: '' as any,
      title: '',
      currentJobStatus: '',
      freqType: '' as any,
      isJobDetailAnimationCompleted: false,
      isDesktop: isPlatform('desktop'),
      isRetrying: false,
      productCount: 0
    }
  },
  computed: {
    ...mapGetters({
      jobHistory: 'job/getJobHistory',
      pendingJobs: 'job/getPendingJobs',
      runningJobs: 'job/getRunningJobs',
      temporalExpr: 'job/getTemporalExpr',
      getTags: 'job/getTags',
      getEnumDescription: 'job/getEnumDescription',
      getEnumName: 'job/getEnumName',
      getCurrentEComStore:'user/getCurrentEComStore',
      isPendingJobsScrollable: 'job/isPendingJobsScrollable',
      isRunningJobsScrollable: 'job/isRunningJobsScrollable',
      isHistoryJobsScrollable: 'job/isHistoryJobsScrollable',
      products: 'product/getProducts',
      query: 'job/getThresholdRule'
    })
  },
  mounted(){
    this.store.dispatch('util/getServiceStatusDesc')
  },
  methods: {
    getJobExecutionTime(startTime: any, endTime: any){
      if (startTime && endTime) {
        const timeDiff = DateTime.fromMillis(endTime).diff( DateTime.fromMillis(startTime))
        const hours =  timeDiff.hours
        const minutes = timeDiff.minutes
        const seconds =  timeDiff
        let format = ""
        if(hours) format += "hh 'hr' "
        if(minutes) format += "mm 'min' "
        if(seconds) format += "ss 'sec'"
        if (format) return timeDiff.toFormat(format);
      }
      return
    },
    async copyJobInformation(job: any) {
      const { Clipboard } = Plugins;
      const jobDetails = `jobId: ${job.jobId}, jobName: ${this.getEnumName(job.systemJobEnumId)}, jobDescription: ${this.getEnumDescription(job.systemJobEnumId)}`;

      await Clipboard.write({
        string: jobDetails
      }).then(() => {
        showToast(this.$t("Copied job details to clipboard"));
      })
    },
    async viewJobHistory(job: any) {
      const jobHistoryModal = await modalController.create({
        component: JobHistoryModal,
        componentProps: { currentJob: job }
      });
      return jobHistoryModal.present();
    },
    getTime (time: any) {
      return DateTime.fromMillis(time).toLocaleString(DateTime.TIME_SIMPLE);
    },
    timeFromNow (time: any) {
      const timeDiff = DateTime.fromMillis(time).diff(DateTime.local());
      return DateTime.local().plus(timeDiff).toRelative();
    },
    async loadMoreJobHistory(event: any){
      this.getJobHistory(
        undefined,
        Math.ceil(this.jobHistory.length / (process.env.VUE_APP_VIEW_SIZE as any)).toString()
      ).then(() => {
        event.target.complete();
      })
    },
    async loadMoreRunningJobs(event: any){
      this.getRunningJobs(
        undefined,
        Math.ceil(this.runningJobs.length / (process.env.VUE_APP_VIEW_SIZE as any)).toString()
      ).then(() => {
        event.target.complete();
      })
    },
    async loadMorePendingJobs (event: any) {
      this.getPendingJobs(
        undefined,
        Math.ceil(this.pendingJobs.length / (process.env.VUE_APP_VIEW_SIZE as any)).toString()
      ).then(() => {
        event.target.complete();
      })
    },
    async refreshJobs(event: any) {
      this.isRetrying = true;
      if(this.segmentSelected === 'pending') {
        this.store.dispatch('job/fetchPendingJobs', {eComStoreId: this.getCurrentEComStore.productStoreId, viewSize:process.env.VUE_APP_VIEW_SIZE, viewIndex:0, jobEnums: this.jobEnums}).then(() => {
          if(event) event.target.complete();
          this.isRetrying = false;
        });
      } else if(this.segmentSelected === 'running') {
        this.store.dispatch('job/fetchRunningJobs', {eComStoreId: this.getCurrentEComStore.productStoreId, viewSize:process.env.VUE_APP_VIEW_SIZE, viewIndex:0, jobEnums: this.jobEnums}).then(() => {
          if(event) event.target.complete();
          this.isRetrying = false;
        });
      } else {
        this.store.dispatch('job/fetchJobHistory', {eComStoreId: this.getCurrentEComStore.productStoreId, viewSize:process.env.VUE_APP_VIEW_SIZE, viewIndex:0, jobEnums: this.jobEnums}).then(() => {
          if(event) event.target.complete();
          this.isRetrying = false;
        });
      }
    },
    segmentChanged (e: CustomEvent) {
      this.segmentSelected = e.detail.value
      this.segmentSelected === 'pending' ? this.store.dispatch('job/fetchPendingJobs', {eComStoreId: this.getCurrentEComStore.productStoreId, viewSize:process.env.VUE_APP_VIEW_SIZE, viewIndex:0, jobEnums: this.jobEnums}) : 
      this.segmentSelected === 'running' ? this.store.dispatch('job/fetchRunningJobs', {eComStoreId: this.getCurrentEComStore.productStoreId, viewSize:process.env.VUE_APP_VIEW_SIZE, viewIndex:0, jobEnums: this.jobEnums}) :
      this.store.dispatch('job/fetchJobHistory', {eComStoreId: this.getCurrentEComStore.productStoreId, viewSize:process.env.VUE_APP_VIEW_SIZE, viewIndex:0, jobEnums: this.jobEnums});
    },
    async skipJob (job: any) {
      const alert = await alertController
        .create({
          header: this.$t('Skip job'),
          message: this.$t('Skipping will run this job at the next occurrence based on the temporal expression.'),
          buttons: [
            {
              text: this.$t("Don't skip"),
              role: 'cancel',
            },
            {
              text: this.$t('Skip'),
              handler: async () => {
                await this.store.dispatch('job/skipJob', job);
                await this.store.dispatch('job/fetchPendingJobs', {eComStoreId: this.getCurrentEComStore.productStoreId, viewIndex: 0, jobEnums: this.jobEnums})
              },
            }
          ]
        });
      return alert.present();
    },
    async getPendingJobs(vSize: any, vIndex: any) {
      const viewSize = vSize ? vSize : process.env.VUE_APP_VIEW_SIZE;
      const viewIndex = vIndex ? vIndex : 0;
      await this.store.dispatch('job/fetchPendingJobs', {eComStoreId: this.getCurrentEComStore.productStoreId, viewSize, viewIndex, jobEnums: this.jobEnums});
    },
    async getRunningJobs(vSize: any, vIndex: any) {
      const viewSize = vSize ? vSize : process.env.VUE_APP_VIEW_SIZE;
      const viewIndex = vIndex ? vIndex : 0;
      await this.store.dispatch('job/fetchRunningJobs', {eComStoreId: this.getCurrentEComStore.productStoreId, viewSize, viewIndex, jobEnums: this.jobEnums});
    },
    async getJobHistory(vSize: any, vIndex: any) {
      const viewSize = vSize ? vSize : process.env.VUE_APP_VIEW_SIZE;
      const viewIndex = vIndex ? vIndex : 0;
      await this.store.dispatch('job/fetchJobHistory', {eComStoreId: this.getCurrentEComStore.productStoreId, viewSize, viewIndex, jobEnums: this.jobEnums});
    },
    async cancelJob(job: any){
      const alert = await alertController
        .create({
          header: this.$t('Cancel job'),
          message: this.$t('Canceling this job will cancel this occurrence and all following occurrences. This job will have to be re-enabled manually to run it again.'),
          buttons: [
            {
              text: this.$t("DON'T CANCEL"),
              role: 'cancel',
            },
            {
              text: this.$t("CANCEL"),
              handler: async () => {
                await this.store.dispatch('job/cancelJob', job);
                await this.store.dispatch('job/fetchPendingJobs', {eComStoreId: this.getCurrentEComStore.productStoreId, viewIndex: 0, jobEnums: this.jobEnums});
              },
            }
          ],
        });

       return alert.present();
    },    
    viewJobConfiguration(job: any) {
      if(!this.isDesktop) {
        return;
      }
      // For Jobs like Import jobs, we will not have any rule setup
      if (job.runtimeData?.searchPreferenceId) {
        const query = JSON.parse(JSON.stringify(this.query(job.runtimeData.searchPreferenceId)))
        this.getProductCount(query);
      }
      this.currentJob = {id: job.jobId, ...job}
      this.title = this.getEnumName(job.systemJobEnumId)
      this.currentJobStatus = job.tempExprId
      const id = this.jobEnums.find((enums) => enums === job.systemJobEnumId)
      this.freqType = id && (Object.entries(this.jobFrequencyType).find((freq) => freq[0] == id) as any)[1]
      if (this.currentJob && !this.isJobDetailAnimationCompleted) {
        this.playAnimation();
        this.isJobDetailAnimationCompleted = true;
      }
    },
    async getProductCount(query: any){
      //Passed rows = 0 as we only need product count and not the data
      query.json.params.rows = 0;
      try {
        const resp = await ProductService.getProducts(query);
        if(resp.status === 200 && !hasError(resp) && resp.data.response){
          this.productCount = resp.data.response.numFound
        } else {
          this.$log.error(resp);
          this.productCount = 0;
        } 
      } catch (err) {
        this.$log.error(err);
        this.productCount = 0;
      }
    },
    playAnimation() {
      const aside = this.$el.querySelector('aside') as Element
      const main = document.querySelector('main') as Element

      const revealAnimation = createAnimation()
        .addElement(aside)
        .duration(1500)
        .easing('ease')
        .keyframes([
          { offset: 0, flex: '0', opacity: '0' },
          { offset: 0.5, flex: '1', opacity: '0' },
          { offset: 1, flex: '1', opacity: '1' }
        ])

      const gapAnimation = createAnimation()
        .addElement(main)
        .duration(500)
        .fromTo('gap', '0', 'var(--spacer-2xl)');

      createAnimation()
        .addAnimation([gapAnimation, revealAnimation])
        .play();
    }
  },
  ionViewWillEnter() {
    // reassigning current job when entering in the view to not display the job config component if previously opened
    this.currentJob = undefined
    if (this.segmentSelected === 'pending') {
      this.store.dispatch('job/fetchPendingJobs', {eComStoreId: this.getCurrentEComStore.productStoreId, viewSize:process.env.VUE_APP_VIEW_SIZE, viewIndex:0, jobEnums: this.jobEnums})
    } else if (this.segmentSelected === 'running') {
      this.store.dispatch('job/fetchRunningJobs', {eComStoreId: this.getCurrentEComStore.productStoreId, viewSize:process.env.VUE_APP_VIEW_SIZE, viewIndex:0, jobEnums: this.jobEnums})
    } else {
      this.store.dispatch('job/fetchJobHistory', {eComStoreId: this.getCurrentEComStore.productStoreId, viewSize:process.env.VUE_APP_VIEW_SIZE, viewIndex:0, jobEnums: this.jobEnums});
    }
  },
  setup() {
    const store = useStore();
    const segmentSelected = ref('pending');

    return {
      copyOutline,
      store,
      closeCircleOutline,
      checkmarkCircleOutline,
      optionsOutline,
      timeOutline,
      timerOutline,
      segmentSelected
    };
  }
});
</script>

<style scoped>
ion-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0px;
}

ion-card-header :last-child {
  display: flex;
  flex-direction: column;
  align-items: end;
  row-gap: 4px;
}

ion-item {
  --background: transparent;
}

aside {
  position: sticky;
  top: var(--spacer-lg);
}

.actions {
  display: flex;
  justify-content: space-between;
}

@media (min-width: 991px) {
  ion-header{
    display: flex;
  }

  main {
    display: flex;
    justify-content: center;
    align-items: start;
    gap: var(--spacer-2xl);
    max-width: 990px;
    margin: var(--spacer-base) auto 0;
  } 

  main > section {
    max-width: 50ch;
  } 

  aside {
    width: 0px;
    opacity: 0;
  }
}
</style>
