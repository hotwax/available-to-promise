import { UserService } from '@/services/UserService'
import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import UserState from './UserState'
import * as types from './mutation-types'
import { showToast } from '@/utils'
import { translate } from '@/i18n'
import logger from "@/logger";
import emitter from '@/event-bus'
import { Settings } from "luxon"
import { useAuthStore } from '@hotwax/dxp-components'
import { resetConfig } from '@/adapter'


const actions: ActionTree<UserState, RootState> = {

  /**
 * Login user and return token
 */
  async login ({ commit, dispatch }, payload) {
    try {
      // TODO: implement support for permission check

      const { token, oms, omsRedirectionUrl } = payload;
      dispatch("setUserInstanceUrl", oms);

      emitter.emit("presentLoader", { message: "Logging in...", backdropDismiss: false })
      const api_key = await UserService.login(token)
      
      const userProfile = await UserService.getUserProfile(api_key);
      
      // TODO: fetch only associated product stores for user, currently api does not support this
      userProfile.stores = await UserService.getEComStores(api_key);
      
      if (userProfile.timeZone) {
        Settings.defaultZone = userProfile.timeZone;
      }

      if(omsRedirectionUrl && token) {
        dispatch("setOmsRedirectionInfo", { url: omsRedirectionUrl, token })
      }
      commit(types.USER_TOKEN_CHANGED, { newToken: api_key })
      emitter.emit("dismissLoader")
      commit(types.USER_INFO_UPDATED, userProfile);
      commit(types.USER_CURRENT_ECOM_STORE_UPDATED, userProfile.stores.length ? userProfile.stores[0] : {});
    } catch (err: any) {
      emitter.emit("dismissLoader")
      showToast(translate(err));
      logger.error("error", err);
      return Promise.reject(err instanceof Object ? err :  Error(err))
    }
  },

  /**
   * Logout user
   */
  async logout ({ commit, dispatch }) {
    const authStore = useAuthStore()

    // TODO add any other tasks if need
    commit(types.USER_END_SESSION)
    this.dispatch("rule/clearRuleState")
    this.dispatch("util/clearUtilState")
    dispatch("setOmsRedirectionInfo", { url: "", token: "" })
    resetConfig();

    // reset plugin state on logout
    authStore.$reset()
  },

  
  /**
  * Update user timeZone
  */
  async setUserTimeZone({ state, commit }, payload) {
    const current: any = state.current;
    // TODO: add support to change the user time on server, currently api to update user is not available
    if(current.timeZone !== payload.tzId) {
      current.timeZone = payload.tzId;
      commit(types.USER_INFO_UPDATED, current);
      Settings.defaultZone = current.timeZone;
      showToast(translate("Time zone updated successfully"));
    }
  },

  // Set User Instance Url
  setUserInstanceUrl ({ commit }, payload){
    commit(types.USER_INSTANCE_URL_UPDATED, payload)
  },

  setOmsRedirectionInfo({ commit }, payload) {
    commit(types.USER_OMS_REDIRECTION_INFO_UPDATED, payload)
  },

  setEcomStore({ commit, state }, payload) {
    let productStore = payload.productStore;
    if(!productStore) {
      productStore = (state.current as any).stores.find((store: any) => store.productStoreId === payload.productStoreId);
    }
    commit(types.USER_CURRENT_ECOM_STORE_UPDATED, productStore);
  },

  updatePwaState({ commit }, payload) {
    commit(types.USER_PWA_STATE_UPDATED, payload);
  }
}

export default actions;