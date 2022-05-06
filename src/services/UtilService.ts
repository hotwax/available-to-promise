import api from '@/api'

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

const fetchFacilitiesForProductStore = async (payload: any): Promise <any>  => {
  return api({
    url: "performFind",
    method: "post",
    data: payload
  });
}

export const UtilService = {
  fetchFacilitiesForProductStore,
  getServiceStatusDesc,
  getShopifyConfig
}