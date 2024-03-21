<template>
  <section>
    <ion-item lines="none">
      <h1>{{ title }}</h1>
      <ion-badge slot="end" color="dark" v-if="job?.runTime">{{ $t("running") }} {{ timeTillJob(runTime ? runTime : job.runTime) }}</ion-badge>
    </ion-item>

    <ion-list>
      <ion-item>
        <ion-icon slot="start" :icon="calendarClearOutline" />
        <ion-label>{{ $t("Last run") }}</ion-label>
        <ion-label slot="end">{{ job?.lastUpdatedStamp ? getTime(job.lastUpdatedStamp) : $t('No previous occurrence') }}</ion-label>
      </ion-item>

      <ion-item>
        <ion-icon slot="start" :icon="timeOutline" />
        <ion-label>{{ $t("Run time") }}</ion-label>
        <ion-label @click="() => isOpen = true" slot="end">{{ job?.runTime ? getTime(runTime ? runTime : job.runTime) : $t('Select run time') }}</ion-label>
        <!-- TODO: display a button when we are not having a runtime and open the datetime component
        on click of that button
        Currently, when mapping the same datetime component for label and button so it's not working so for
        now commented the button and added a fallback string -->
        <!-- <ion-button id="open-run-time-modal" size="small" fill="outline" color="medium" v-show="!job?.runTime">{{ $t("Select run time") }}</ion-button> -->
        <ion-modal :is-open="isOpen" @didDismiss="() => isOpen = false">
          <ion-content force-overscroll="false">
            <ion-datetime
              show-default-buttons
              hour-cycle="h12"
              :value="job?.runTime ? getDateTime(job.runTime) : ''"
              @ionChange="updateRunTime($event, job)"
            />
          </ion-content>
        </ion-modal>
      </ion-item>

      <ion-item lines="inset">
        <ion-icon slot="start" :icon="timerOutline" />
        <ion-label>{{ $t("Schedule") }}</ion-label>
        <ion-select :interface-options="customPopoverOptions" interface="popover" :value="jobStatus" :placeholder="$t('Disabled')" @ionChange="($event) => jobStatus = $event['detail'].value">
          <ion-select-option v-for="freq in generateFrequencyOptions" :key="freq.value" :value="freq.value">{{ $t(freq.label) }}</ion-select-option>
        </ion-select>
      </ion-item>

      <!-- TODO: enable this feature of passing count when supported on backend -->
      <!-- <ion-item>
        <ion-icon slot="start" :icon="syncOutline" />
        <ion-label>{{ $t("Repeat untill disabled") }}</ion-label>
        <ion-checkbox slot="end" :checked="repeat" @ionChange="repeatUntillDisabled($event['detail'].checked)"/>
      </ion-item>

      <ion-item v-show="!repeat">
        <ion-label>{{ $t("Auto disable after") }}</ion-label>
        <ion-input :placeholder="$t('occurrences')" v-model="count"/>
      </ion-item> -->
      <ion-item v-if="job?.systemJobEnumId === 'JOB_EXP_PROD_THRSHLD'" lines="inset">
        <ion-icon slot="start" :icon="cogOutline" />
        <ion-label>{{ $t("Name") }}</ion-label>
        <ion-input class="ion-text-end" name="ruleName" v-model="ruleName" id="ruleName" />
      </ion-item>

      <ion-item v-if="job?.runtimeData?.searchPreferenceId" button detail="true" @click="updateThresholdRule" lines="full">
        <ion-icon slot="start" :icon="pencilOutline" />
        <ion-label class="ion-text-wrap">{{ $t("Edit threshold rule") }}</ion-label>
        <ion-note slot="end">
          {{ productCount }} {{ $t("products selected")}}
        </ion-note>
      </ion-item>

    </ion-list>
    <div class="actions desktop-only">
      <div>
        <ion-button size="small" fill="outline" color="medium" :disabled="!hasPermission(Actions.APP_JOB_UPDATE) || status === 'SERVICE_DRAFT'" @click="skipJob(job)">{{ $t("Skip once") }}</ion-button>
        <ion-button size="small" fill="outline" color="danger" :disabled="!hasPermission(Actions.APP_JOB_UPDATE) || status === 'SERVICE_DRAFT'" @click="cancelJob(job)">{{ $t("Disable") }}</ion-button>
      </div>
      <div>
        <ion-button size="small" fill="outline" :disabled="!hasPermission(Actions.APP_JOB_UPDATE)" @click="saveChanges()">{{ $t("Save changes") }}</ion-button>
      </div>
    </div>

    <div class=" actions mobile-only">
      <ion-button size="small" fill="outline" color="medium" :disabled="hasPermission(Actions.APP_JOB_UPDATE) || status === 'SERVICE_DRAFT'" @click="skipJob(job)">{{ $t("Skip once") }}</ion-button>
      <ion-button size="small" fill="outline" color="danger" :disabled="hasPermission(Actions.APP_JOB_UPDATE) || status === 'SERVICE_DRAFT'" @click="cancelJob(job)">{{ $t("Disable") }}</ion-button>
      <ion-button expand="block" fill="outline" :disabled="!hasPermission(Actions.APP_JOB_UPDATE)" @click="saveChanges()">{{ $t("Save changes") }}</ion-button>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonBadge,
  IonButton,
  IonContent,
  IonDatetime,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonNote,
  IonSelect,
  IonSelectOption,
  alertController
} from "@ionic/vue";
import {
  calendarClearOutline,
  chevronForwardOutline,
  cogOutline,
  timeOutline,
  timerOutline,
  syncOutline,
  pencilOutline,
  personCircleOutline
} from "ionicons/icons";
import { mapGetters, useStore } from "vuex";
import { handleDateTimeInput, hasError, showToast } from "@/utils";
import { JobService } from "@/services/JobService";
import { DateTime } from 'luxon';
import { translate } from "@hotwax/dxp-components";
import logger from "@/logger";
import { Actions, hasPermission } from '@/authorization'

