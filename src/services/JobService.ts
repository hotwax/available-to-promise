import api from '@/api'
import { translate } from '@/i18n';
import { hasError, showToast } from '@/utils';
import { DateTime } from 'luxon';

const updateJob = async (job: any) => {
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
    resp = await updateJobSandbox(payload)
    if (resp.status === 200 && !hasError(resp) && resp.data.successMessage) {
      showToast(translate('Service updated successfully'))
    } else {
      showToast(translate('Something went wrong'))
    }
  } catch (err) {
    showToast(translate('Something went wrong'))
    console.error(err)
  }
  return resp;
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


export const JobService = {
  fetchJobDescription,
  fetchJobInformation,
  fetchTemporalExpression,
  updateJob,
  updateJobSandbox,
  scheduleJob
}