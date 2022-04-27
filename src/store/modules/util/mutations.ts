import { MutationTree } from 'vuex'
import UtilState from './UtilState'
import * as types from './mutation-types'

const mutations: MutationTree <UtilState> = {
  [types.UTIL_FACILITY_LOCATIONS_UPDATED] (state, payload) {
    state.facilityLocations.list = payload.facilities;
    state.facilityLocations.total = payload.total;
  }
}

export default mutations;