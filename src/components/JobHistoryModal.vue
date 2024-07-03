<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal">
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ currentJob?.enumName }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <div v-if="jobHistory?.length">
      <ion-list>
        <ion-item v-for="(job, index) in jobHistory" :key="index">
          <ion-label>
            {{ job.runTime ? getTime(job.runTime) : "-" }}
            <p v-if="job.runTime">{{ getDate(job.runTime) }}</p>
          </ion-label>
          <ion-badge v-if="job.statusId" :color="job.statusId === 'SERVICE_FINISHED' ? 'success' : 'danger'">{{ getStatusDesc(job.statusId) }}</ion-badge>
        </ion-item>
      </ion-list>
    </div>

    <div v-else>
      <p class="ion-text-center">{{ translate("No available history for this job.")}}</p>
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import { IonBadge, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonTitle, IonToolbar, modalController } from '@ionic/vue';
import { translate } from '@/i18n';
import { closeOutline } from 'ionicons/icons';
import { computed, defineProps, onMounted, ref } from "vue";
import { DateTime } from 'luxon';
import { ChannelService } from '@/services/ChannelService';
import { useStore } from "vuex";

const store = useStore();
const props = defineProps(["currentJob"]);

const jobHistory = ref([]) as any;

const getStatusDesc = computed(() => store.getters["channel/getStatusDesc"])

onMounted(async () => {
  await store.dispatch("channel/getServiceStatusDesc");
  fetchJobHistory();
})

function closeModal() {
  modalController.dismiss({ dismissed: true });
}

function getDate(runTime: any) {
  return DateTime.fromMillis(runTime).toLocaleString(DateTime.DATE_MED);
}

function getTime(runTime: any) {
  return DateTime.fromMillis(runTime).toLocaleString(DateTime.TIME_SIMPLE);
}

async function fetchJobHistory() {
  jobHistory.value = await ChannelService.fetchJobInformation({
    "inputFields": {
      "productStoreId": props.currentJob.productStoreId,
      "statusId": ["SERVICE_CANCELLED", "SERVICE_CRASHED", "SERVICE_FAILED", "SERVICE_FINISHED"],
      "statusId_op": "in",
      "systemJobEnumId": props.currentJob.systemJobEnumId,
      "shopId_fld0_value": props.currentJob.shopId,
      "shopId_fld0_grp": "1",
      "shopId_fld0_op": "equals",
      "shopId_fld1_grp": "2",
      "shopId_fld1_op": "empty"
    },
    "fieldList": ["runTime", "statusId"],
    "noConditionFind": "Y",
    "viewSize": process.env.VUE_APP_VIEW_SIZE,
    "orderBy": "runTime DESC"
  })
}
</script>