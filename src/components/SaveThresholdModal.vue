<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal">
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ $t("Save threshold rule") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
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

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="saveThresholdRule()" :disabled="isServiceScheduling">
        <ion-icon :icon="cloudUploadOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-content>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
  IonButton,
  IonButtons,
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
  IonTitle,
  IonToolbar,
  modalController
} from '@ionic/vue';
import {
  closeOutline,
  shirtOutline,
  optionsOutline,
  cloudUploadOutline
} from 'ionicons/icons';
import { ProductService } from '@/services/ProductService';
import { hasError, showToast } from '@/utils';
import { translate } from '@/i18n';
import { mapGetters, useStore } from 'vuex';
import { DateTime } from 'luxon';
import { JobService } from '@/services/JobService';

export default defineComponent({
  name: 'SaveThresholdModal',
  components: {
    IonButton,
    IonButtons,
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
    IonTitle,
    IonToolbar
  },
  props: ["threshold", "totalSKUs"],
  data () {
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
      facilitiesByProductStore: 'util/getFacilityByProductStore',
      query: 'product/getQuery',
      userProfile: 'user/getUserProfile'
    })
  },
  methods: {
    closeModal() {
      modalController.dismiss({ dismissed: true });
    },
    async saveThresholdRule() {
      this.isServiceScheduling = true;
      const solrQuery = this.query

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
          await this.scheduleService(searchPreferenceId, this.threshold)
        } else {
          showToast(translate('Something went wrong'))
        }
      } catch (err) {
        console.error(err)
        showToast(translate('Something went wrong'))
      }
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
          'recurrenceTimeZone': this.userProfile?.userTimeZone
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
  setup() {
    const store = useStore();

    return {
      closeOutline,
      cloudUploadOutline,
      shirtOutline,
      optionsOutline,
      store
    };
  },
});
</script>