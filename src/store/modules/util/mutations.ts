import { MutationTree } from 'vuex'
import UtilState from './UtilState'
import * as types from './mutation-types'

const mutations: MutationTree <UtilState> = {
    [types.UTIL_FEATURES_BY_TYPE_UPDATED] (state, payload) {
        state.featuresByType = payload
    },
    [types.UTIL_PRODUCT_TAGS_UPDATED] (state, payload) {
        state.tags = payload
    }
}
export default mutations;