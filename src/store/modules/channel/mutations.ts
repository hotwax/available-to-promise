import { MutationTree } from 'vuex'
import ChannelState from './ChannelState';
import * as types from './mutation-types'

const mutations: MutationTree <ChannelState> = {
  [types.CHANNEL_INVENTORY_CHANNELS_UPDATED] (state, payload) {
    state.inventoryChannels = payload;
  },
}
export default mutations;