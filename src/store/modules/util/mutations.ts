import { MutationTree } from 'vuex'
import UtilState from './UtilState'
import * as types from './mutation-types'

const mutations: MutationTree <UtilState> = {
  [types.UTIL_CONFIG_FACILITES_UPDATED] (state, payload) {
    state.configFacilities = payload
  },
  [types.UTIL_APPLIED_FILTERS_UPDATED] (state, payload) {
    state.appliedFilters = payload
  },
  [types.UTIL_FACILITY_GROUPS_UPDATED] (state, payload) {
    state.facilityGroups = payload
  },
  [types.UTIL_CLEARED] (state) {
    state.configFacilities = [],
    state.appliedFilters = {
      included: {
        tags: [],
        productFeatures: []
      },
      excluded: {
        tags: [],
        productFeatures: []
      }
    }
  },
  [types.UTIL_APPLIED_FILTERS_CLEARED](state) {
    state.appliedFilters = {
      included: {
        tags: [],
        productFeatures: []
      },
      excluded: {
        tags: [],
        productFeatures: []
      }
    }
  },
  [types.UTIL_FACILITY_LIST_UPDATED](state, payload) {
    state.facilities.list = payload.facilities
    state.facilities.isScrollable = payload.isScrollable
  },
  [types.UTIL_SELECTED_SEGMENT_UPDATED](state, payload) {
    state.selectedSegment = payload
  },
  [types.UTIL_PICKUP_GROUPS_UPDATED](state, payload) {
    state.pickupGroups = payload
  },
}
export default mutations;