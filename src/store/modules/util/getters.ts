import { GetterTree } from 'vuex'
import UtilState from './UtilState'
import RootState from '@/store/RootState'

const getters: GetterTree<UtilState, RootState> = {
  getConfigFacilities(state) {
    return state.configFacilities ? JSON.parse(JSON.stringify(state.configFacilities)) : []
  },
  getAppliedFilters(state) {
    return state.appliedFilters;
  },
  getFacilityGroups(state) {
    return state.facilityGroups;
  },
}

export default getters;