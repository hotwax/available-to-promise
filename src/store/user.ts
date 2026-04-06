import { defineStore } from 'pinia'
import { client } from '@/api'
import { hasError, showToast } from '@/utils'
import { translate } from '@hotwax/dxp-components';
import logger from "@/logger";
import emitter from '@/event-bus'
import { Settings } from "luxon"
import { useAuthStore } from '@hotwax/dxp-components'
import { resetConfig } from '@/adapter'
import { prepareAppPermissions, resetPermissions, setPermissions } from "@/authorization"
import { useRuleStore } from '@/store/rule'
import { useUtilStore } from '@/store/util'
import { getServerPermissionsFromRules } from "@/authorization"

export interface UserState {
  token: string;
  current: any;
  instanceUrl: string;
  currentEComStore: any;
  omsRedirectionInfo: {
    url: string;
    token: string;
  };
  pwaState: {
    registration: any;
    updateExists: boolean;
  };
  permissions: any[];
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: '',
    current: {},
    instanceUrl: '',
    currentEComStore: {},
    omsRedirectionInfo: {
      url: '',
      token: ''
    },
    pwaState: {
      registration: null,
      updateExists: false
    },
    permissions: []
  }),
  getters: {
    getBaseUrl: (state: UserState): string => {
      const baseURL = state.instanceUrl;
      return baseURL.startsWith('http') ? baseURL.includes('/rest/s1') ? baseURL : `${baseURL}/rest/s1/` : `https://${baseURL}.hotwax.io/rest/s1/`;
    },
    getOmsBaseUrl: (state: UserState): string => {
      const url = state.omsRedirectionInfo.url
      return url.startsWith('http') ? url.includes('/api') ? url : `${url}/api/` : `https://${url}.hotwax.io/api/`;
    },
    isAuthenticated: (state: UserState): boolean => !!state.token,
    isUserAuthenticated: (state: UserState): boolean => !!(state.token && state.current),
    getUserToken: (state: UserState): string => state.token,
    getUserProfile: (state: UserState): any => state.current,
    getInstanceUrl: (state: UserState): string => state.instanceUrl,
    getCurrentEComStore: (state: UserState): any => state.currentEComStore,
    getOmsRedirectionInfo: (state: UserState): any => state.omsRedirectionInfo,
    getPwaState: (state: UserState): any => state.pwaState,
    getUserPermissions: (state: UserState): any[] => state.permissions,
  },
  actions: {
    async login(payload: any) {
      try {
        const { token, oms, omsRedirectionUrl } = payload;
        this.setUserInstanceUrl(oms);

        const permissionId = process.env.VUE_APP_PERMISSION_ID;
        const serverPermissionsFromRules = getServerPermissionsFromRules();
        if (permissionId) serverPermissionsFromRules.push(permissionId);
        
        const serverPermissions: Array<string> = await getUserPermissions({
          permissionIds: [...new Set(serverPermissionsFromRules)]
        }, omsRedirectionUrl, token);
        
        const appPermissions = prepareAppPermissions(serverPermissions);
        
        if (permissionId) {
          const hasPermission = appPermissions.some((appPermission: any) => appPermission.action === permissionId);
          if (!hasPermission) {
            const permissionError = 'You do not have permission to access the app.';
            showToast(translate(permissionError));
            logger.error("error", permissionError);
            return Promise.reject(new Error(permissionError));
          }
        }

        emitter.emit("presentLoader", { message: "Logging in...", backdropDismiss: false })
        
        let api_key = ""
        try {
          const resp = await client({
            url: "admin/login",
            method: "post",
            baseURL: this.getBaseUrl,
            params: { token },
            headers: { "Content-Type": "application/json" }
          }) as any;

          if (!hasError(resp) && (resp.data.api_key || resp.data.token)) {
            api_key = resp.data.api_key || resp.data.token
          } else {
            throw "Sorry, login failed. Please try again";
          }
        } catch (err) {
          throw "Sorry, login failed. Please try again";
        }

        let userProfile = {} as any
        let resp = await client({
          url: "admin/user/profile",
          method: "GET",
          baseURL: this.getBaseUrl,
          headers: {
            "api_key": api_key,
            "Content-Type": "application/json"
          }
        });
        if (hasError(resp)) throw "Error getting user profile";
        userProfile = resp.data

        resp = await client({
          url: "admin/user/productStore",
          method: "GET",
          baseURL: this.getBaseUrl,
          headers: {
            "api_key": api_key,
            "Content-Type": "application/json"
          }
        });
        if (hasError(resp) || resp.data.length === 0) {
          throw resp.data;
        } else {
          userProfile.stores = resp.data;
        }

        if (userProfile.timeZone) {
          Settings.defaultZone = userProfile.timeZone;
        }

        setPermissions(appPermissions);
        if (omsRedirectionUrl && token) {
          this.setOmsRedirectionInfo({ url: omsRedirectionUrl, token })
        }
        
        this.token = api_key;
        emitter.emit("dismissLoader")
        this.current = userProfile;
        this.permissions = appPermissions;
        this.currentEComStore = userProfile.stores.length ? userProfile.stores[0] : {};
      } catch (err: any) {
        emitter.emit("dismissLoader")
        showToast(translate(err));
        logger.error("error", err);
        return Promise.reject(err instanceof Object ? err : Error(err))
      }
    },
    async logout() {
      const authStore = useAuthStore()
      const ruleStore = useRuleStore()
      const utilStore = useUtilStore()

      this.token = ''
      this.current = {}
      this.currentEComStore = {}
      this.permissions = []
      
      ruleStore.clearRuleState()
      utilStore.clearUtilState()
      
      this.setOmsRedirectionInfo({ url: "", token: "" })
      resetConfig();
      resetPermissions();
      authStore.$reset()
    },
    async setUserTimeZone(payload: any) {
      const current: any = this.current;
      if (current.timeZone !== payload.tzId) {
        current.timeZone = payload.tzId;
        this.current = current;
        Settings.defaultZone = current.timeZone;
        showToast(translate("Time zone updated successfully"));
      }
    },
    setUserInstanceUrl(payload: any) {
      this.instanceUrl = payload;
    },
    setOmsRedirectionInfo(payload: any) {
      this.omsRedirectionInfo = payload;
    },
    setEcomStore(payload: any) {
      let productStore = payload.productStore;
      if (!productStore) {
        productStore = this.current.stores.find((store: any) => store.productStoreId === payload.productStoreId);
      }
      this.currentEComStore = productStore;
    },
    updatePwaState(payload: any) {
      this.pwaState.registration = payload.registration;
      this.pwaState.updateExists = payload.updateExists;
    }
  },
  persist: true
})

