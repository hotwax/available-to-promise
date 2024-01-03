import { api } from '@/adapter';

const getServiceStatusDesc = async (payload: any): Promise<any> => {
  return api({
    url: "performFind",
    method: "post",
    data: payload,
    cache: true
  });
}

const getShopifyConfig = async (payload: any): Promise <any>  => {
  return api({
    url: "performFind",
    method: "post",
    data: payload
  });
}

const fetchFacilitiesByProductStore = async (payload: any): Promise <any>  => {
  return api({
    url: "performFind",
    method: "post",
    data: payload
  });
}


const fetchChannels = async (payload: any): Promise<any> => {
  return api({
    url: "performFind",
    method: "POST",
    data: payload
  })
}

export const UtilService = {
  fetchFacilitiesByProductStore,
  getServiceStatusDesc,
  getShopifyConfig,
  fetchChannels
}