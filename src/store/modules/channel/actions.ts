import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import * as types from './mutation-types'
import ChannelState from './ChannelState'
import { ChannelService } from '@/services/ChannelService'
import { hasError, showToast } from '@/utils'
import logger from '@/logger'
import store from "@/store"
import { translate } from '@/i18n'

const actions: ActionTree<ChannelState, RootState> = {

  async fetchInventoryChannels ({ commit, dispatch }) {
    let resp = {} as any;
    let inventoryChannels = [] as any

    try {
      resp = await ChannelService.fetchInventoryChannels({ facilityGroupTypeId: "CHANNEL_FAC_GROUP", productStoreId: store.state.user.currentEComStore.productStoreId, pageSize: 50 });

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

  async fetchShopifyConfigs ({ commit }) {
    let shopifyConfigs = [] ;
    try {
      const payload = {
        inputFields: {
          productStoreId: store.state.user.currentEComStore.productStoreId,
        },
        fieldList: ["shopifyConfigId", "name", "shopId"],
        entityName: "ShopifyShopAndConfig",
        noConditionFind: "Y",
      }
      
      const resp = await ChannelService.fetchShopifyConfigs(payload);
      if (!hasError(resp)) {
        shopifyConfigs = resp.data.docs;
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
      noConditionFind: "Y"
    }

    const draftJobs = await ChannelService.fetchJobInformation(params);
    if(draftJobs.length) draftJob = draftJobs[0];

    // Fetching pending jobs
    params = {
      inputFields: {
        statusId: "SERVICE_PENDING",
        systemJobEnumId: "JOB_UL_INV",
        "productStoreId": store.state.user.currentEComStore.productStoreId,
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
          runTimeValue: draftJob?.runTime
        }
      }
    })

    commit(types.CHANNEL_JOBS_UPDATED, jobs)
  },

  async getServiceStatusDesc ({ commit }) {
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
      if (resp.status === 200 && !hasError(resp) && resp.data.count) {
        commit(types.CHANNEL_SERVICE_STATUS_DESC_UPDATED, resp.data.docs);
      }
    } catch(err) {
      logger.error(err)
    }
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
    if (resp.status === 200 && !hasError(resp)) {
      temporalExpressions = resp.data.docs;
      temporalExpressions.forEach((temporalExpression: any) => {
        state.temporalExp[temporalExpression.tempExprId] = temporalExpression;
      })
      // Caching it for other uses
      commit(types.CHANNEL_TEMPORAL_EXPRESSION_UPDATED, state.temporalExp);
    }
    return temporalExpressions;
  },

  async scheduleService({ dispatch, commit }, job) {
    let resp;

    console.log(store.state.user.current);
    const payload = {
      'JOB_NAME': job.jobName,
      'SERVICE_NAME': job.serviceName,
      'SERVICE_COUNT': '0',
      'SERVICE_TEMP_EXPR': job.jobStatus,
      'SERVICE_RUN_AS_SYSTEM':'Y',
      'jobFields': {
        'productStoreId': store.state.user.currentEComStore.productStoreId,
        'systemJobEnumId': job.systemJobEnumId,
        'tempExprId': job.jobStatus, // Need to remove this as we are passing frequency in SERVICE_TEMP_EXPR, currently kept it for backward compatibility
        'maxRecurrenceCount': '-1',
        'parentJobId': job.parentJobId,
        'runAsUser': 'system', //default system, but empty in run now.  TODO Need to remove this as we are using SERVICE_RUN_AS_SYSTEM, currently kept it for backward compatibility
        'recurrenceTimeZone': store.state.user.current.timeZone,
        'createdByUserLogin': store.state.user.current.userName,
        'lastModifiedByUserLogin': store.state.user.current.userLoginId,
      },
      'statusId': "SERVICE_PENDING",
      'systemJobEnumId': job.systemJobEnumId
    } as any

    Object.keys(job.runtimeData).map((key: any) => {
      if(key !== "productStoreId" && key !== "shopifyConfigId" && key !== "shopId") {
        payload[key] = job.runtimeData[key];
      }
    })

    const jobRunTimeDataKeys = job?.runtimeData ? Object.keys(job?.runtimeData) : [];
    if (jobRunTimeDataKeys.includes('shopifyConfigId') || jobRunTimeDataKeys.includes('shopId')) {
      
      jobRunTimeDataKeys.includes('shopifyConfigId') && (payload['shopifyConfigId'] = job.shopifyConfigId);
      jobRunTimeDataKeys.includes('shopId') && (payload['shopId'] = job.shopId);
      payload['jobFields']['shopId'] = job.shopId;
    }

    // checking if the runtimeData has productStoreId, and if present then adding it on root level
    job?.runtimeData?.productStoreId?.length >= 0 && (payload['productStoreId'] = job.productStoreId)
    job?.priority && (payload['SERVICE_PRIORITY'] = job.priority.toString())
    job?.runTime && (payload['SERVICE_TIME'] = job.runTime.toString())
    job?.sinceId && (payload['sinceId'] = job.sinceId)

    try {
      resp = await ChannelService.scheduleJob({ ...payload });
      if (resp.status == 200 && !hasError(resp)) {
        showToast(translate('Service has been scheduled'));
      } else {
        showToast(translate('Something went wrong'))
      }
    } catch (err) {
      showToast(translate('Something went wrong'))
      logger.error(err)
    }
    return {};
  },

  async updateJob ({ commit, dispatch }, job) {
    let resp;

    const payload = {
      'jobId': job.jobId,
      'systemJobEnumId': job.systemJobEnumId,
      'recurrenceTimeZone': store.state.user.current.userTimeZone,
      'tempExprId': job.jobStatus,
      'statusId': "SERVICE_PENDING",
      'runTimeEpoch': '',  // when updating a job clearning the epoch time, as job honors epoch time as runTime and the new job created also uses epoch time as runTime
      'lastModifiedByUserLogin': store.state.user.current.userLoginId
    } as any
    
    job?.runTime && (payload['runTime'] = job.runTime)
    job?.sinceId && (payload['sinceId'] = job.sinceId)
    job?.jobName && (payload['jobName'] = job.jobName)
    
    try {
      resp = await ChannelService.updateJob(payload)
      if (!hasError(resp)) {
        showToast(translate('Service updated successfully'))
      } else {
        showToast(translate('Something went wrong'))
      }
    } catch (err) {
      showToast(translate('Something went wrong'))
      logger.error(err)
    }
    return resp;
  },

  async clearChannelState({ commit }) {
    commit(types.CHANNEL_INVENTORY_CHANNELS_UPDATED, [])
  },
}

export default actions;