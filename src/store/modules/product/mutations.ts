import { MutationTree } from 'vuex'
import ProductState from './ProductState'
import * as types from './mutation-types'

const mutations: MutationTree <ProductState> = {
  [types.PRODUCT_SEARCH_UPDATED] (state, payload) {
    state.products.list = payload.products;
    state.products.total = payload.totalProductsCount;
  },
  [types.PRODUCT_FACETS_UPDATED] (state, payload) {
    state.facets = payload
  }
}
export default mutations;