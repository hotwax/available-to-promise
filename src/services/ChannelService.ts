import api from '@/api';

const fetchInventoryChannels = async (payload: any): Promise <any>  => {
  return api({
    url: 'facilityGroups',
    method: "GET",
    params: payload
  });
}

const fetchGroupConfigFacilities = async (payload: any): Promise <any>  => {
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

export const ChannelService = {
  fetchGroupConfigFacilities,
  fetchInventoryChannels,
  updateGroup
}