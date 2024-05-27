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
  getFacilities(state) {
    return state.facilities.list ? JSON.parse(JSON.stringify(state.facilities.list)) : []
  },
  isFacilitiesScrollable(state) {
    return state.facilities.isScrollable
  },
  getSelectedSegment(state) {
    return state.selectedSegment
  },
  getPickupGroups(state) {
    return state.pickupGroups
  },
  getPickupGroupFacilities(state) {
    return state.pickupGroupFacilities
  },
}

export default getters;