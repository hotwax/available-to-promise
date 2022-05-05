import { ProductService } from "@/services/ProductService";
import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import ProductState from './ProductState'
import * as types from './mutation-types'
import { hasError, showToast, getFeature } from '@/utils'
import { translate } from '@/i18n'
import emitter from '@/event-bus'


const actions: ActionTree<ProductState, RootState> = {

  async getProducts({ commit, state }, payload) {
    let resp;

    try {
      resp = await ProductService.getProducts(payload);

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

        if(payload.json.params.start && payload.json.params.start > 0) products = state.products.list.concat(products);
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

  async fetchProductFacets({ commit }) {
    const payload = {
      "json": {
        "query": "*:*",
        "filter": "docType: PRODUCT",
        "facet": {
          "tagsFacet": {
            "field": "tags",
            "mincount": 1,
            "limit": -1,
            "sort": "index",
            "type": "terms"
          },
          "productStoreIdFacet": {
            "field": "productStoreIds",
            "limit": -1,
            "sort": "index",
            "type": "terms"
          },
          "productCategoryNameFacet": {
            "field": "productCategoryNames",
            "limit": -1,
            "sort": "index",
            "type": "terms"
          }
        }
      }
    }
    try {
      const resp = await ProductService.fetchProductFacets(payload);
      if (resp.status == 200 && !hasError(resp)) {
        const facets = resp.data.facets;
        const updatedFacets = {} as any;
        delete facets.count;
        Object.entries(facets).map(([facet, value]) => {
          updatedFacets[facet] = (value as any).buckets.map((bucket: any) => bucket.val)
        })
        commit(types.PRODUCT_FACETS_UPDATED, updatedFacets)
      }
    } catch (err) {
      console.error(err)
    }
  }
}
export default actions;