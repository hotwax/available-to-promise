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
        <ion-label>{{ timeTillJob(job.runTime)}}</ion-label>
        <ion-icon :icon="checkmarkCircleOutline" color="success" v-if="successJobs.includes(job.jobId)" />
        <ion-icon :icon="closeCircleOutline" color="danger" v-if="failedJobs.includes(job.jobId)" />
        <ion-reorder />
      </ion-item>
    </ion-reorder-group>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="save()" :disabled="this.failedJobs.length">
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
import { checkmarkCircleOutline, closeCircleOutline, closeOutline, saveOutline } from 'ionicons/icons';
import { mapGetters, useStore } from 'vuex';
import { DateTime } from 'luxon';
import { JobService } from '@/services/JobService';
import { hasError, showToast } from '@/utils';
import logger from '@/logger';
import { translate } from '@/i18n';

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
      updatedJobsOrder: [] as any,
      failedJobs: [] as any,
      successJobs: [] as any,
      jobs: (this as any).jobsForReorder,
      seqBeforeReorder: JSON.parse(JSON.stringify((this as any).jobsForReorder))
    }
  },
  computed: {
    ...mapGetters({
      userProfile: "user/getUserProfile"
    }),
  },
  props: ["jobsForReorder"],
  methods: {
    timeTillJob (time: any) {
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
      // making the item reorder action as complete
      this.jobs = event.detail.complete(JSON.parse(JSON.stringify(this.jobs)));
    },
    async save() {
      let diffSeq = this.findJobDiff(this.seqBeforeReorder, this.jobs)
      const updatedRunTime = this.seqBeforeReorder.map((job: any) => job.runTime)
      Object.keys(diffSeq).map((key: any) => {
        diffSeq[key].runTime = updatedRunTime[key]
      })
      diffSeq = Object.keys(diffSeq).map((key) => diffSeq[key])
      this.updatedJobsOrder = diffSeq

      // if there are no jobs to update then closing the modal and displaying a toast
      if(!this.updatedJobsOrder.length) {
        showToast(translate('No jobs to update'))
        this.closeModal();
        return;
      }

      this.failedJobs = []
      this.successJobs = []
      await Promise.allSettled(this.updatedJobsOrder.map(async (job: any) => {
        const payload = {
          'jobId': job.jobId,
          'systemJobEnumId': job.systemJobEnumId,
          'recurrenceTimeZone': this.userProfile.userTimeZone,
          'statusId': "SERVICE_PENDING",
          'runTime': job.runTime
        }
        try {
          const resp = await JobService.updateJob(payload)
          if (resp.status == 200 && !hasError(resp) && resp.data.successMessage) {
            // if the job succeded when updating then adding the jobId to the successJobs array
            this.successJobs.push(job.jobId)
            showToast(translate('Jobs sequence updated successfully'))
          } else {
            // if the job failed when updating then adding the jobId to the failedJobs array
            this.failedJobs.push(job.jobId)
            logger.error('Failed to update some jobs')
            showToast(translate('Failed to update some jobs'))
          }
        } catch (err) {
          this.failedJobs.push(job.jobId)
          logger.error(err)
          showToast(translate('Failed to update some jobs'))
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
      checkmarkCircleOutline,
      closeCircleOutline,
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