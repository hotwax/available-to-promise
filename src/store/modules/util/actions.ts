import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import { UtilService } from '@/services/UtilService'
import { hasError } from '@/utils'
import logger from '@/logger'
import UtilState from './UtilState'
import * as types from './mutation-types'
import store from "@/store"


const actions: ActionTree<UtilState, RootState> = {
  async fetchConfigFacilities ({ commit, state }) {
    let configFacilities = JSON.parse(JSON.stringify(state.configFacilities))

    if(configFacilities.length) return;

    try {
      const resp = await UtilService.fetchFacilities({ facilityTypeId: 'CONFIGURATION', productStoreId: store.state.user.currentEComStore.productStoreId });

      if(!hasError(resp)) {
        configFacilities = resp.data;
      } else {
        throw resp.data
      }
    } catch (err: any) {
      logger.error(err)
    }
    commit(types.UTIL_CONFIG_FACILITES_UPDATED, configFacilities)
  },

  async fetchFacilities ({ commit, state }) {
    let facilities = JSON.parse(JSON.stringify(state.facilities))

    if(facilities.length) return;

    try {
      const resp = await UtilService.fetchFacilities({ productStoreId: store.state.user.currentEComStore.productStoreId });

      if(!hasError(resp)) {
        facilities = resp.data;
      } else {
        throw resp.data
      }
    } catch (err: any) {
      logger.error(err)
    }
    commit(types.UTIL_FACILITES_UPDATED, facilities)
  },

  async updateAppliedFilters ({ commit, state }, payload) {
    commit(types.UTIL_APPLIED_FILTERS_UPDATED, payload)
  },

  async clearUtilState({ commit }) {
    commit(types.UTIL_CLEARED)
  },
}

export default actions;