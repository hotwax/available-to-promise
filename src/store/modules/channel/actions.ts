import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import * as types from './mutation-types'
import ChannelState from './ChannelState'
import { ChannelService } from '@/services/ChannelService'
import { hasError } from '@/utils'
import logger from '@/logger'
import store from "@/store"
import { DateTime } from 'luxon'

const actions: ActionTree<ChannelState, RootState> = {

  async fetchInventoryChannels ({ commit, dispatch }) {
    let resp = {} as any;
    let inventoryChannels = [] as any

    try {
      resp = await ChannelService.fetchInventoryChannels({ facilityGroupTypeId: "CHANNEL_FAC_GROUP", productStoreId: store.state.user.currentProductStore.productStoreId, pageSize: 50 });

      if(!hasError(resp)) {
        inventoryChannels = resp?.data;
      } else {
        throw resp.data
      }
    } catch (err: any) {
      logger.error(err)
    }

    commit(types.CHANNEL_INVENTORY_CHANNELS_UPDATED, inventoryChannels)
    await dispatch('fetchGroupFacilities')
  },
  
  async fetchGroupFacilities ({ commit, state }, facilityGroupId) {
    const groups = JSON.parse(JSON.stringify(state.inventoryChannels))

    if(facilityGroupId) {
      const resp = await ChannelService.fetchGroupFacilities({ facilityGroupId, pageSize: 100 })

      if(!hasError(resp)) {
        const currentGroup = groups.find((group: any) => group.facilityGroupId === facilityGroupId)
        currentGroup.selectedConfigFacility = await resp.data.find((facility: any) => facility.facilityTypeId === "CONFIGURATION")
        currentGroup.selectedFacilities = await resp.data.filter((facility: any) => facility.parentFacilityTypeId !== "VIRTUAL_FACILITY" && facility.facilityTypeId !== "VIRTUAL_FACILITY")
      } else {
        throw resp.data
      }
    } else {
      await Promise.allSettled(groups.map(async (group: any) => {
        try {
          const resp = await ChannelService.fetchGroupFacilities({ facilityGroupId: group.facilityGroupId, pageSize: 100 });
          if(!hasError(resp)) {
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
    commit(types.CHANNEL_INVENTORY_CHANNELS_UPDATED, groups)
  },

  async updateGroup ({ commit, state }, payload) {
    const groups = JSON.parse(JSON.stringify(state.inventoryChannels))

    const selectedGroup = groups.find((group: any) => group.facilityGroupId === payload.facilityGroupId)
    selectedGroup.facilityGroupName = payload.facilityGroupName
    selectedGroup.description = payload.description

    commit(types.CHANNEL_INVENTORY_CHANNELS_UPDATED, groups);
  },

  async fetchShopifyConfigs () {
    let shopifyConfigs = [];

    try {
      const resp = await ChannelService.fetchShopifyConfigs({ productStoreId: store.state.user.currentProductStore.productStoreId });
      if (!hasError(resp)) {
        shopifyConfigs = resp.data;
      } else {
        throw resp.data
      }
    } catch(error: any) {
      logger.error(error)
    }
    return shopifyConfigs;
  },

  async fetchJobs ({ commit, dispatch }) {
    const shopifyConfigs = await dispatch("fetchShopifyConfigs");

    if(!shopifyConfigs.length) {
      commit(types.CHANNEL_JOBS_UPDATED, [])
      return;
    }

    let params = {}, draftJob = {} as any;

    // Fetch draft job
    params = {
      inputFields: {
        statusId: "SERVICE_DRAFT",
        systemJobEnumId: "JOB_UL_INV"
      } as any,
      fieldList: ["systemJobEnumId", "runTime", "tempExprId", "parentJobId", "serviceName", "jobId", "jobName", "currentRetryCount", "statusId", "productStoreId", "runtimeDataId", "shopId", "description", "enumTypeId", "enumName"],
      noConditionFind: "Y",
      viewSize: 1
    }

    const draftJobs = await ChannelService.fetchJobInformation(params);
    if(draftJobs.length) draftJob = draftJobs[0];

    // Fetching pending jobs
    params = {
      inputFields: {
        statusId: "SERVICE_PENDING",
        systemJobEnumId: "JOB_UL_INV",
        "productStoreId": store.state.user.currentProductStore.productStoreId,
      } as any,
      fieldList: ["systemJobEnumId", "runTime", "tempExprId", "parentJobId", "serviceName", "jobId", "jobName", "currentRetryCount", "statusId", "productStoreId", "runtimeDataId", "shopId", "description", "enumTypeId", "enumName"],
      noConditionFind: "Y"
    }

    const pendingJobs = await ChannelService.fetchJobInformation(params);

    const jobs = shopifyConfigs.map((shop: any) => {
      const pendingJob = pendingJobs.find((job: any) => job.shopId === shop.shopId)

      if(pendingJob?.jobId) {
        return {
          ...shop,
          ...pendingJob,
          runTimeValue: pendingJob.runTime
        }
      } else {
        return {
          ...draftJob,
          ...shop,
          runTimeValue: (draftJob?.runTime && (DateTime.fromMillis(draftJob.runTime).diff(DateTime.local()).milliseconds > 0)) ? draftJob.runTime : "",
          tempExprId: "SERVICE_DRAFT"
        }
      }
    })

    commit(types.CHANNEL_JOBS_UPDATED, jobs)
  },

  async getServiceStatusDesc ({ commit }) {
    let statusDescs = [];

    try{
      const resp = await ChannelService.getServiceStatusDesc({
        "inputFields": {
          "statusTypeId": "SERVICE_STATUS",
          "statusTypeId_op": "equals"
        },
        "entityName": "StatusItem",
        "fieldList": ["statusId", "description"],
        "noConditionFind": "Y",
        "viewSize": 20
      })

      if(!hasError(resp)) {
        statusDescs = resp.data.docs;
      } else {
        throw resp.data;
      }
    } catch(err) {
      logger.error(err)
    }
    commit(types.CHANNEL_SERVICE_STATUS_DESC_UPDATED, statusDescs);
  },

  async findTemporalExpression({ commit, state }){
    let temporalExpressions = [];

    const resp = await ChannelService.fetchTemporalExpression({
      "inputFields": {
        "tempExprTypeId": "FREQUENCY",
      },
      "viewSize": 100,
      "fieldList": [ "tempExprId", "description","integer1", "integer2" ],
      "entityName": "TemporalExpression",
      "noConditionFind": "Y",
    })

    if(!hasError(resp)) {
      temporalExpressions = resp.data.docs;
      temporalExpressions.forEach((temporalExpression: any) => {
        state.temporalExp[temporalExpression.tempExprId] = temporalExpression;
      })
      // Caching it for other uses
      commit(types.CHANNEL_TEMPORAL_EXPRESSION_UPDATED, state.temporalExp);
    }

    return temporalExpressions;
  },

  async clearChannelState({ commit }) {
    commit(types.CHANNEL_INVENTORY_CHANNELS_UPDATED, [])
  },
}

export default actions;