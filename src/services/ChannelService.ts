import api from '@/api';
import logger from '@/logger';
import { hasError } from '@/utils';

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
  return api({
    url: "performFind",
    method: "post",
    data: payload,
    useOmsRedirection: true
  });
}

const fetchJobInformation = async (payload: any): Promise <any>  => {
  let jobs = [];

  try {
    const resp = await api({
      url: "findJobs",
      method: "post",
      data: payload,
      useOmsRedirection: true
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
  return api({
    url: "performFind",
    method: "post",
    data: payload,
    useOmsRedirection: true,
    cache: true
  });
}

const fetchTemporalExpression = async (payload: any): Promise <any>  => {
  return api({
    url: "performFind",
    method: "post",
    data: payload,
    useOmsRedirection: true,
  });
}

const disableJob = async (payload: any): Promise <any> => {
  return api({
    url: "service/cancelScheduledJob",
    method: "post",
    data: payload,
    useOmsRedirection: true,
  });
}

const scheduleJob = async (payload: any): Promise <any>  => {
  return api({
    url: "scheduleService",
    method: "post",
    data: payload
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
  updateGroup
}