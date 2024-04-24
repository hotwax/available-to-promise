import api from '@/api';

const fetchInventoryChannels = async (payload: any): Promise <any>  => {
  return api({
    url: 'facilityGroups',
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

export const ChannelService = {
  createFacility,
  createFacilityGroup,
  fetchGroupFacilities,
  fetchInventoryChannels,
  updateFacilityAssociationWithGroup,
  updateFacilityAssociationWithProductStore,
  updateGroupAssociationWithProductStore,
  updateGroup
}