import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import { UtilService } from '@/services/UtilService'
import { hasError } from '@/utils'
import logger from '@/logger'
import UtilState from './UtilState'
import * as types from './mutation-types'
import store from "@/store"
import { DateTime } from 'luxon'


const actions: ActionTree<UtilState, RootState> = {
  async fetchConfigFacilities ({ commit }) {
    let configFacilities = [];

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

  async fetchFacilityGroups ({ commit }) {
    let facilityGroups = {};

    try {
      const resp = await UtilService.fetchFacilityGroups({ productStoreId: store.state.user.currentEComStore.productStoreId, pageSize: 100 });

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

  async fetchFacilities({ commit, dispatch, state }, payload) {
    const params = {
      parentFacilityTypeId: 'VIRTUAL_FACILITY',
      parentFacilityTypeId_not: 'Y',
      facilityTypeId: 'VIRTUAL_FACILITY',
      facilityTypeId_not: 'Y',
      productStoreId: store.state.user.currentEComStore.productStoreId,
      pageSize: payload.pageSize,
      pageIndex: payload.pageIndex
    }

    const facilities = state.facilities.list ? JSON.parse(JSON.stringify(state.facilities.list)) : [];
    let isScrollable = true, facilityList = [];

    try {
      const resp = await UtilService.fetchFacilities(params)

      if(!hasError(resp)) {
        if(payload.isOrderCountRequired) {
          const facilityIds = resp.data.map((facility: any) => facility.facilityId)
          const facilityCounts = await dispatch("fetchFacilitiesOrderCount", { facilityIds })

          resp.data.map((facility: any) => {
            if(facilityCounts[facility.facilityId]) facility.orderCount = facilityCounts[facility.facilityId]
            else facility.orderCount = 0;
          })
        }

        if(payload.pageIndex && payload.pageIndex > 0) {
          facilityList = facilities.concat(resp.data)
        } else {
          facilityList = resp.data
        }

        if(resp.data.length == payload.pageSize) isScrollable = true
        else isScrollable = false
      } else {
        throw resp.data
      }
    } catch(error) {
      logger.error(error)
    }

    commit(types.UTIL_FACILITY_LIST_UPDATED , { facilities: facilityList, isScrollable });
  },

  async fetchFacilitiesOrderCount({ commit }, payload) {
    const facilitiesData = {} as any;

    try {
      const resp = await UtilService.fetchFacilitiesOrderCount({
        facilityId: payload.facilityIds.join(","),
        facilityId_op: "in",
        entryDate: DateTime.now().toFormat('yyyy-MM-dd')
      })

      if(!hasError(resp)) {
        resp.data.map((facility: any) => {
          facilitiesData[facility.facilityId] = facility.lastOrderCount
        })
      } else {
        throw resp.data
      }
    } catch(error) {
      logger.error(error)
    }
    return facilitiesData;
  },

  async fetchPickupGroups({ commit, dispatch }) {
    let groups = [] as any;
    const pickGroupFacilities = {} as any;

    try {
      const resp = await UtilService.fetchFacilityGroups({ facilityGroupTypeId: 'PICKUP', productStoreId: store.state.user.currentEComStore.productStoreId, pageSize: 100 })

      if(!hasError(resp)) {
        groups = resp.data;
        const responses = await Promise.allSettled(groups.map(async (group: any) => {
          const facilities = await dispatch("fetchPickGroupFacilities", group.facilityGroupId)
          pickGroupFacilities[group.facilityGroupId] = facilities
        }))

        const hasFailedResponse = responses.some((response: any) => response.status === 'rejected')
        if (hasFailedResponse) {
          logger.error("Failed to fetch facilities for some pickup group.")
        }
      } else {
        throw resp.data
      }
    } catch(error) {
      logger.error(error)
    }
    commit(types.UTIL_PICKUP_GROUPS_UPDATED , groups);
    commit(types.UTIL_PICKUP_GROUP_FACILITIES , pickGroupFacilities);
  },

  async fetchPickGroupFacilities({ commit }, facilityGroupId) {
    let pickupGroupFacilities = [] as any;

    try {
      const resp = await UtilService.fetchPickupGroupFacilities({ 
        facilityGroupId,
        pageSize: 100,
        parentFacilityTypeId: 'VIRTUAL_FACILITY',
        parentFacilityTypeId_not: 'Y',
        facilityTypeId: 'VIRTUAL_FACILITY',
        facilityTypeId_not: 'Y',
      })

      if(!hasError(resp)) {
        pickupGroupFacilities = resp.data;
        
      } else {
        throw resp.data
      }
    } catch(error) {
      logger.error(error)
    }
    return pickupGroupFacilities;
  },

  async updatePickupGroupFacilities({ commit }, payload) {
    commit(types.UTIL_PICKUP_GROUP_FACILITIES , payload);
  },

  async updateFacilities({ commit, state }, payload) {
    commit(types.UTIL_FACILITY_LIST_UPDATED , { facilities: payload.facilities, isScrollable: state.facilities.isScrollable });
  },

  async updateSelectedSegment({ commit }, payload) {
    commit(types.UTIL_SELECTED_SEGMENT_UPDATED , payload);
  }
}

export default actions;