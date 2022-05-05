import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import JobState from './JobState'
import * as types from './mutation-types'
import { hasError, showToast } from '@/utils'
import { JobService } from '@/services/JobService'
import { translate } from '@/i18n'
import { DateTime } from 'luxon';

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
    const cachedEnum = payload.map((id: any) => state.enumIds[id]);
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
        "statusId": ["SERVICE_CANCELLED", "SERVICE_CRASHED", "SERVICE_FAILED", "SERVICE_FINISHED"],
        "statusId_op": "in",
        "systemJobEnumId_op": "not-empty"
      },
      "fieldList": [ "systemJobEnumId", "runTime", "tempExprId", "parentJobId", "serviceName", "jobId", "jobName", "statusId", "cancelDateTime", "finishDateTime", "startDateTime" ],
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
          resp.data.docs.map((item: any) => {
            enumIds.push(item.systemJobEnumId);
            tempExprList.push(item.tempExprId);
          })
          const tempExpr = [...new Set(tempExprList)];
          dispatch('fetchTemporalExpression', tempExpr);
          dispatch('fetchJobDescription', enumIds);
        }
      } else {
        commit(types.JOB_HISTORY_UPDATED, { jobs: [], total: 0 });
      }
    }).catch((err) => {
      commit(types.JOB_HISTORY_UPDATED, { jobs: [], total: 0 });
      console.error(err);
      showToast(translate("Something went wrong"));
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
        "systemJobEnumId_op": "not-empty",
        "statusId_fld0_value": "SERVICE_RUNNING",
        "statusId_fld0_op": "equals",
        "statusId_fld0_grp": "1",
        "statusId_fld1_value": "SERVICE_QUEUED",
        "statusId_fld1_op": "equals",
        "statusId_fld1_grp": "2",
      },
      "fieldList": [ "systemJobEnumId", "runTime", "tempExprId", "parentJobId", "serviceName", "jobId", "jobName", "statusId" ],
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
          resp.data.docs.map((item: any) => {
            enumIds.push(item.systemJobEnumId);
            tempExprList.push(item.tempExprId);
          })
          const tempExpr = [...new Set(tempExprList)];
          dispatch('fetchTemporalExpression', tempExpr);
          dispatch('fetchJobDescription', enumIds);
        }
      } else {
        commit(types.JOB_RUNNING_UPDATED, { jobs: [], total: 0 });
      }
    }).catch((err) => {
      commit(types.JOB_RUNNING_UPDATED, { jobs: [], total: 0 });
      console.error(err);
      showToast(translate("Something went wrong"));
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
        "statusId": "SERVICE_PENDING",
        "systemJobEnumId_op": "not-empty"
      },
      "fieldList": [ "systemJobEnumId", "runTime", "tempExprId", "parentJobId", "serviceName", "jobId", "jobName", "currentRetryCount", "statusId" ],
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
          resp.data.docs.map((item: any) => {
            enumIds.push(item.systemJobEnumId);
            tempExprList.push(item.tempExprId);
          })
          const tempExpr = [...new Set(tempExprList)];
          dispatch('fetchTemporalExpression', tempExpr);
          dispatch('fetchJobDescription', enumIds);
        }
      } else {
        commit(types.JOB_PENDING_UPDATED, { jobs: [], total: 0 });
      }
    }).catch((err) => {
      commit(types.JOB_PENDING_UPDATED, { jobs: [], total: 0 });
      console.error(err);
      showToast(translate("Something went wrong"));
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
    const cachedTempExpr = tempExprIds.map((id: any) => state.temporalExp[id]);
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
  
  async fetchJobs ({ state, commit, dispatch }, payload) {
    const resp = await JobService.fetchJobInformation({
      "inputFields":{
        "statusId": ['SERVICE_DRAFT', 'SERVICE_PENDING'],
        "statusId_op": "in",
        ...payload.inputFields
      },
      "entityName": "JobSandbox",
      "noConditionFind": "Y",
      "viewSize": (payload.inputFields?.systemJobEnumId?.length * 2)
    })
    if (resp.status === 200 && !hasError(resp) && resp.data.docs) {
      const cached = JSON.parse(JSON.stringify(state.cached)); 

      resp.data.docs.filter((job: any) => job.statusId === 'SERVICE_PENDING').map((job: any) => {
        
        return cached[job.systemJobEnumId] = {
          ...job,
          id: job.jobId,
          frequency: job.tempExprId,
          enumId: job.systemJobEnumId,
          status: job.statusId
        }
      })  

      resp.data.docs.filter((job: any) => job.statusId === 'SERVICE_DRAFT').map((job: any) => {
        return cached[job.systemJobEnumId] = cached[job.systemJobEnumId] ? cached[job.systemJobEnumId] : {
          ...job,
          id: job.jobId,
          frequency: job.tempExprId,
          enumId: job.systemJobEnumId,
          status: job.statusId
        }
      });

      // fetching temp expressions
      const tempExpr = Object.values(cached).map((job: any) => job.tempExprId)
      await dispatch('fetchTemporalExpression', tempExpr)

      commit(types.JOB_UPDATED_BULK, cached);
    }
    return resp;
  },
  async updateJob ({ dispatch }, job) {
    let resp;

    const payload = {
      'jobId': job.jobId,
      'systemJobEnumId': job.systemJobEnumId,
      'recurrenceTimeZone': DateTime.now().zoneName,
      'tempExprId': job.jobStatus,
      'statusId': "SERVICE_PENDING"
    } as any

    job?.runTime && (payload['runTime'] = job.runTime)
    job?.sinceId && (payload['sinceId'] = job.sinceId)
    job?.jobName && (payload['jobName'] = job.jobName)

    try {
      resp = await JobService.updateJob(payload)
      if (resp.status === 200 && !hasError(resp) && resp.data.successMessage) {
        showToast(translate('Service updated successfully'))
        dispatch('fetchJobs', {
          inputFields: {
            'systemJobEnumId': payload.systemJobEnumId,
            'systemJobEnumId_op': 'equals'
          }
        })
      } else {
        showToast(translate('Something went wrong'))
      }
    } catch (err) {
      showToast(translate('Something went wrong'))
      console.error(err)
    }
    return resp;
  },

  async scheduleService({ dispatch }, job) {
    let resp;

    const payload = {
      'JOB_NAME': job.jobName,
      'SERVICE_NAME': job.serviceName,
      'SERVICE_COUNT': '0',
      'jobFields': {
        'productStoreId': this.state.user.currentEComStore.productStoreId,
        'systemJobEnumId': job.systemJobEnumId,
        'tempExprId': job.jobStatus,
        'maxRecurrenceCount': '-1',
        'parentJobId': job.parentJobId,
        'runAsUser': 'system', // default system, but empty in run now
        'recurrenceTimeZone': DateTime.now().zoneName
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
        showToast(translate('Something went wrong'))
      }
    } catch (err) {
      showToast(translate('Something went wrong'))
      console.error(err)
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
      'recurrenceTimeZone': DateTime.now().zoneName,
      'statusId': "SERVICE_PENDING"
    } as any

    const resp = await JobService.updateJob(payload)
    if (resp.status === 200 && !hasError(resp) && resp.data.docs) {
      commit(types.JOB_UPDATED, { job });
    }
    return resp;
  },

  async cancelJob({ dispatch, state }, job) {
    let resp;

    try {
      resp = await JobService.updateJob({
        jobId: job.jobId,
        systemJobEnumId: job.systemJobEnumId,
        statusId: "SERVICE_CANCELLED",
        recurrenceTimeZone: DateTime.now().zoneName,
        cancelDateTime: DateTime.now().toMillis()
      });
      if (resp.status == 200 && !hasError(resp)) {
        showToast(translate('Service updated successfully'))
        state.cached[job.systemJobEnumId].statusId = 'SERVICE_DRAFT'
        state.cached[job.systemJobEnumId].status = 'SERVICE_DRAFT'
        dispatch('fetchJobs', {
          inputFields: {
            'systemJobEnumId': job.systemJobEnumId,
            'systemJobEnumId_op': 'equals'
          }
        })
      } else {
        showToast(translate('Something went wrong'))
      }
    } catch (err) {
      showToast(translate('Something went wrong'))
      console.error(err)
    }
    return resp;
  },
}
export default actions;