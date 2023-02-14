import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import JobState from './JobState'
import * as types from './mutation-types'
import { getResponseError, hasError, showToast } from '@/utils'
import { JobService } from '@/services/JobService'
import { translate } from '@/i18n'
import { DateTime } from 'luxon';
import logger from "@/logger";

const actions: ActionTree<JobState, RootState> = {
  async fetchJobDescription({ commit, state }, payload){
    const enumIds = [] as any;
    const cachedEnumIds = Object.keys(state.enumIds);
    payload.map((id: any) => {
      if(!cachedEnumIds.includes(id) && id){
        enumIds.push(id);
      }
    });
    if(enumIds.length <= 0) return enumIds.map((id: any) => state.enumIds[id]);

    const resp = await JobService.fetchJobDescription({
      "inputFields": {
        "enumId": enumIds,
        "enumId_op": "in"
      },
      "fieldList": ['enumId', 'description', 'enumName'],
      "entityName": "Enumeration",
      "noConditionFind": "Y",
      "viewSize": payload.length
    })
    if (resp.status === 200 && resp.data?.count > 0 && !hasError(resp)) {
      const enumInformation = resp.data.docs;
      if (resp.data.docs) {
        commit(types.JOB_DESCRIPTION_UPDATED, enumInformation);
      }
    }
    return resp;
  },

  async fetchJobHistory({ commit, dispatch, state }, payload){ 
    await JobService.fetchJobInformation({
      "inputFields": {
        "systemJobEnumId_fld0_value": payload.jobEnums[0],
        "systemJobEnumId_fld0_grp": "1",
        "systemJobEnumId_fld0_op": "equals",
        "systemJobEnumId_fld1_value": payload.jobEnums[1],
        "systemJobEnumId_fld1_grp": "2",
        "systemJobEnumId_fld1_op": "equals",
        "productStoreId": payload.eComStoreId,
        "productStoreId_grp": "2",
        "statusId": ["SERVICE_CANCELLED", "SERVICE_CRASHED", "SERVICE_FAILED", "SERVICE_FINISHED"],
        "statusId_op": "in",
        "systemJobEnumId_op": "not-empty"
      },
      "fieldList": [ "systemJobEnumId", "runTime", "tempExprId", "parentJobId", "serviceName", "jobId", "jobName", "statusId", "cancelDateTime", "finishDateTime", "startDateTime", "runtimeDataId" ],
      "entityName": "JobSandbox",
      "noConditionFind": "Y",
      "viewSize": payload.viewSize,
      "viewIndex": payload.viewIndex,
      "orderBy": "runTime DESC"
    }).then((resp) => {
      if (resp.status === 200 && resp.data.docs?.length > 0 && !hasError(resp)) {
        if (resp.data.docs) {
          const total = resp.data.count;
          let jobs = resp.data.docs;
          if(payload.viewIndex && payload.viewIndex > 0){
            jobs = state.history.list.concat(resp.data.docs);
          }
          jobs.map((job: any) => {
            job['statusDesc'] = this.state.util.statusDesc[job.statusId];
          })          
          commit(types.JOB_HISTORY_UPDATED, { jobs, total });
          const tempExprList = [] as any;
          const enumIds = [] as any;
          const searchPreferenceIds = [] as any;
          resp.data.docs.map((item: any) => {
            enumIds.push(item.systemJobEnumId);
            tempExprList.push(item.tempExprId);
            if (item.runtimeData && item.runtimeData.searchPreferenceId) searchPreferenceIds.push(item.runtimeData.searchPreferenceId)
          })
          const tempExpr = [...new Set(tempExprList)];
          dispatch('fetchTemporalExpression', tempExpr);
          dispatch('fetchJobDescription', enumIds);
          dispatch('fetchThresholdRules', [...new Set(searchPreferenceIds)])
        }
      } else {
        commit(types.JOB_HISTORY_UPDATED, { jobs: [], total: 0 });
      }
    }).catch((err) => {
      commit(types.JOB_HISTORY_UPDATED, { jobs: [], total: 0 });
      logger.error(err);
      showToast(translate("Something went wrong"), err);
    }) 
  },

  async fetchRunningJobs({ commit, dispatch, state }, payload){
    await JobService.fetchJobInformation({
      "inputFields": {
        "systemJobEnumId_fld0_value": payload.jobEnums[0],
        "systemJobEnumId_fld0_grp": "1",
        "systemJobEnumId_fld0_op": "equals",
        "systemJobEnumId_fld1_value": payload.jobEnums[1],
        "systemJobEnumId_fld1_grp": "2",
        "systemJobEnumId_fld1_op": "equals",
        "productStoreId": payload.eComStoreId,
        "productStoreId_grp": "2",
        "statusId": ["SERVICE_RUNNING", "SERVICE_QUEUED"],
        "statusId_op": "in",
        "systemJobEnumId_op": "not-empty",
      },
      "fieldList": [ "systemJobEnumId", "runTime", "tempExprId", "parentJobId", "serviceName", "jobId", "jobName", "statusId", "runtimeDataId" ],
      "entityName": "JobSandbox",
      "noConditionFind": "Y",
      "viewSize": payload.viewSize,
      "viewIndex": payload.viewIndex,
      "orderBy": "runTime DESC"
    }).then((resp) => {
      if (resp.status === 200 && resp.data.docs?.length > 0 && !hasError(resp)) {
        if (resp.data.docs) {
          const total = resp.data.count;
          let jobs = resp.data.docs;
          if(payload.viewIndex && payload.viewIndex > 0){
            jobs = state.running.list.concat(resp.data.docs);
          }
          jobs.map((job: any) => {
            job['statusDesc'] = this.state.util.statusDesc[job.statusId];
          })
          commit(types.JOB_RUNNING_UPDATED, { jobs, total });
          const tempExprList = [] as any;
          const enumIds = [] as any;
          const searchPreferenceIds = [] as any;
          resp.data.docs.map((item: any) => {
            enumIds.push(item.systemJobEnumId);
            tempExprList.push(item.tempExprId);
            if (item.runtimeData && item.runtimeData.searchPreferenceId) searchPreferenceIds.push(item.runtimeData.searchPreferenceId)
          })
          const tempExpr = [...new Set(tempExprList)];
          dispatch('fetchTemporalExpression', tempExpr);
          dispatch('fetchJobDescription', enumIds);
          dispatch('fetchThresholdRules', [...new Set(searchPreferenceIds)])
        }
      } else {
        commit(types.JOB_RUNNING_UPDATED, { jobs: [], total: 0 });
      }
    }).catch((err) => {
      commit(types.JOB_RUNNING_UPDATED, { jobs: [], total: 0 });
      logger.error(err);
      showToast(translate("Something went wrong"), err);
    }) 
  },

  async fetchPendingJobs({ commit, dispatch, state }, payload){
    await JobService.fetchJobInformation({
      "inputFields": {
        "systemJobEnumId_fld0_value": payload.jobEnums[0],
        "systemJobEnumId_fld0_grp": "1",
        "systemJobEnumId_fld0_op": "equals",
        "systemJobEnumId_fld1_value": payload.jobEnums[1],
        "systemJobEnumId_fld1_grp": "2",
        "systemJobEnumId_fld1_op": "equals",
        "productStoreId": payload.eComStoreId,
        "productStoreId_grp": "2",
        "statusId": "SERVICE_PENDING",
        "systemJobEnumId_op": "not-empty"
      },
      "fieldList": [ "systemJobEnumId", "runTime", "tempExprId", "parentJobId", "serviceName", "jobId", "jobName", "currentRetryCount", "statusId", "runtimeDataId", "productStoreId" ],
      "entityName": "JobSandbox",
      "noConditionFind": "Y",
      "viewSize": payload.viewSize,
      "viewIndex": payload.viewIndex,
      "orderBy": "runTime ASC"
    }).then((resp) => {
      if (resp.status === 200 && resp.data.docs?.length > 0 && !hasError(resp)) {
        if (resp.data.docs) {
          const total = resp.data.count;
          let jobs = resp.data.docs;
          if(payload.viewIndex && payload.viewIndex > 0){
            jobs = state.pending.list.concat(resp.data.docs);
          }
          
          commit(types.JOB_PENDING_UPDATED, { jobs, total });
          const tempExprList = [] as any;
          const enumIds = [] as any;
          const searchPreferenceIds = [] as any;
          resp.data.docs.map((item: any) => {
            enumIds.push(item.systemJobEnumId);
            tempExprList.push(item.tempExprId);
            if (item.runtimeData && item.runtimeData.searchPreferenceId) searchPreferenceIds.push(item.runtimeData.searchPreferenceId)
          })
          const tempExpr = [...new Set(tempExprList)];
          dispatch('fetchTemporalExpression', tempExpr);
          dispatch('fetchJobDescription', enumIds);
          dispatch('fetchThresholdRules', [...new Set(searchPreferenceIds)])
        }
      } else {
        commit(types.JOB_PENDING_UPDATED, { jobs: [], total: 0 });
      }
    }).catch((err) => {
      commit(types.JOB_PENDING_UPDATED, { jobs: [], total: 0 });
      logger.error(err);
      showToast(translate("Something went wrong"), err);
    })
  },
  async fetchTemporalExpression({ state, commit }, tempExprIds){
    const tempIds = [] as any;
    const cachedTempExprId = Object.keys(state.temporalExp);
    tempExprIds.map((id: any) => {
      if(!cachedTempExprId.includes(id) && id){
        tempIds.push(id);
      }
    });
    if(tempIds.length <= 0) return tempExprIds.map((id: any) => state.temporalExp[id]);
    
    const resp = await JobService.fetchTemporalExpression({
        "inputFields": {
        "tempExprId": tempIds,
        "temoExprId_op": "in"
      },
      "viewSize": tempIds.length,
      "fieldList": [ "tempExprId", "description","integer1", "integer2" ],
      "entityName": "TemporalExpression",
      "noConditionFind": "Y",
    })
    if (resp.status === 200 && !hasError(resp)) {
      commit(types.JOB_TEMPORAL_EXPRESSION_UPDATED, resp.data.docs);
    }
    return resp;
  },
  async fetchThresholdRules({ state, commit }, thresholdRuleIds){
    const tempIds = [] as any;
    const cachedThresholdRuleIds = Object.keys(state.thresholdRules);
    thresholdRuleIds.map((id: any) => {
      if(!cachedThresholdRuleIds.includes(id) && id){
        tempIds.push(id);
      }
    });
    if(tempIds.length <= 0) return thresholdRuleIds.map((id: any) => state.temporalExp[id]);
    try {
      const resp = await JobService.fetchThresholdRules({
        "inputFields": {
          "searchPrefId": tempIds,
          "searchPrefId_op": "in"
        },
        "viewSize": tempIds.length,
        "fieldList": [ "searchPrefId", "searchPrefValue"],
        "entityName": "SearchPreference",
        "noConditionFind": "Y",
      })
      if (resp.status === 200 && !hasError(resp)) {
        commit(types.JOB_THRESHOLD_RULES_UPDATED, resp.data.docs);
      }
      return resp;
    } catch(err: any){
      logger.error(err);
      return Promise.reject(new Error(err))
    }
  },

  removeThresholdRule({ commit }, id){
    commit(types.JOB_THRESHOLD_RULE_REMOVED, id);
  },
  
  async fetchJobs ({ state, commit, dispatch }, payload) {
    const resp = await JobService.fetchJobInformation({
      "inputFields": {
        "statusId_fld0_value": "SERVICE_DRAFT",
        "statusId_fld0_op": "equals",
        "statusId_fld0_grp": "1",
        "statusId_fld1_value": "SERVICE_PENDING",
        "statusId_fld1_op": "equals",
        "statusId_fld1_grp": "2",
        "productStoreId_fld0_value": this.state.user.currentEComStore.productStoreId,
        "productStoreId_fld0_op": "equals",
        "productStoreId_fld0_grp": "2",
        ...payload.inputFields
      },
      "entityName": "JobSandbox",
      "noConditionFind": "Y",
      "viewSize": payload.viewSize ? payload.viewSize : (payload.inputFields?.systemJobEnumId?.length * 2),
      "orderBy": "runTime ASC"
    })
    if (resp.status === 200 && !hasError(resp) && resp.data.docs) {
      const cached = JSON.parse(JSON.stringify(state.cached));

      // added condition to store multiple pending jobs in the state for export products,
      // getting job with status Service draft as well, as this information will be needed when scheduling
      // a new batch
      // TODO: this needs to be updated when we will be storing the draft and pending jobs separately
      const exportProductThresholdJobs = [] as any
      const exportProductThresholdEnum = 'JOB_EXP_PROD_THRSHLD'
      resp.data.docs.filter((job: any) => job.systemJobEnumId === exportProductThresholdEnum).map((job: any) => {
        exportProductThresholdJobs.push({
          ...job,
          id: job.jobId,
          frequency: job.tempExprId,
          enumId: job.systemJobEnumId,
          status: job.statusId
        })
      })

      resp.data.docs.filter((job: any) => job.statusId === 'SERVICE_PENDING').map((job: any) => {

        // added condition to store multiple pending jobs in the state for order batch jobs
        if (job.systemJobEnumId === exportProductThresholdEnum) {
          return cached[job.systemJobEnumId] = exportProductThresholdJobs
        }
        
        return cached[job.systemJobEnumId] = {
          ...job,
          id: job.jobId,
          frequency: job.tempExprId,
          enumId: job.systemJobEnumId,
          status: job.statusId
        }
      })  

      // always storing the jobs as an array as it will be helful when reordering the jobs or creating a new batch job
      resp.data.docs.filter((job: any) => job.statusId === 'SERVICE_DRAFT').map((job: any) => {
        return cached[job.systemJobEnumId] = cached[job.systemJobEnumId] ? cached[job.systemJobEnumId] : [{
          ...job,
          id: job.jobId,
          frequency: job.tempExprId,
          enumId: job.systemJobEnumId,
          status: job.statusId
        }]
      });

      // fetching temp expressions
      const tempExpr = Object.values(cached).map((job: any) => {
        // checked that if there is an array of jobs like in case of batch jobs then finding
        // the tempExprId for all the nested jobs
        if (job.length) return [...(job.map((jobInfo: any) => jobInfo.tempExprId))]
        return job.tempExprId
      }).flat()

      await dispatch('fetchJobDescription', Object.keys(cached).map((job: any) => job));
      await dispatch('fetchTemporalExpression', tempExpr)

      commit(types.JOB_UPDATED_BULK, cached);
    }
    return resp;
  },

  async scheduleService({ dispatch }, job) {
    let resp;

    const payload = {
      'JOB_NAME': job.jobName,
      'SERVICE_NAME': job.serviceName,
      'SERVICE_COUNT': '0',
      'SERVICE_TEMP_EXPR': job.jobStatus,
      'jobFields': {
        'productStoreId': this.state.user.currentEComStore.productStoreId,
        'systemJobEnumId': job.systemJobEnumId,
        'tempExprId': job.jobStatus, // Need to remove this as we are passing frequency in SERVICE_TEMP_EXPR, currently kept it for backward compatibility
        'maxRecurrenceCount': '-1',
        'parentJobId': job.parentJobId,
        'runAsUser': 'system', // default system, but empty in run now
        'recurrenceTimeZone': this.state.user.current.userTimeZone,
      },
      'shopifyConfigId': this.state.user.shopifyConfig,
      'statusId': "SERVICE_PENDING",
      'systemJobEnumId': job.systemJobEnumId
    } as any

    // checking if the runtimeData has productStoreId, and if present then adding it on root level
    job?.runtimeData?.productStoreId?.length >= 0 && (payload['productStoreId'] = this.state.user.currentEComStore.productStoreId)
    job?.priority && (payload['SERVICE_PRIORITY'] = job.priority.toString())
    job?.runTime && (payload['SERVICE_TIME'] = job.runTime.toString())

    try {
      resp = await JobService.scheduleJob({ ...job.runtimeData, ...payload });
      if (resp.status == 200 && !hasError(resp)) {
        showToast(translate('Service has been scheduled'))
        dispatch('fetchJobs', {
          inputFields: {
            'systemJobEnumId': payload.systemJobEnumId,
            'systemJobEnumId_op': 'equals'
          }
        })
      } else {
        showToast(translate('Something went wrong'), getResponseError(resp))
      }
    } catch (err) {
      showToast(translate('Something went wrong'), err)
      logger.error(err)
    }
    return resp;
  },

  clearJobState({commit}) {
    commit(types.JOB_PENDING_UPDATED, {jobs: [], total: 0});
    commit(types.JOB_HISTORY_UPDATED, {jobs: [], total: 0});
    commit(types.JOB_RUNNING_UPDATED, {jobs: [], total: 0});
    commit(types.JOB_UPDATED_BULK, {})
  },

  async skipJob({ commit, getters }, job) {
    let skipTime = {};
    const integer1 = getters['getTemporalExpr'](job.tempExprId).integer1;
    const integer2 = getters['getTemporalExpr'](job.tempExprId).integer2
    if(integer1 === 12) {
      skipTime = { minutes: integer2 }
    } else if (integer1 === 10) {
      skipTime = { hours: integer2 }
    } else if (integer1 === 5) {
      skipTime = { days: integer2 }
    } else {
      showToast(translate("This job schedule cannot be skipped"));
      return;
    }
    const time = DateTime.fromMillis(job.runTime).diff(DateTime.local()).plus(skipTime);
    const updatedRunTime = time.toMillis() + DateTime.local().toMillis()
    const payload = {
      'jobId': job.jobId,
      'runTime': updatedRunTime,
      'systemJobEnumId': job.systemJobEnumId,
      'recurrenceTimeZone': this.state.user.current.userTimeZone,
      'statusId': "SERVICE_PENDING"
    } as any

    const resp = await JobService.updateJob(payload)
    if (resp.status === 200 && !hasError(resp) && resp.data.successMessage) {
      commit(types.JOB_UPDATED, { job });
      // TODO: improve the condition to store the current job in state.
      // returning the updated runTime on success as, the job configuration component does not get updated when
      // skipping a job from there.
      return { updatedRunTime: payload.runTime }
    }
    return resp;
  },

  async cancelJob({ dispatch }, job) {
    let resp;

    try {
      resp = await JobService.updateJob({
        jobId: job.jobId,
        systemJobEnumId: job.systemJobEnumId,
        statusId: "SERVICE_CANCELLED",
        recurrenceTimeZone: this.state.user.current.userTimeZone,
        cancelDateTime: DateTime.now().toMillis()
      });
      if (resp.status == 200 && !hasError(resp)) {
        showToast(translate('Service updated successfully'))
        // deleting the enum from cached job as we will not store the job with cancelled status
        dispatch('fetchJobs', {
          inputFields: {
            'systemJobEnumId': job.systemJobEnumId,
            'systemJobEnumId_op': 'equals'
          }
        })
      } else {
        showToast(translate('Something went wrong'), getResponseError(resp))
      }
    } catch (err) {
      showToast(translate('Something went wrong'), err)
      logger.error(err)
      // TODO: explore around handling error, so that we can directly access the response status code
      // This is returned so that response is handled in catch instead of then
      // err is string and when trying to access status it gives error
      return Promise.reject(err)
    }
    return resp;
  },
}
export default actions;