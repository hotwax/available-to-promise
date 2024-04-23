import { GetterTree } from 'vuex'
import RootState from '@/store/RootState'
import ChannelState from './ChannelState';

const getters: GetterTree <ChannelState, RootState> = {
  getInventoryChannels (state) {
    return state.inventoryChannels
  },
  getGroupConfigFacilities (state) {
    return state.groupConfigFacilities
  }
}
export default getters;