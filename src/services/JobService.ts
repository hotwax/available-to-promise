import { api } from '@/adapter';
import store from "@/store";
import { hasError } from "@/utils";
import logger from "@/logger";

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

const updateJob = async (payload: any): Promise <any>  => {
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
  scheduleJob,
  fetchJob
}