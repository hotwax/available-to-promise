import { defineStore } from 'pinia'
import api, { client } from '@/api'
import { hasError } from '@/utils'
import logger from '@/logger'
import { useUserStore } from './user'
import { DateTime } from 'luxon'

export interface ChannelState {
  inventoryChannels: any[];
  jobs: any[];
  statusDesc: any;
  temporalExp: any;
}

export const useChannelStore = defineStore('channel', {
  state: (): ChannelState => ({
    inventoryChannels: [],
    jobs: [],
    statusDesc: {},
    temporalExp: {},
  }),
  getters: {
    getInventoryChannels: (state) => state.inventoryChannels,
    getJobs: (state) => state.jobs,
    getStatusDesc: (state) => (statusId: string) => state.statusDesc[statusId] || "-",
    getTemporalExpr: (state) => (id: string) => state.temporalExp[id],
  },
  actions: {
    async fetchInventoryChannels() {
      const userStore = useUserStore()
      let inventoryChannels = [] as any
      try {
        const resp = await api({
          url: `admin/productStores/${userStore.currentEComStore.productStoreId}/facilityGroups`,
          method: "GET",
          params: { facilityGroupTypeId: "CHANNEL_FAC_GROUP", productStoreId: userStore.currentEComStore.productStoreId, pageSize: 50 }
        }) as any;
        if (!hasError(resp)) {
          inventoryChannels = resp?.data;
        } else {
          throw resp.data
        }
      } catch (err: any) {
        logger.error(err)
      }
      this.inventoryChannels = inventoryChannels;
      await this.fetchGroupFacilities()
    },
    async fetchGroupFacilities(facilityGroupId?: string) {
      const groups = JSON.parse(JSON.stringify(this.inventoryChannels))
      if (facilityGroupId) {
        try {
          const resp = await api({
            url: `admin/facilityGroups/${facilityGroupId}/facilities`,
            method: "GET",
            params: { facilityGroupId, pageSize: 100 }
          }) as any;
          if (!hasError(resp)) {
            const currentGroup = groups.find((group: any) => group.facilityGroupId === facilityGroupId)
            currentGroup.selectedConfigFacility = await resp.data.find((facility: any) => facility.facilityTypeId === "CONFIGURATION")
            currentGroup.selectedFacilities = await resp.data.filter((facility: any) => facility.parentFacilityTypeId !== "VIRTUAL_FACILITY" && facility.facilityTypeId !== "VIRTUAL_FACILITY")
          } else {
            throw resp.data
          }
        } catch (err: any) {
          logger.error(err)
        }
      } else {
        await Promise.allSettled(groups.map(async (group: any) => {
          try {
            const resp = await api({
              url: `admin/facilityGroups/${group.facilityGroupId}/facilities`,
              method: "GET",
              params: { facilityGroupId: group.facilityGroupId, pageSize: 100 }
            }) as any;
            if (!hasError(resp)) {
              group.selectedConfigFacility = await resp.data.find((facility: any) => facility.facilityTypeId === "CONFIGURATION")
              group.selectedFacilities = await resp.data.filter((facility: any) => (facility.parentFacilityTypeId !== "VIRTUAL_FACILITY" && facility.facilityTypeId !== "VIRTUAL_FACILITY"))
            } else {
              throw resp.data
            }
          } catch (err: any) {
            logger.error(err)
          }
        }))
      }
      this.inventoryChannels = groups;
    },
    updateGroup(payload: any) {
      const groups = JSON.parse(JSON.stringify(this.inventoryChannels))
      const selectedGroup = groups.find((group: any) => group.facilityGroupId === payload.facilityGroupId)
      if (selectedGroup) {
        selectedGroup.facilityGroupName = payload.facilityGroupName
        selectedGroup.description = payload.description
      }
      this.inventoryChannels = groups;
    },
    async fetchShopifyConfigs() {
      const userStore = useUserStore()
      let shopifyConfigs = [];
      try {
        const resp = await api({
          url: "admin/shopifyShops",
          method: "get",
          params: { productStoreId: userStore.currentEComStore.productStoreId }
        }) as any;
        if (!hasError(resp)) {
          shopifyConfigs = resp.data;
        } else {
          throw resp.data
        }
      } catch (error: any) {
        logger.error(error)
      }
      return shopifyConfigs;
    },
    async fetchJobs() {
      const userStore = useUserStore()
      const shopifyConfigs = await this.fetchShopifyConfigs();
      if (!shopifyConfigs.length) {
        this.jobs = [];
        return;
      }
      let params = {}, draftJob = {} as any;
      params = {
        inputFields: {
          statusId: "SERVICE_DRAFT",
          systemJobEnumId: "JOB_UL_INV"
        } as any,
        fieldList: ["systemJobEnumId", "runTime", "tempExprId", "parentJobId", "serviceName", "jobId", "jobName", "currentRetryCount", "statusId", "productStoreId", "runtimeDataId", "shopId", "description", "enumTypeId", "enumName"],
        noConditionFind: "Y",
        viewSize: 1
      }
      const userStoreInstance = useUserStore();
      const omsRedirectionInfo = userStoreInstance.getOmsRedirectionInfo
      const baseURL = userStoreInstance.getOmsBaseUrl
      
      const fetchJobsData = async (payload: any) => {
        const resp = await client({
          url: "findJobs",
          method: "post",
          baseURL,
          data: payload,
          headers: {
            "Authorization":  'Bearer ' + omsRedirectionInfo.token,
            'Content-Type': 'application/json'
          }
        }) as any;
        return resp.data?.docs || [];
      }

      const draftJobs = await fetchJobsData(params);
      if (draftJobs.length) draftJob = draftJobs[0];
      params = {
        inputFields: {
          statusId: "SERVICE_PENDING",
          systemJobEnumId: "JOB_UL_INV",
          "productStoreId": userStore.currentEComStore.productStoreId,
        } as any,
        fieldList: ["systemJobEnumId", "runTime", "tempExprId", "parentJobId", "serviceName", "jobId", "jobName", "currentRetryCount", "statusId", "productStoreId", "runtimeDataId", "shopId", "description", "enumTypeId", "enumName"],
        noConditionFind: "Y"
      }
      const pendingJobs = await fetchJobsData(params);
      const jobs = shopifyConfigs.map((shop: any) => {
        const pendingJob = pendingJobs.find((job: any) => job.shopId === shop.shopId)
        if (pendingJob?.jobId) {
          return { ...shop, ...pendingJob, runTimeValue: pendingJob.runTime }
        } else {
          return {
            ...draftJob,
            ...shop,
            runTimeValue: (draftJob?.runTime && (DateTime.fromMillis(draftJob.runTime).diff(DateTime.local()).milliseconds > 0)) ? draftJob.runTime : "",
            tempExprId: "SERVICE_DRAFT"
          }
        }
      })
      this.jobs = jobs;
    },
    async getServiceStatusDesc() {
      let statusDescs = [];
      try {
        const userStoreInstance = useUserStore();
        const omsRedirectionInfo = userStoreInstance.getOmsRedirectionInfo
        const baseURL = userStoreInstance.getOmsBaseUrl

        const resp = await client({
          url: "performFind",
          method: "post",
          data: {
            "inputFields": {
              "statusTypeId": "SERVICE_STATUS",
              "statusTypeId_op": "equals"
            },
            "entityName": "StatusItem",
            "fieldList": ["statusId", "description"],
            "noConditionFind": "Y",
            "viewSize": 20
          },
          baseURL,
          headers: {
            "Authorization":  'Bearer ' + omsRedirectionInfo.token,
            'Content-Type': 'application/json'
          },
          cache: true
        }) as any;
        if (!hasError(resp)) {
          statusDescs = resp.data.docs;
        } else {
          throw resp.data;
        }
      } catch (err) {
        logger.error(err)
      }
      statusDescs.forEach((status: any) => {
        this.statusDesc[status.statusId] = status.description;
      })
    },
    async findTemporalExpression() {
      let temporalExpressions = [];
      const userStoreInstance = useUserStore();
      const omsRedirectionInfo = userStoreInstance.getOmsRedirectionInfo
      const baseURL = userStoreInstance.getOmsBaseUrl

      const resp = await client({
        url: "performFind",
        method: "post",
        baseURL,
        data: {
          "inputFields": { "tempExprTypeId": "FREQUENCY" },
          "viewSize": 100,
          "fieldList": ["tempExprId", "description", "integer1", "integer2"],
          "entityName": "TemporalExpression",
          "noConditionFind": "Y",
        },
        headers: {
          "Authorization":  'Bearer ' + omsRedirectionInfo.token,
          'Content-Type': 'application/json'
        }
      }) as any;
      if (!hasError(resp)) {
        temporalExpressions = resp.data.docs;
        temporalExpressions.forEach((temporalExpression: any) => {
          this.temporalExp[temporalExpression.tempExprId] = temporalExpression;
        })
      }
      return temporalExpressions;
    },
    updateJob(payload: any) {
      const jobs = JSON.parse(JSON.stringify(this.jobs))
      const selectedJob = jobs.find((job: any) => job.shopId === payload.shopId)
      if (selectedJob) {
        selectedJob.runTime = payload.runTime
        selectedJob.runTimeValue = payload.runTime
        selectedJob.tempExprId = payload.jobStatus
      }
      this.jobs = jobs;
    },
    clearChannelState() {
      this.inventoryChannels = [];
    },
    async createFacility(payload: any) {
      return await api({
        url: "admin/facilities",
        method: "POST",
        data: payload
      });
    },
    async createFacilityGroup(payload: any) {
      return await api({
        url: "admin/facilityGroups",
        method: "POST",
        data: payload
      });
    },
    async disableJob(payload: any) {
      const userStore = useUserStore();
      return await client({
        url: "service/cancelScheduledJob",
        method: "post",
        baseURL: userStore.getOmsBaseUrl,
        data: payload,
        headers: {
          "Authorization":  'Bearer ' + userStore.getOmsRedirectionInfo.token,
          'Content-Type': 'application/json'
        }
      });
    },
    async fetchJobInformation(payload: any) {
      const userStore = useUserStore();
      const resp = await client({
        url: "findJobs",
        method: "post",
        baseURL: userStore.getOmsBaseUrl,
        data: payload,
        headers: {
          "Authorization":  'Bearer ' + userStore.getOmsRedirectionInfo.token,
          'Content-Type': 'application/json'
        }
      }) as any;
      return resp.data?.docs || [];
    },
    async scheduleJob(payload: any) {
      const userStore = useUserStore();
      return await client({
        url: "scheduleService",
        method: "post",
        baseURL: userStore.getOmsBaseUrl,
        data: payload,
        headers: {
          "Authorization":  'Bearer ' + userStore.getOmsRedirectionInfo.token,
          'Content-Type': 'application/json'
        }
      });
    },
    async updateFacilityAssociationWithGroup(payload: any) {
      return await api({
        url: `admin/facilityGroups/${payload.facilityGroupId}/facilities/${payload.facilityId}/association`,
        method: "POST",
        data: payload
      });
    },
    async updateFacilityAssociationWithProductStore(payload: any) {
      return await api({
        url: `admin/productStores/${payload.productStoreId}/facilities/${payload.facilityId}/association`,
        method: "POST",
        data: payload
      });
    },
    async updateGroupAssociationWithProductStore(payload: any) {
      return await api({
        url: `admin/productStores/${payload.productStoreId}/facilityGroups/${payload.facilityGroupId}/association`,
        method: "POST",
        data: payload
      });
    },
    async updateGroupApi(payload: any) {
      return await api({
        url: `admin/facilityGroups/${payload.facilityGroupId}`,
        method: "PUT",
        params: payload
      });
    },
    async updateJobApi(payload: any) {
      const userStore = useUserStore();
      return await client({
        url: "service/updateJobSandbox",
        method: "post",
        baseURL: userStore.getOmsBaseUrl,
        data: payload,
        headers: {
          "Authorization":  'Bearer ' + userStore.getOmsRedirectionInfo.token,
          'Content-Type': 'application/json'
        }
      });
    }
  }
})
