import { UserService } from '@/services/UserService'
import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import UserState from './UserState'
import * as types from './mutation-types'
import { getResponseError, hasError, showToast } from '@/utils'
import { translate } from '@/i18n'
import emitter from '@/event-bus'
import { DateTime, Settings } from 'luxon';



const actions: ActionTree<UserState, RootState> = {

  /**
 * Login user and return token
 */
  async login ({ commit, dispatch }, { username, password }) {
    try {
      const resp = await UserService.login(username, password)
      if (resp.status === 200 && resp.data) {
        if (resp.data.token) {
            commit(types.USER_TOKEN_CHANGED, { newToken: resp.data.token })
            await dispatch('getProfile')
            return resp.data;
        } else if (hasError(resp)) {
          showToast(translate('Sorry, your username or password is incorrect. Please try again.'));
          console.error("error", resp.data._ERROR_MESSAGE_);
          return Promise.reject(new Error(resp.data._ERROR_MESSAGE_));
        }
      } else {
        showToast(translate('Something went wrong'), getResponseError(resp));
        console.error("error", resp.data._ERROR_MESSAGE_);
        return Promise.reject(new Error(resp.data._ERROR_MESSAGE_));
      }
    } catch (err) {
      showToast(translate('Something went wrong'), err);
      console.error("error", err);
      return Promise.reject(new Error(err))
    }
    // return resp
  },

  /**
   * Logout user
   */
  async logout ({ commit }) {
    // TODO add any other tasks if need
    commit(types.USER_END_SESSION)
    this.dispatch('product/clearAllFilters')
    this.dispatch('product/clearProductList');
  },

  /**
   * Get User profile
   */
  async getProfile ( { commit }) {
    const resp = await UserService.getProfile()
    if (resp.status === 200) {
      const payload = {
        "inputFields": {
          "storeName_op": "not-empty"
        },
        "fieldList": ["productStoreId", "storeName"],
        "entityName": "ProductStore",
        "distinct": "Y",
        "noConditionFind": "Y",
        "orderBy": "externalId DESC"
      }
      if (resp.data.userTimeZone) {
        Settings.defaultZone = resp.data.userTimeZone;
      }
      const localTimeZone = DateTime.local().zoneName;
      if (resp.data.userTimeZone !== localTimeZone) {
        emitter.emit('timeZoneDifferent', { profileTimeZone: resp.data.userTimeZone, localTimeZone});
      }

        const eComStoreResp = await UserService.getEComStores(payload);
        if (eComStoreResp.status === 200 && eComStoreResp.data.docs?.length > 0 && !hasError(eComStoreResp)) {
          const userPref =  await UserService.getUserPreference({
            'userPrefTypeId': 'SELECTED_BRAND'
          });
          const stores = eComStoreResp.data.docs
          const userPrefStore = stores.find((store: any) => store.productStoreId == userPref.data.userPrefValue)
          resp.data.stores = stores ? stores : [];
          commit(types.USER_CURRENT_ECOM_STORE_UPDATED, userPrefStore ? userPrefStore : stores ? stores[0]: {});
        }

      commit(types.USER_INFO_UPDATED, resp.data);
    }
  },

  /**
   * update current eComStore information
   */
   async setEcomStore({ commit }, payload) {
    commit(types.USER_CURRENT_ECOM_STORE_UPDATED, payload.eComStore);
    this.dispatch('product/clearAllFilters')
    this.dispatch('product/clearProductList');
    await UserService.setUserPreference({
      'userPrefTypeId': 'SELECTED_BRAND',
      'userPrefValue': payload.eComStore.productStoreId
    });
  },

  /**
   * Update user timeZone
   */
  async setUserTimeZone ( { state, commit }, payload) {
    const resp = await UserService.setUserTimeZone(payload)
    if (resp.status === 200 && !hasError(resp)) {
      const current: any = state.current;
      current.userTimeZone = payload.tzId;
      commit(types.USER_INFO_UPDATED, current);
      Settings.defaultZone = current.userTimeZone;
      showToast(translate("Time zone updated successfully"));
    }
  },

  // Set User Instance Url
  setUserInstanceUrl ({ commit }, payload){
    commit(types.USER_INSTANCE_URL_UPDATED, payload)
  },


  async setEComStore({ commit }, payload) {
    commit(types.USER_CURRENT_ECOM_STORE_UPDATED, payload.store);
  }
}

export default actions;