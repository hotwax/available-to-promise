import api from '@/api'

const getServiceStatusDesc = async (payload: any): Promise<any> => {
  return api({
    url: "performFind",
    method: "post",
    data: payload,
    cache: true
  });
}

const getFacilities = async (payload: any): Promise<any> => {
  return api({
    url: "/performFind",
    method: "POST",
    data: payload
  });
}

export const UtilService = {
  getFacilities,
  getServiceStatusDesc
}