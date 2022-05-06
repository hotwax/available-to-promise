import { ProductService } from "@/services/ProductService";
import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import ProductState from './ProductState'
import * as types from './mutation-types'
import { hasError, showToast, getFeature } from '@/utils'
import { translate } from '@/i18n'

const actions: ActionTree<ProductState, RootState> = {

  async getProducts({ commit, state }) {
    let resp;

    const query = state.query

    try {
      resp = await ProductService.getProducts(query);

      if (resp.status === 200 && resp.data.grouped.groupId?.ngroups > 0 && !hasError(resp)) {
        let products = resp.data.grouped.groupId?.groups;
        const totalVirtual = resp.data.grouped.groupId.ngroups;
        const totalVariant = resp.data.grouped.groupId.matches;
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
        commit(types.PRODUCT_LIST_UPDATED, { products, totalVirtual, totalVariant });
      } else {
        showToast(translate("Products not found"));
      }
    } catch (error) {
      console.error(error);
      showToast(translate("Something went wrong"));
    }
    return resp;
  },

  async updateAppliedFilters({ commit, state, dispatch }, payload) {
    const value = payload.value
    const appliedFilters = JSON.parse(JSON.stringify((state.appliedFilters as any)[payload.type][payload.id]))
    appliedFilters.includes(value) ? appliedFilters.splice(appliedFilters.indexOf(value), 1) : appliedFilters.push(value)
    commit(types.PRODUCT_APPLIED_FILTERS_UPDATED, {id: payload.id, type: payload.type, value: appliedFilters})
    dispatch('updateQuery')
  },

  async updateQuery({ commit, dispatch, state }, payload) {
    console.log('in updateQuery', payload)
    // initializing the filter always on updateQuery call because we are adding values in the filter
    // as string and if some value is removed then we need to do multiple operations on the filter string
    // to remove that value from the query filter
    state.query.json['filter'] = ["docType: PRODUCT", "groupId: *"]

    if(payload && payload.queryString) {
      state.query.json.params.defType = 'edismax'
      state.query.json.params.qf = 'productId productName sku internalName brandName'
      // passed this operator to do not split search string and consider the search string as a single value
      state.query.json.params['q.op'] = 'AND'
      state.query.json.query = `*${payload.queryString}*`
    }

    state.query.json['filter'] = Object.keys(state.appliedFilters.included).reduce((filter, value) => {
      (state.appliedFilters.included as any)[value].length > 0 && filter.push(`${value}: (${(state.appliedFilters.included as any)[value].join(' OR ')})`)
      return filter
    }, state.query.json['filter'])

    state.query.json['filter'] = Object.keys(state.appliedFilters.excluded).reduce((filter, value) => {
      (state.appliedFilters.excluded as any)[value].length > 0 && filter.push(`-${value}: (${(state.appliedFilters.excluded as any)[value].join(' OR ')})`)
      return filter
    }, state.query.json['filter'])

    console.log(state.query)

    commit(types.PRODUCT_QUERY_UPDATED, state.query)
    await dispatch('getProducts')
  }
}
export default actions;