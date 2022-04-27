import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import * as types from './mutation-types'
import { hasError, showToast } from '@/utils'
import UtilState from './UtilState'
import { UtilService } from '@/services/UtilService'
import { translate } from '@/i18n'

const actions: ActionTree<UtilState, RootState> = {
  async getFacilities({ commit, state }, payload) {
    let resp 

    try{
      resp = await UtilService.getFacilities(payload);
      if(resp.status === 200 && resp.data.docs?.length && resp.data.docs?.length > 0 && !hasError(resp)) {
        let facilities = resp.data.docs;
        const total = resp.data.count;
        
        if(payload.viewIndex && payload.viewIndex > 0) facilities = state.facilityLocations.list.concat(facilities);
        commit(types.UTIL_FACILITY_LOCATIONS_UPDATED, { facilities, total });
      } else {
        showToast(translate("Something went wrong"));
        commit(types.UTIL_FACILITY_LOCATIONS_UPDATED, { facilities: [], total: 0 });
      }
    } catch (error) {
      showToast(translate("Something went wrong"));
      console.error(error);
    }
    return resp;
  }
}

export default actions;