import { MutationTree } from 'vuex'
import ProductState from './ProductState'
import * as types from './mutation-types'

const mutations: MutationTree <ProductState> = {
  [types.PRODUCT_LIST_UPDATED] (state, payload) {
    state.products.list = payload.products;
    state.products.total.variant = payload.totalVariant;
    state.products.total.virtual = payload.totalVirtual;
  },
  [types.PRODUCT_FILTER_UPDATED] (state, payload) {
    (state.appliedFilters as any)[payload.type][payload.id] = payload.value
  },
  [types.PRODUCT_QUERY_UPDATED] (state, payload) {
    state.query = payload
  },
  [types.PRODUCT_FILTERS_UPDATED] (state, payload) {
    (state.appliedFilters as any)[payload.type] = payload.value
  }
}
export default mutations;