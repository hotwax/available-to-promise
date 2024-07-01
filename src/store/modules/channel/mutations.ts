import { MutationTree } from 'vuex'
import ChannelState from './ChannelState';
import * as types from './mutation-types'

const mutations: MutationTree <ChannelState> = {
  [types.CHANNEL_INVENTORY_CHANNELS_UPDATED] (state, payload) {
    state.inventoryChannels = payload;
  },
  [types.CHANNEL_JOBS_UPDATED] (state, payload) {
    state.jobs = payload;
  },
  [types.CHANNEL_SERVICE_STATUS_DESC_UPDATED] (state, payload) {
    payload.map((status: any) => {
      state.statusDesc[status.statusId] = status.description;
    })
  },
  [types.CHANNEL_TEMPORAL_EXPRESSION_UPDATED] (state, temporalExp) {
    state.temporalExp = temporalExp;
  },
}
export default mutations;