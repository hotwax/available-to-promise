import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import * as types from './mutation-types'
import ChannelState from './ChannelState'
import { ChannelService } from '@/services/ChannelService'
import { hasError } from '@/utils'
import logger from '@/logger'
import store from "@/store"

const actions: ActionTree<ChannelState, RootState> = {

  async fetchInventoryChannels ({ commit, state, dispatch }) {
    let resp = {} as any;
    let inventoryChannels = [] as any

    try {
      resp = await ChannelService.fetchInventoryChannels({ facilityGroupTypeId: "CHANNEL_FAC_GROUP", productStoreId: store.state.user.currentEComStore.productStoreId, pageSize: 50 });

      if(!hasError(resp)) {
        inventoryChannels = resp?.data;
      } else {
        throw resp.data
      }
    } catch (err: any) {
      logger.error(err)
    }

    commit(types.CHANNEL_INVENTORY_CHANNELS_UPDATED, inventoryChannels)
    await dispatch('fetchGroupFacilities')
  },
  
  async fetchGroupFacilities ({ commit, state }, facilityGroupId) {
    const groups = JSON.parse(JSON.stringify(state.inventoryChannels))

    if(facilityGroupId) {
      const resp = await ChannelService.fetchGroupFacilities({ facilityGroupId, pageSize: 100 })

      if(!hasError(resp)) {
        const currentGroup = groups.find((group: any) => group.facilityGroupId === facilityGroupId)
        currentGroup.selectedConfigFacility = await resp.data.find((facility: any) => facility.facilityTypeId === "CONFIGURATION")
        currentGroup.selectedFacilities = await resp.data.filter((facility: any) => facility.parentFacilityTypeId !== "VIRTUAL_FACILITY" && facility.facilityTypeId !== "VIRTUAL_FACILITY")
      } else {
        throw resp.data
      }
    } else {
      await Promise.allSettled(groups.map(async (group: any) => {
        try {
          const resp = await ChannelService.fetchGroupFacilities({ facilityGroupId: group.facilityGroupId, pageSize: 100 });
          if(!hasError(resp)) {
            group.selectedConfigFacility = await resp.data.find((facility: any) => facility.facilityTypeId === "CONFIGURATION")
            group.selectedFacilities = await resp.data.filter((facility: any) => (facility.parentFacilityTypeId !== "VIRTUAL_FACILITY" && facility.facilityTypeId !== "VIRTUAL_FACILITY"))
          } else {
            throw resp.data
          }
        } catch (err: any) {
          logger.error(err)
        }
      }))
    }
    commit(types.CHANNEL_INVENTORY_CHANNELS_UPDATED, groups)
  },

  async updateGroup ({ commit, state }, payload) {
    const groups = JSON.parse(JSON.stringify(state.inventoryChannels))

    const selectedGroup = groups.find((group: any) => group.facilityGroupId === payload.facilityGroupId)
    selectedGroup.facilityGroupName = payload.facilityGroupName
    selectedGroup.description = payload.description

    commit(types.CHANNEL_INVENTORY_CHANNELS_UPDATED, groups);
  },

  async clearChannelState({ commit }) {
    commit(types.CHANNEL_INVENTORY_CHANNELS_UPDATED, [])
  },
}

export default actions;