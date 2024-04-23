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
    let inventoryChannels = JSON.parse(JSON.stringify(state.inventoryChannels))

    if(inventoryChannels.length) return;

    try {
      resp = await ChannelService.fetchInventoryChannels({ facilityGroupTypeId: "CHANNEL_FAC_GROUP" });

      if(!hasError(resp)) {
        inventoryChannels = resp?.data;

        inventoryChannels.map(async (channel: any) => {
          const facilities = await dispatch('fetchGroupConfigFacilities', channel.facilityGroupId)
        })
      } else {
        throw resp.data
      }
    } catch (err: any) {
      logger.error(err)
    }
    commit(types.CHANNEL_INVENTORY_CHANNELS_UPDATED, inventoryChannels)
  },

  async fetchGroupConfigFacilities ({ commit, state }, facilityGroupId) {
    let groupConfigFacilities = {} as any;

    try {
      const resp = await ChannelService.fetchGroupConfigFacilities({ facilityTypeId: 'CONFIGURATION', facilityGroupId: facilityGroupId });

      if(!hasError(resp)) {
        groupConfigFacilities = resp.data;
      } else {
        throw resp.data
      }
    } catch (err: any) {
      logger.error(err)
    }
    return groupConfigFacilities
  },

  async clearChannelState({ commit }) {
    commit(types.CHANNEL_CLEARED)
  },
}

export default actions;