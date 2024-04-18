import api, {client} from '@/api';

const fetchFacets = async (payload: any): Promise<any> => {
  return api({
    url: "solrFacets",
    method: "GET",
    params: payload
  });
}

const fetchConfigFacilities = async (payload: any): Promise <any>  => {
  return api({
    url: `productStores/${payload.productStoreId}/facilities`,
    method: "GET",
    params: payload
  });
}

export const UtilService = {
  fetchConfigFacilities,
  fetchFacets
}