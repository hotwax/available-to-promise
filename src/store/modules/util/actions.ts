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

    if(configFacilities.length && configFacilities[0].productStoreId === store.state.user.currentEComStore.productStoreId) return;

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

  async fetchFacilityGroups ({ commit, state }) {
    let facilityGroups = JSON.parse(JSON.stringify(state.facilityGroups))

    if(facilityGroups.length && facilityGroups[0].productStoreId === store.state.user.currentEComStore.productStoreId) return;
    try {
      const resp = await UtilService.fetchFacilityGroups({ productStoreId: store.state.user.currentEComStore.productStoreId });

      if(!hasError(resp)) {
        facilityGroups = resp.data;
      } else {
        throw resp.data
      }
    } catch (err: any) {
      logger.error(err)
    }
    commit(types.UTIL_FACILITY_GROUPS_UPDATED, facilityGroups)
  },

  async updateAppliedFilters ({ commit, state }, payload) {
    commit(types.UTIL_APPLIED_FILTERS_UPDATED, payload)
  },

  async clearUtilState({ commit }) {
    commit(types.UTIL_CLEARED)
  },

  async clearAppliedFilters({ commit }) {
    commit(types.UTIL_APPLIED_FILTERS_CLEARED)
  },
}

export default actions;