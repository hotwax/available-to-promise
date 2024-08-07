import { GetterTree } from 'vuex'
import RootState from '@/store/RootState'
import ChannelState from './ChannelState';

const getters: GetterTree <ChannelState, RootState> = {
  getInventoryChannels (state) {
    return state.inventoryChannels
  },
  getJobs (state) {
    return state.jobs
  },
  getStatusDesc: (state) => (statusId: any) => {
    return state.statusDesc[statusId] ? state.statusDesc[statusId] : "-";
  },
  getTemporalExpr: (state) => (id: string): any  => {
    return state.temporalExp[id];
  },
}
export default getters;