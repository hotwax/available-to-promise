import { MutationTree } from 'vuex'
import UtilState from './UtilState'
import * as types from './mutation-types'

const mutations: MutationTree <UtilState> = {
  [types.UTIL_FACILITY_LOCATIONS_UPDATED] (state, payload) {
    state.facilityLocations = payload
  }
}

export default mutations;