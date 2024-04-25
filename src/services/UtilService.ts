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

const fetchFacilityGroups = async (payload: any): Promise <any>  => {
  return api({
    url: `productStores/${payload.productStoreId}/facilityGroups`,
    method: "GET"
  });
}

export const UtilService = {
  fetchFacilities,
  fetchFacilityGroups,
  fetchFacets
}