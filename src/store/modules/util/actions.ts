import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import * as types from './mutation-types'
import { hasError, showToast } from '@/utils'
import UtilState from './UtilState'
import { UtilService } from '@/services/UtilService'
import { translate } from '@/i18n'

const actions: ActionTree<UtilState, RootState> = {
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