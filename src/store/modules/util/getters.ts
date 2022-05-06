import { GetterTree } from 'vuex'
import UtilState from './UtilState'
import RootState from '@/store/RootState'

const getters: GetterTree <UtilState, RootState> = {
  getStatusDesc: (state) => (statusId: any) => {
    return state.statusDesc[statusId] ? state.statusDesc[statusId] : "-";
  },
  getShopifyConfig(state) {
    return state.shopifyConfig
  },
  getFacilityByProductStore(state) {
    return state.facilitiesByProductStore
  }
}
export default getters;