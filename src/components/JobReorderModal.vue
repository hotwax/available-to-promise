<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal">
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ $t('Export product threshold jobs') }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-reorder-group @ionItemReorder="doReorder($event)" disabled="false">
      <ion-item v-for="job in jobs" :key="job.jobId">
        <ion-label>{{ job.jobName }}</ion-label>
        <ion-label>{{ job.runTime ? getTime(job.runTime) : "-"  }}</ion-label>
        <ion-label>{{ timeFromNow(job.runTime)}}</ion-label>
        <ion-reorder />
      </ion-item>
    </ion-reorder-group>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="save()" :disabled="!this.updatedJobsOrder.length">
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-content>
</template>

<script lang="ts">
import {
  IonButtons,
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonReorder,
  IonReorderGroup,
  IonTitle,
  IonToolbar,
  modalController
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { closeOutline, saveOutline } from 'ionicons/icons';
import { mapGetters, useStore } from 'vuex';
import { DateTime } from 'luxon';
import { JobService } from '@/services/JobService';

export default defineComponent({
  name: 'JobReorderModal',
  components: {
    IonButtons,
    IonButton,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonReorder,
    IonReorderGroup,
    IonTitle,
    IonToolbar,
  },
  data() {
    return {
      jobEnumId: 'JOB_EXP_PROD_THRSHLD',
      updatedJobsOrder: [] as any,
      failedJobs: [] as any,
      successJobs: [] as any
    }
  },
  computed: {
    ...mapGetters({
      userProfile: "user/getUserProfile",
      jobsForReorder: "job/getPendingJobs"
    }),
  },
  methods: {
    timeFromNow (time: any) {
      const timeDiff = DateTime.fromMillis(time).diff(DateTime.local());
      return DateTime.local().plus(timeDiff).toRelative();
    },
    closeModal(isJobsUpdated = false) {
      modalController.dismiss({ isJobsUpdated });
    },
    getTime (time: any) {
      return DateTime.fromMillis(time).toLocaleString(DateTime.TIME_SIMPLE);
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
      const updatedSeq = event.detail.complete(JSON.parse(JSON.stringify(this.jobs)));
      let diffSeq = this.findJobDiff(previousSeq, updatedSeq)
      const updatedRunTime = previousSeq.map((job: any) => job.runTime)
      Object.keys(diffSeq).map((key: any) => {
        diffSeq[key].runTime = updatedRunTime[key]
      })
      diffSeq = Object.keys(diffSeq).map((key) => diffSeq[key])
      this.jobs = updatedSeq
      this.updatedJobsOrder = diffSeq
    },
    async save() {
      this.failedJobs = []
      this.successJobs = []
      await Promise.all(this.updatedJobsOrder.map(async (job: any) => {
        const payload = {
          'jobId': job.jobId,
          'systemJobEnumId': job.systemJobEnumId,
          'recurrenceTimeZone': this.userProfile.userTimeZone,
          'statusId': "SERVICE_PENDING",
          'runTime': job.runTime
        }
        try {
          const resp = await JobService.updateJob(payload)
          if (!resp) {
            // if the job failed when updating then adding the jobId to the failedJobs array
            this.failedJobs.push(job.jobId)
          } else if (resp?.status === 200) {
            // if the job succeded when updating then adding the jobId to the successJobs array
            this.successJobs.push(job.jobId)
          }
        } catch (err) {
          this.failedJobs.push(job.jobId)
        }
      }))
      // If there are no failed jobs then redirecting the user to the threshold updates page
      if (!this.failedJobs.length) {
        this.closeModal(true);
      }
    },
  },
  setup() {
    const store = useStore();
    return {
      closeOutline,
      saveOutline,
      store
    };
  },
});
</script>

<style scoped>
ion-modal {
  --width: 290px;
  --height: 382px;
  --border-radius: 8px;
}
</style>