export default defineComponent({
  name: "JobConfiguration",
  components: {
    IonBadge,
    IonButton,
    IonContent,
    IonDatetime,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonModal,
    IonNote,
    IonSelect,
    IonSelectOption
  },
  data() {
    return {
      jobStatus: this.status,
      ruleName: this.job?.jobName,
      jobEnums: JSON.parse(process.env?.VUE_APP_JOB_ENUMS as string) as any,
      runTime: '',
      isOpen: false
    }
  },
  props: ["job", "title", "status", "type", "productCount"],
  computed: {
    ...mapGetters({
      userProfile: 'user/getUserProfile'
    }),
    generateFrequencyOptions(): any {
      const optionDefault = [{
          "value": "EVERY_5_MIN",
          "label": "Every 5 minutes"
        },{
          "value": "EVERY_15_MIN",
          "label": "Every 15 minutes"
        },{
          "value": "EVERY_30_MIN",
          "label": "Every 30 minutes"
        },{
          "value": "HOURLY",
          "label": "Hourly"
        },{
          "value": "EVERY_6_HOUR",
          "label": "Every 6 hours"
        },{
          "value": "EVERYDAY",
          "label": "Every day"
        }
      ]

      const slow = [{
          "value": "HOURLY",
          "label": "Hourly"
        },{
          "value": "EVERY_6_HOUR",
          "label": "Every 6 hours"
        },{
          "value": "EVERYDAY",
          "label": "Every day"
        }
      ]
      return (this as any).type === 'slow' ? slow : optionDefault;
    }
  },
  methods: {
    updateThresholdRule(){
      this.$router.push(`select-product?id=${this.job.jobId}`)
    },
    getDateTime(time: any) {
      return DateTime.fromMillis(time).toISO()
    },
    async skipJob(job: any) {
      const alert = await alertController
        .create({
          header: this.$t('Skip job'),
          message: this.$t('Skipping will run this job at the next occurrence based on the temporal expression.'),
          buttons: [{
            text: this.$t("Don't skip"),
            role: 'cancel'
          }, {
            text: this.$t('Skip'),
            handler: async () => {
              if (job) {
                // TODO: using updatedRunTime value to update the runTime in the configuration component as currently currentJob state is not maintained
                const { updatedRunTime } = await this.store.dispatch('job/skipJob', job)
                if(updatedRunTime) {
                  this.runTime = updatedRunTime;
                  this.store.dispatch('job/fetchPendingJobs', {viewSize:process.env.VUE_APP_VIEW_SIZE, viewIndex:0, jobEnums: this.jobEnums})
                }
              }
            }
          }]
        });
      return alert.present();
    },
    async cancelJob(job: any) {
      const alert = await alertController
        .create({
          header: this.$t('Cancel job'),
          message: this.$t('Canceling this job will cancel this occurrence and all following occurrences. This job will have to be re-enabled manually to run it again.'),
          buttons: [{
            text: this.$t("Don't cancel"),
            role: 'cancel'
          }, {
            text: this.$t('Cancel'),
            handler: async () => {
              const resp = await this.store.dispatch('job/cancelJob', job);
              if(resp.status == 200 && !hasError(resp) && resp.data.successMessage) {
                this.store.dispatch('job/fetchPendingJobs', {viewSize:process.env.VUE_APP_VIEW_SIZE, viewIndex:0, jobEnums: this.jobEnums})
              }
            }
          }],
        });
      return alert.present();
    },
    async saveChanges() {
      const alert = await alertController
        .create({
          header: this.$t('Save changes'),
          message: this.$t('Are you sure you want to save these changes?'),
          buttons: [{
            text: this.$t('Cancel'),
            role: 'cancel'
          }, {
            text: this.$t('Save'),
            handler: () => {
              this.updateJob();
            }
          }]
        });
      return alert.present();
    },
    async discardChanges() {
      const alert = await alertController
        .create({
          header: this.$t('Discard changes'),
          message: this.$t('All unsaved changes will be lost. Are you sure you want to leave this page.'),
          buttons: [this.$t('Cancel'), this.$t('Save')],
        });
      return alert.present();
    },
    async updateJob() {
      const job = this.job;
      job.jobName = this.ruleName;
      job['jobStatus'] = this.jobStatus !== 'SERVICE_DRAFT' ? this.jobStatus : 'HOURLY';
      if (job?.statusId === 'SERVICE_PENDING') {
        try {
          const payload = {
            'jobId': job.jobId,
            'systemJobEnumId': job.systemJobEnumId,
            'recurrenceTimeZone': this.userProfile.userTimeZone,
            'tempExprId': job.frequency ? job.frequency : job.jobStatus, // TODO: change jobStatus to frequency
            'statusId': "SERVICE_PENDING"
          } as any

          job?.runTime && (payload['runTime'] = job.runTime)
          job?.sinceId && (payload['sinceId'] = job.sinceId)
          job?.jobName && (payload['jobName'] = job.jobName)

          const resp = await JobService.updateJob(payload)
          if(resp.status == 200 && !hasError(resp) && resp.data.successMessage) {
            this.store.dispatch('job/fetchPendingJobs', {viewSize:process.env.VUE_APP_VIEW_SIZE, viewIndex:0, jobEnums: this.jobEnums})
            showToast(translate('Service updated successfully'))
          } else {
            showToast(translate('Something went wrong'))
          }
        } catch(err) {
          showToast(translate('Something went wrong'))
          logger.error(err)
        }
      }
    },
    getTime (time: any) {
      return DateTime.fromMillis(time).toLocaleString(DateTime.DATETIME_MED);
    },
    timeTillJob (time: any) {
      const timeDiff = DateTime.fromMillis(time).diff(DateTime.local());
      return DateTime.local().plus(timeDiff).toRelative();
    },
    updateRunTime(ev: CustomEvent, job: any) {
      if (job) {
        const currTime = DateTime.now().toMillis();
        const setTime = handleDateTimeInput(ev['detail'].value);

        if(setTime > currTime) {
          job.runTime = setTime;
        } else {
          showToast(translate("Provide a future date and time"))
        }
      }
    }
  },
  setup(props) {
    const customPopoverOptions: any = {
      header: props.title,
      showBackdrop: false
    }
    const store = useStore();
    return {
      Actions,
      calendarClearOutline,
      chevronForwardOutline,
      cogOutline,
      customPopoverOptions,
      hasPermission,
      timeOutline,
      timerOutline,
      store,
      syncOutline,
      pencilOutline,
      personCircleOutline
    };
  }
});
</script>

<style scoped>
ion-list {
  margin: var(--spacer-base) 0;
}

.actions > ion-button {
  margin: var(--spacer-sm);
}

@media (min-width: 991px) {  
  section {
    overflow: hidden;
    border: var(--border-medium);
    border-radius: 16px;
  }
  .actions {
    display: flex;
    justify-content: space-between;
    margin: var(--spacer-base) var(--spacer-sm) var(--spacer-base);
  }

  .mobile-only {
    display: none;
  }  
}

ion-item:nth-child(2) > ion-label:nth-child(3) {
  cursor: pointer;
}

ion-modal {
  --width: 290px;
  --height: 440px;
  --border-radius: 8px;
}
</style>