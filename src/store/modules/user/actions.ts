import { UserService } from '@/services/UserService'
import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import UserState from './UserState'
import * as types from './mutation-types'
import { hasError, showToast } from '@/utils'
import { translate } from '@/i18n'
import { Settings } from 'luxon';
import logger from "@/logger";
import {
  getServerPermissionsFromRules,
  prepareAppPermissions,
  resetPermissions,
  setPermissions
} from '@/authorization'
import { logout, updateInstanceUrl, updateToken, resetConfig } from '@/adapter'
import { useAuthStore, useProductIdentificationStore } from '@hotwax/dxp-components'
import emitter from '@/event-bus'



const actions: ActionTree<UserState, RootState> = {

  /**
 * Login user and return token
 */
  async login ({ commit, dispatch }, payload) {

    try {
      const {token, oms} = payload;
      dispatch("setUserInstanceUrl", oms);

      // Getting the permissions list from server
      const permissionId = process.env.VUE_APP_PERMISSION_ID;
      // Prepare permissions list
      const serverPermissionsFromRules = getServerPermissionsFromRules();
      if (permissionId) serverPermissionsFromRules.push(permissionId);

      const serverPermissions = await UserService.getUserPermissions({
        permissionIds: serverPermissionsFromRules
      }, token);
      const appPermissions = prepareAppPermissions(serverPermissions);


      // Checking if the user has permission to access the app
      // If there is no configuration, the permission check is not enabled
      if (permissionId) {
        // As the token is not yet set in the state passing token headers explicitly
        // TODO Abstract this out, how token is handled should be part of the method not the callee
        const hasPermission = appPermissions.some((appPermissionId: any) => appPermissionId === permissionId );
        // If there are any errors or permission check fails do not allow user to login
        if (hasPermission) {
          const permissionError = 'You do not have permission to access the app.';
          showToast(translate(permissionError));
          logger.error("error", permissionError);
          return Promise.reject(new Error(permissionError));
        }
      }

      const userProfile = await UserService.getUserProfile(token);
      userProfile.stores = await UserService.getEComStores(token, userProfile.partyId);

      let preferredStore = userProfile.stores.length ?  userProfile.stores[0] : {};

      const preferredStoreId =  await UserService.getPreferredStore(token);
      if (preferredStoreId) {
        const store = userProfile.stores.find((store: any) => store.productStoreId === preferredStoreId);
        store && (preferredStore = store)
      }

      // Get product identification from api using dxp-component
      await useProductIdentificationStore().getIdentificationPref(preferredStoreId ? preferredStoreId : preferredStore.productStoreId)
        .catch((error) => console.error(error));

      // prodCatalogId will be used getting the products instead of productStoreIds as the productStoreIds is tokenized
      // For STORE, the results will have  X_STORE results as well
      preferredStore.prodCatalogId = (await UserService.getEcommerceCatalog(token, preferredStore.productStoreId))?.prodCatalogId;
      /*  ---- Guard clauses ends here --- */

      setPermissions(appPermissions);
      if (userProfile.userTimeZone) {
        Settings.defaultZone = userProfile.userTimeZone;
      }
      updateToken(token)

      // TODO user single mutation
      commit(types.USER_INFO_UPDATED, userProfile);
      commit(types.USER_CURRENT_ECOM_STORE_UPDATED, preferredStore);
      commit(types.USER_PERMISSIONS_UPDATED, appPermissions);
      commit(types.USER_TOKEN_CHANGED, { newToken: token })

    } catch (err: any) {
      // If any of the API call in try block has status code other than 2xx it will be handled in common catch block.
      // TODO Check if handling of specific status codes is required.
      showToast(translate('Something went wrong while login. Please contact administrator'));
      logger.error("error", err);
      return Promise.reject(new Error(err))
    }
  },

  /**
   * Logout user
   */
  async logout ({ commit }, payload) {
    // store the url on which we need to redirect the user after logout api completes in case of SSO enabled
    let redirectionUrl = ''

    emitter.emit('presentLoader', { message: 'Logging out', backdropDismiss: false })

    // Calling the logout api to flag the user as logged out, only when user is authorised
    // if the user is already unauthorised then not calling the logout api as it returns 401 again that results in a loop, thus there is no need to call logout api if the user is unauthorised
    if(!payload?.isUserUnauthorised) {
      let resp = await logout();

      // Added logic to remove the `//` from the resp as in case of get request we are having the extra characters and in case of post we are having 403
      resp = JSON.parse(resp.startsWith('//') ? resp.replace('//', '') : resp)

      if(resp.logoutAuthType == 'SAML2SSO') {
        redirectionUrl = resp.logoutUrl
      }
    }

    const authStore = useAuthStore()

    // TODO add any other tasks if need
    commit(types.USER_END_SESSION)
    this.dispatch('product/clearAllFilters')
    this.dispatch('product/clearProductList');
    this.dispatch('util/clearFacilitiesByProductStore')
    this.dispatch('util/clearShopifyConfig')
    this.dispatch('job/clearJobState');
    resetPermissions();
    resetConfig();

    // reset plugin state on logout
    authStore.$reset()

    // If we get any url in logout api resp then we will redirect the user to the url
    if(redirectionUrl) {
      window.location.href = redirectionUrl
    }

    emitter.emit('dismissLoader')
    return redirectionUrl;
  },

  /**
   * update current eComStore information
   */
   async setEcomStore({ commit }, payload) {
    let productStore = payload.productStore;
    if(!productStore) {
      productStore = this.state.user.current.stores.find((store: any) => store.productStoreId === payload.productStoreId);
    }
    // prodCatalogId will be used getting the products instead of productStoreIds as the productStoreIds is tokenized
    // For STORE, the results will have  X_STORE results as well
    productStore.prodCatalogId = (await UserService.getEcommerceCatalog(undefined, productStore.productStoreId))?.prodCatalogId;

    commit(types.USER_CURRENT_ECOM_STORE_UPDATED, productStore);
    this.dispatch('product/clearAllFilters')
    this.dispatch('product/clearProductList');
    this.dispatch('job/clearJobState');
    await UserService.setUserPreference({
      'userPrefTypeId': 'SELECTED_BRAND',
      'userPrefValue': productStore.productStoreId
    });

    // Get product identification from api using dxp-component
    await useProductIdentificationStore().getIdentificationPref(productStore.productStoreId)
      .catch((error) => console.error(error));
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
    updateInstanceUrl(payload)
  },
}

export default actions;