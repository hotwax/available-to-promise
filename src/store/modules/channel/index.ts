import actions from './actions'
import getters from './getters'
import mutations from './mutations'
import { Module } from 'vuex'
import RootState from '@/store/RootState'
import ChannelState from './ChannelState'

const channelModule: Module<ChannelState, RootState> = {
  namespaced: true,
  state: {
    inventoryChannels: [],
    groupConfigFacilities: []
  },
  getters,
  actions,
  mutations,
}

export default channelModule;