import actions from './actions'
import getters from './getters'
import mutations from './mutations'
import { Module } from 'vuex'
import ProductState from './ProductState'
import RootState from '../../RootState'

const productModule: Module<ProductState, RootState> = {
    namespaced: true,
    state: {
      products: {
        list: [],
        total: {
          virtual: 0,
          variant: 0
        }
      },
      appliedFilters: {
        included: {
          tags: {
            list: [],
            operator: "OR"
          },
        },
        excluded: {
          tags: {
            list: [],
            operator: "OR"
          },
        }
      },
      query: {
        "json": {
          "params": {
            "group": true,
            "group.field": "groupId",
            "group.limit": 10000,
            "group.ngroups": true
          } as any,
          "query": "*:*",
          "filter": ["docType: PRODUCT"]
        }
      },
      threshold: 0
    },
    getters,
    actions,
    mutations,
}

export default productModule;