import { GetterTree } from 'vuex'
import UserState from './UserState'
import RootState from '@/store/RootState'

const getters: GetterTree <UserState, RootState> = {
    getBaseUrl (state) {
      const baseURL = state.instanceUrl;
      return  baseURL.startsWith('http') ? baseURL.includes('/rest/s1') ? baseURL : `${baseURL}/rest/s1/` : `https://${baseURL}.hotwax.io/rest/s1/`;
    },
    getOmsBaseUrl (state) {
      const url = state.omsRedirectionInfo.url
      return url.startsWith('http') ? url.includes('/api') ? url : `${url}/api/` : `https://${url}.hotwax.io/api/`;
    },
    isAuthenticated (state) {
        return !!state.token;
    },
    isUserAuthenticated(state) {
        return state.token && state.current
    },
    getUserToken (state) {
        return state.token
    },
    getUserProfile (state) {
        return state.current
    },
    getInstanceUrl (state) {
        return state.instanceUrl;
    },
    getCurrentEComStore(state) {
        return state.currentEComStore
    },
    getOmsRedirectionInfo(state) {
        return state.omsRedirectionInfo;
    },
    getPwaState(state) {
        return state.pwaState;
    },
    getUserPermissions (state) {
        return state.permissions;
    },
}
export default getters;