import { GetterTree } from 'vuex'
import RootState from '@/store/RootState'
import ChannelState from './ChannelState';

const getters: GetterTree <ChannelState, RootState> = {
  getInventoryChannels (state) {
    return state.inventoryChannels
  }
}
export default getters;