async function getUserPermissions(payload: any, url: string, token: any): Promise<any> {
  const baseURL = url.startsWith('http') ? url.includes('/api') ? url : `${url}/api/` : `https://${url}.hotwax.io/api/`;
  let serverPermissions = [] as any;

  if (payload.permissionIds && payload.permissionIds.length == 0) return serverPermissions;
  const viewSize = 200;

  try {
    const params = {
      "viewIndex": 0,
      viewSize,
      permissionIds: payload.permissionIds
    }
    const resp = await client({
      url: "getPermissions",
      method: "post",
      baseURL,
      data: params,
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    }) as any
    if (resp.status === 200 && resp.data.docs?.length && !hasError(resp)) {
      serverPermissions = resp.data.docs.map((permission: any) => permission.permissionId);
      const total = resp.data.count;
      const remainingPermissions = total - serverPermissions.length;
      if (remainingPermissions > 0) {
        const apiCallsNeeded = Math.floor(remainingPermissions / viewSize) + (remainingPermissions % viewSize != 0 ? 1 : 0);
        const responses = await Promise.all([...Array(apiCallsNeeded).keys()].map(async (index: any) => {
          const response = await client({
            url: "getPermissions",
            method: "post",
            baseURL,
            data: {
              "viewIndex": index + 1,
              viewSize,
              permissionIds: payload.permissionIds
            },
            headers: {
              Authorization: 'Bearer ' + token,
              'Content-Type': 'application/json'
            }
          })
          if (!hasError(response)) {
            return Promise.resolve(response);
          } else {
            return Promise.reject(response);
          }
        }))
        const permissionResponses = {
          success: [],
          failed: []
        } as any
        responses.reduce((permissionResponses: any, permissionResponse: any) => {
          if (permissionResponse.status !== 200 || hasError(permissionResponse) || !permissionResponse.data?.docs) {
            permissionResponses.failed.push(permissionResponse);
          } else {
            permissionResponses.success.push(permissionResponse);
          }
          return permissionResponses;
        }, permissionResponses)

        serverPermissions = permissionResponses.success.reduce((serverPermissions: any, response: any) => {
          serverPermissions.push(...response.data.docs.map((permission: any) => permission.permissionId));
          return serverPermissions;
        }, serverPermissions)

        if (permissionResponses.failed.length > 0) Promise.reject("Something went wrong while getting complete user permissions.");
      }
    }
    return serverPermissions;
  } catch (error: any) {
    return Promise.reject(error);
  }
}
