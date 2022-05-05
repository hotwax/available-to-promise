import { UtilService } from '@/services/UtilService'
import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import UtilState from './UtilState'
import * as types from './mutation-types'
import { hasError } from '@/utils'
import { translate } from '@/i18n'

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

  async getFacilities({ commit }, payload) {
    let resp 

    try{
      resp = await UtilService.getFacilities(payload);
      if(resp.status === 200 && resp.data.docs?.length && resp.data.docs?.length > 0 && !hasError(resp)) {
        const facilities = resp.data.docs;
        
        commit(types.UTIL_FACILITY_LOCATIONS_UPDATED, facilities);
      } else {
        showToast(translate("Something went wrong"));
        commit(types.UTIL_FACILITY_LOCATIONS_UPDATED, []);
      }
    } catch (error) {
      showToast(translate("Something went wrong"));
      console.error(error);
    }
    return resp;
  }
}

export default actions;