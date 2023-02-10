import { api } from '@/adapter';
import store from "@/store";
import logger from "@/logger";
import { hasError } from '@/utils';

const updateJob = async (job: any) => {
  const payload = {
    'jobId': job.jobId,
    'systemJobEnumId': job.systemJobEnumId,
    'recurrenceTimeZone': store.state.user.current.userTimeZone,
    'tempExprId': job.frequency ? job.frequency : job.jobStatus,
    'statusId': "SERVICE_PENDING"
  } as any

  job?.runTime && (payload['runTime'] = job.runTime)
  job?.sinceId && (payload['sinceId'] = job.sinceId)
  job?.jobName && (payload['jobName'] = job.jobName)

  return await updateJobSandbox(payload)
}

const fetchJob = async (payload: any): Promise<any> => {
  let resp;
  const params = {
    "inputFields": {
      "productStoreId": payload.eComStoreId,
      "productStoreId_op": "equals",
      "jobId": payload.jobId.toString(),
      "jobId_op": "equals"
    },
    "fieldList": [ "systemJobEnumId", "runTime", "tempExprId", "parentJobId", "serviceName", "jobId", "jobName", "statusId", "cancelDateTime", "finishDateTime", "startDateTime", "runtimeDataId", "productStoreId" ],
    "noConditionFind": "Y",
  }
  try {
    resp = await fetchJobInformation(params)
    if (resp.status === 200 && resp.data.docs?.length > 0 && !hasError(resp)) {
      const job = resp.data.docs[0];
      job['statusDesc'] = store.state.util.statusDesc[job.statusId];
      await store.dispatch('job/fetchTemporalExpression', [job.tempExprId]);
      await store.dispatch('job/fetchJobDescription', [job.systemJobEnumId]);
      if (job.runtimeData && job.runtimeData.searchPreferenceId) await store.dispatch('job/fetchThresholdRules', [job.runtimeData.searchPreferenceId])
      return job;   
    } else {
      logger.error(resp);
      return {};
    }
  } catch (err) {
    logger.error(err);
    return {}
  }
}

const fetchJobInformation = async (payload: any): Promise <any>  => {
  return api({
    url: "/findJobs",
    method: "post",
    data: payload
  });
}
const fetchJobDescription = async (payload: any): Promise <any>  => {
  return api({
    url: "performFind",
    method: "post",
    data: payload
  });
}

const updateJobSandbox = async (payload: any): Promise <any>  => {
  return api({
    url: "service/updateJobSandbox",
    method: "post",
    data: payload
  });
}

const scheduleJob = async (payload: any): Promise <any>  => {
  return api({
    url: "scheduleService",
    method: "post",
    data: payload
  });
}

const fetchTemporalExpression = async (payload: any): Promise <any>  => {
  return api({
    url: "performFind",
    method: "post",
    data: payload
  });
}

const fetchThresholdRules = async (payload: any): Promise <any>  => {
  return api({
    url: "performFind",
    method: "post",
    data: payload
  });
}


export const JobService = {
  fetchJobDescription,
  fetchJobInformation,
  fetchTemporalExpression,
  fetchThresholdRules,
  updateJob,
  updateJobSandbox,
  scheduleJob,
  fetchJob
}