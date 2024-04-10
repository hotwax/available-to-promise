import { MutationTree } from 'vuex'
import UtilState from './UtilState'
import * as types from './mutation-types'

const mutations: MutationTree <UtilState> = {
  [types.UTIL_CONFIG_FACILITES_UPDATED] (state, payload) {
      state.configFacilities = payload
  }
}
export default mutations;