import { ProductService } from "@/services/ProductService";
import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import ProductState from './ProductState'
import * as types from './mutation-types'
import { hasError, showToast } from '@/utils'
import { translate } from '@/i18n'
import emitter from '@/event-bus'


const actions: ActionTree<ProductState, RootState> = {

  // Find Product
  async findProduct ({ commit, state }, payload) {

    // Show loader only when new query and not the infinite scroll
    if (payload.viewIndex === 0) emitter.emit("presentLoader");

    let resp;

    try {
      resp = await ProductService.fetchProducts({
        // used sku as we are currently only using sku to search for the product
        "filters": ['sku: ' + payload.queryString],
        "viewSize": payload.viewSize,
        "viewIndex": payload.viewIndex
      })

      // resp.data.response.numFound tells the number of items in the response
      if (resp.status === 200 && resp.data.response.numFound > 0 && !hasError(resp)) {
        let products = resp.data.response.docs;
        const totalProductsCount = resp.data.response.numFound;

        if (payload.viewIndex && payload.viewIndex > 0) products = state.products.list.concat(products)
      } else {
        //showing error whenever getting no products in the response or having any other error
        showToast(translate("Product not found"));
      }
      // Remove added loader only when new query and not the infinite scroll
      if (payload.viewIndex === 0) emitter.emit("dismissLoader");
    } catch(error){
      showToast(translate("Something went wrong"));
    }
    // TODO Handle specific error
    return resp;
  },

  async getProducts({ commit, state }, payload) {
    let resp;

    try {
      resp = await ProductService.getProducts(payload);

      if (resp.status === 200 && resp.data.grouped.groupId?.ngroups > 0 && !hasError(resp)) {
        let products = resp.data.grouped.groupId?.groups;
        const virtualCount = resp.data.grouped.groupId.ngroups;
        const variantCount = resp.data.grouped.groupId.matches;
        products = products.map((product: any) => {
          return {
            productId: product.groupValue,
            productName: product.doclist.docs[0]?.parentProductName,
            variants: product.doclist.docs
          }
        })

        if(payload.json.params.start && payload.json.params.start > 0) products = state.products.list.concat(products);
        commit(types.PRODUCT_LIST_UPDATED, { products, virtualCount, variantCount });
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