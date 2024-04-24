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
    params: payload
  });
}

export const ChannelService = {
  updateFacilityAssociationWithGroup,
  fetchGroupFacilities,
  fetchInventoryChannels,
  updateGroup
}