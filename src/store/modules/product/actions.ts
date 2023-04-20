import { ProductService } from "@/services/ProductService";
import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import ProductState from './ProductState'
import * as types from './mutation-types'
import { hasError, showToast, getFeature } from '@/utils'
import { translate } from '@/i18n'
import logger from "@/logger";

const actions: ActionTree<ProductState, RootState> = {

  async getProducts({ commit, state }) {
    let resp;

    const query = state.query

    try {
      resp = await ProductService.getProducts(query);

      if (resp.status === 200 && resp.data.grouped.groupId?.ngroups > 0 && !hasError(resp)) {
        let products = resp.data.grouped.groupId?.groups;
        let totalVirtual = resp.data.grouped.groupId.ngroups;
        let totalVariant = resp.data.grouped.groupId.matches;
        products = products.map((product: any) => {
          return {
            productId: product.groupValue,
            productName: product.doclist.docs[0]?.parentProductName,
            variants: product.doclist.docs.map((variant: any) => {
              return {
                ...variant,
                'color': getFeature(variant.featureHierarchy, '1/COLOR/'),
                'size': getFeature(variant.featureHierarchy, '1/SIZE/')
              }
            })
          }
        })

        if(query.json.params.start && query.json.params.start > 0) products = state.products.list.concat(products);
        if(query.json.query !== "*:*"){
          totalVirtual = state.products.total.virtual
          totalVariant = state.products.total.variant
        }
        commit(types.PRODUCT_LIST_UPDATED, { products, totalVirtual, totalVariant });
      } else {
        showToast(translate("Products not found"));
        commit(types.PRODUCT_LIST_UPDATED, { products: [], totalVirtual: query.json.query === "*:*" ? 0 : state.products.total.virtual, totalVariant: query.json.query === "*:*" ? 0 : state.products.total.variant });
      }
    } catch (error) {
      logger.error(error);
      showToast(translate("Something went wrong"), error);
    }
    return resp;
  },

  setAppliedfiltersAndOperator({ commit, dispatch }, payload){
    commit(types.PRODUCT_ALL_FILTERS_UPDATED, payload)
    dispatch('updateQuery');
  },

  async updateAppliedFilters({ commit, state, dispatch }, payload) {
    commit(types.PRODUCT_FILTER_UPDATED, { id: payload.id, type: payload.type, value: payload.value })
    dispatch('updateQuery')
  },

  async updateAppliedFilterOperator({ commit, state, dispatch }, payload) {
    const appliedFilters = JSON.parse(JSON.stringify((state.appliedFilters as any)[payload.type][payload.id]))
    appliedFilters.operator = payload.value;
    commit(types.PRODUCT_FILTER_UPDATED, {id: payload.id, type: payload.type, value: appliedFilters})
    // If we have list items then only apply filters again
    if(appliedFilters.list.length) dispatch('updateQuery')
  },

  async updateQuery({ commit, dispatch, state }, payload) {
    // initializing the filter always on updateQuery call because we are adding values in the filter
    // as string and if some value is removed then we need to do multiple operations on the filter string
    // to remove that value from the query filter
    state.query.json['filter'] = ["docType: PRODUCT", "groupId: *", `prodCatalogIds: ${this.state.user.currentEComStore.prodCatalogId}`]
    state.query.json['params'] = {
      "group": true,
      "group.field": "groupId",
      "group.limit": 10000,
      "group.ngroups": true,
      "q.op": "AND"
    }
    state.query.json['query'] = "*:*"

    if(payload && payload.queryString) {
      state.query.json.params.defType = 'edismax'
      state.query.json.params.qf = 'productId productName upc sku internalName brandName parentProductName'
      // passed this operator to do not split search string and consider the search string as a single value
      state.query.json.params['q.op'] = 'AND'
      state.query.json.query = `*${payload.queryString}*`
    }

    if (payload) {
      state.query.json.params.rows = payload.viewSize
      state.query.json.params.start = payload.viewSize * payload.viewIndex
    }
    state.query.json['filter'] = Object.keys(state.appliedFilters.included).reduce((filter, value) => {
      const filterValues = (state.appliedFilters.included as any)[value]
      if (filterValues.list.length > 0) {
        filter.push(`${value}: ("${filterValues.list.join('" ' + filterValues.operator + ' "')}")`)
      }
      return filter
    }, state.query.json['filter'])

    state.query.json['filter'] = Object.keys(state.appliedFilters.excluded).reduce((filter, value) => {
      const filterValues = (state.appliedFilters.excluded as any)[value]
      if (filterValues.list.length > 0) {
        filter.push(`-${value}: ("${filterValues.list.join('" ' + filterValues.operator + ' "')}")`)
      }
      return filter
    }, state.query.json['filter'])

    commit(types.PRODUCT_QUERY_UPDATED, state.query)
    await dispatch('getProducts')
  },

  async resetFilters({ commit, state, dispatch }, payload) {
    const appliedFilters = JSON.parse(JSON.stringify((state.appliedFilters as any)[payload.type]))
    const value = Object.keys(appliedFilters).reduce((value: any, filter: any) => {
      value[filter] = {
        list: [],
        operator: "OR"
      }
      return value
    }, {})
    commit(types.PRODUCT_FILTERS_UPDATED, {type: payload.type, value})
    await dispatch('updateQuery')
  },

  async clearAllFilters({ commit, state }) {
    const appliedFilters = JSON.parse(JSON.stringify(state.appliedFilters))
    const value = Object.keys(appliedFilters).reduce((value: any, type: any) => {
      const val = Object.keys(appliedFilters[type]).reduce((val: any, filter: any) => {
        val[filter] = {
          list: [],
          operator: 'OR'
        }
        return val
      }, {})
      value[type] = val
      return value
    }, {})
    commit(types.PRODUCT_ALL_FILTERS_UPDATED, value)
  },

  async clearFilters({ commit, dispatch }, payload) {
    commit(types.PRODUCT_FILTER_UPDATED, {id: payload.id, type: payload.type, value: payload.value})
    await dispatch('updateQuery')
  },
  clearProductList({ commit }){
    commit(types.PRODUCT_LIST_UPDATED, { products: [], totalVirtual: 0, totalVariant: 0 });
  },

  async updateThreshold({ commit }, value) {
    commit(types.PRODUCT_THRESHOLD_UPDATED, value)
  }
}
export default actions;