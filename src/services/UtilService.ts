import api from '@/api';

const fetchFacets = async (payload: any): Promise<any> => {
  return api({
    url: "admin/solrFacets",
    method: "GET",
    params: payload
  });
}

const fetchFacilities = async (payload: any): Promise <any>  => {
  return api({
    url: `admin/productStores/${payload.productStoreId}/facilities`,
    method: "GET",
    params: payload
  });
}

const updateFacility = async (payload: any): Promise <any>  => {
  return api({
    url: `admin/facilities/${payload.facilityId}`,
    method: "PUT",
    data: payload
  });
}

const fetchFacilityGroups = async (payload: any): Promise <any>  => {
  return api({
    url: `admin/productStores/${payload.productStoreId}/facilityGroups`,
    method: "GET",
    params: payload
  });
}

const fetchFacilitiesOrderCount = async (payload: any): Promise <any>  => {
  return api({
    url: `admin/facilities/orderCount`,
    method: "GET",
    params: payload
  });
}

const fetchPickupGroupFacilities = async (payload: any): Promise <any>  => {
  return api({
    url: `admin/facilityGroups/${payload.facilityGroupId}/facilities`,
    method: "GET",
    params: payload
  });
}

const updateFacilityAssociationWithPickupGroup = async (payload: any): Promise <any>  => {
  return api({
    url: `admin/facilityGroups/${payload.facilityGroupId}/facilities/${payload.facilityId}/association`,
    method: "POST",
    data: payload
  });
}

export const UtilService = {
  fetchFacilities,
  fetchFacilitiesOrderCount,
  updateFacility,
  fetchFacilityGroups,
  fetchFacets,
  fetchPickupGroupFacilities,
  updateFacilityAssociationWithPickupGroup
}