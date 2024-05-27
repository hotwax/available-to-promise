import api, {client} from '@/api';

const fetchFacets = async (payload: any): Promise<any> => {
  return api({
    url: "solrFacets",
    method: "GET",
    params: payload
  });
}

const fetchFacilities = async (payload: any): Promise <any>  => {
  return api({
    url: `productStores/${payload.productStoreId}/facilities`,
    method: "GET",
    params: payload
  });
}

const updateFacility = async (payload: any): Promise <any>  => {
  return api({
    url: `facilities/${payload.facilityId}`,
    method: "PUT",
    data: payload
  });
}

const fetchFacilityGroups = async (payload: any): Promise <any>  => {
  return api({
    url: `productStores/${payload.productStoreId}/facilityGroups`,
    method: "GET",
    params: payload
  });
}

const fetchFacilitiesOrderCount = async (payload: any): Promise <any>  => {
  return api({
    url: `facilities/orderCount`,
    method: "GET",
    params: payload
  });
}

const fetchPickupGroupFacilities = async (payload: any): Promise <any>  => {
  return api({
    url: `facilityGroups/${payload.facilityGroupId}/facilities`,
    method: "GET",
    params: payload
  });
}


export const UtilService = {
  fetchFacilities,
  fetchFacilitiesOrderCount,
  updateFacility,
  fetchFacilityGroups,
  fetchFacets,
  fetchPickupGroupFacilities
}