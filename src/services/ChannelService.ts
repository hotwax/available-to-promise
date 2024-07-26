import api, {client} from '@/api';
import logger from '@/logger';
import { hasError } from '@/utils';
import store from '@/store';

const fetchInventoryChannels = async (payload: any): Promise <any>  => {
  return api({
    url: `productStores/${payload.productStoreId}/facilityGroups`,
    method: "GET",
    params: payload
  });
}

const fetchGroupFacilities = async (payload: any): Promise <any>  => {
  return api({
    url: `facilityGroups/${payload.facilityGroupId}/facilities`,
    method: "GET",
    params: payload
  });
}

const updateGroup = async (payload: any): Promise <any>  => {
  return api({
    url: `facilityGroups/${payload.facilityGroupId}`,
    method: "PUT",
    params: payload
  });
}

const updateFacilityAssociationWithGroup = async (payload: any): Promise <any>  => {
  return api({
    url: `facilityGroups/${payload.facilityGroupId}/facilities/${payload.facilityId}/association`,
    method: "POST",
    data: payload
  });
}

const updateFacilityAssociationWithProductStore = async (payload: any): Promise <any>  => {
  return api({
    url: `/productStores/${payload.productStoreId}/facilities/${payload.facilityId}/association`,
    method: "POST",
    data: payload
  });
}

const updateGroupAssociationWithProductStore = async (payload: any): Promise <any>  => {
  return api({
    url: `/productStores/${payload.productStoreId}/facilityGroups/${payload.facilityGroupId}/association`,
    method: "POST",
    data: payload
  });
}

const createFacilityGroup = async (payload: any): Promise <any>  => {
  return api({
    url: "facilityGroups",
    method: "POST",
    data: payload
  });
}

const createFacility = async (payload: any): Promise <any>  => {
  return api({
    url: "facilities",
    method: "POST",
    data: payload
  });
}

const fetchShopifyConfigs = async (payload: any): Promise<any> => {
  const omsRedirectionInfo = store.getters["user/getOmsRedirectionInfo"]
  const baseURL = omsRedirectionInfo.url.startsWith('http') ? omsRedirectionInfo.url.includes('/api') ? omsRedirectionInfo.url : `${omsRedirectionInfo.url}/api/` : `https://${omsRedirectionInfo.url}.hotwax.io/api/`;

  return client({
    url: "performFind",
    method: "post",
    baseURL,
    data: payload,
    headers: {
      "Authorization":  'Bearer ' + omsRedirectionInfo.token,
      'Content-Type': 'application/json'
    }
  });
}

const fetchJobInformation = async (payload: any): Promise <any>  => {
  const omsRedirectionInfo = store.getters["user/getOmsRedirectionInfo"]
  const baseURL = omsRedirectionInfo.url.startsWith('http') ? omsRedirectionInfo.url.includes('/api') ? omsRedirectionInfo.url : `${omsRedirectionInfo.url}/api/` : `https://${omsRedirectionInfo.url}.hotwax.io/api/`;

  let jobs = [];

  try {
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

    if(!hasError(resp)) {
      jobs = resp.data.docs
    } else {
      throw resp.data;
    }
  } catch(error: any) {
    logger.error(error);
  }

  return jobs;
}

const getServiceStatusDesc = async (payload: any): Promise<any> => {
  const omsRedirectionInfo = store.getters["user/getOmsRedirectionInfo"]
  const baseURL = omsRedirectionInfo.url.startsWith('http') ? omsRedirectionInfo.url.includes('/api') ? omsRedirectionInfo.url : `${omsRedirectionInfo.url}/api/` : `https://${omsRedirectionInfo.url}.hotwax.io/api/`;

  return client({
    url: "performFind",
    method: "post",
    data: payload,
    baseURL,
    headers: {
      "Authorization":  'Bearer ' + omsRedirectionInfo.token,
      'Content-Type': 'application/json'
    },
    cache: true
  });
}

const fetchTemporalExpression = async (payload: any): Promise <any>  => {
  const omsRedirectionInfo = store.getters["user/getOmsRedirectionInfo"]
  const baseURL = omsRedirectionInfo.url.startsWith('http') ? omsRedirectionInfo.url.includes('/api') ? omsRedirectionInfo.url : `${omsRedirectionInfo.url}/api/` : `https://${omsRedirectionInfo.url}.hotwax.io/api/`;

  return client({
    url: "performFind",
    method: "post",
    baseURL,
    data: payload,
    headers: {
      "Authorization":  'Bearer ' + omsRedirectionInfo.token,
      'Content-Type': 'application/json'
    }
  });
}

const disableJob = async (payload: any): Promise <any> => {
  const omsRedirectionInfo = store.getters["user/getOmsRedirectionInfo"]
  const baseURL = omsRedirectionInfo.url.startsWith('http') ? omsRedirectionInfo.url.includes('/api') ? omsRedirectionInfo.url : `${omsRedirectionInfo.url}/api/` : `https://${omsRedirectionInfo.url}.hotwax.io/api/`;

  return client({
    url: "service/cancelScheduledJob",
    method: "post",
    baseURL,
    data: payload,
    headers: {
      "Authorization":  'Bearer ' + omsRedirectionInfo.token,
      'Content-Type': 'application/json'
    }
  });
}

const scheduleJob = async (payload: any): Promise <any>  => {
  const omsRedirectionInfo = store.getters["user/getOmsRedirectionInfo"]
  const baseURL = omsRedirectionInfo.url.startsWith('http') ? omsRedirectionInfo.url.includes('/api') ? omsRedirectionInfo.url : `${omsRedirectionInfo.url}/api/` : `https://${omsRedirectionInfo.url}.hotwax.io/api/`;

  return client({
    url: "scheduleService",
    method: "post",
    baseURL,
    data: payload,
    headers: {
      "Authorization":  'Bearer ' + omsRedirectionInfo.token,
      'Content-Type': 'application/json'
    }
  });
}

const updateJob = async (payload: any): Promise <any>  => {
  const omsRedirectionInfo = store.getters["user/getOmsRedirectionInfo"]
  const baseURL = omsRedirectionInfo.url.startsWith('http') ? omsRedirectionInfo.url.includes('/api') ? omsRedirectionInfo.url : `${omsRedirectionInfo.url}/api/` : `https://${omsRedirectionInfo.url}.hotwax.io/api/`;

  return client({
    url: "service/updateJobSandbox",
    method: "post",
    baseURL,
    data: payload,
    headers: {
      "Authorization":  'Bearer ' + omsRedirectionInfo.token,
      'Content-Type': 'application/json'
    }
  });
}

export const ChannelService = {
  createFacility,
  createFacilityGroup,
  disableJob,
  fetchGroupFacilities,
  fetchInventoryChannels,
  fetchJobInformation,
  fetchShopifyConfigs,
  fetchTemporalExpression,
  getServiceStatusDesc,
  scheduleJob,
  updateFacilityAssociationWithGroup,
  updateFacilityAssociationWithProductStore,
  updateGroupAssociationWithProductStore,
  updateGroup,
  updateJob
}