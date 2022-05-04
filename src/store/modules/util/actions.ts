import { UtilService } from '@/services/UtilService'
import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import UtilState from './UtilState'
import * as types from './mutation-types'
import { hasError } from '@/utils'

const actions: ActionTree<UtilState, RootState> = {
  /**
   * Status Description
   */
  async getServiceStatusDesc ({ commit }) {
    try{
      const resp = await UtilService.getServiceStatusDesc({
        "inputFields": {
          "statusTypeId": "SERVICE_STATUS",
          "statusTypeId_op": "equals"
        },
        "entityName": "StatusItem",
        "fieldList": ["statusId", "description"],
        "noConditionFind": "Y",
        "viewSize": 20
      }) 
      if (resp.status === 200 && !hasError(resp) && resp.data.count) {
        commit(types.UTIL_SERVICE_STATUS_DESC_UPDATED, resp.data.docs);
      }
    } catch(err) {
      console.error(err)
    }
  },

  async getShopifyConfig({ commit }, payload) {
    const resp = await UtilService.getShopifyConfig({
      "inputFields": {
        "productStoreId": payload
      },
      "entityName": "ShopifyConfig",
      "noConditionFind": "Y",
      "fieldList": ["shopifyConfigId", "productStoreId"]
    })

    if (resp.status === 200 && !hasError(resp)) {
      commit(types.UTIL_SHOPIFY_CONFIG_UPDATED, resp.data.docs?.length > 0 ? resp.data.docs[0] : {});
      return resp.data.docs[0];
    }
  },
}

export default actions;