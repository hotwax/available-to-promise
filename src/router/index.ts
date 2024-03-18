import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import SelectFacility from '@/views/SelectFacility.vue'
import SelectFacilityCSVUpload from '@/views/SelectFacilityCSVUpload.vue'
import SelectProduct from '@/views/SelectProduct.vue'
import SelectProductCSVUpload from '@/views/SelectProductCSVUpload.vue'
import ThresholdUpdates from '@/views/ThresholdUpdates.vue'
import Settings from "@/views/Settings.vue"
import store from '@/store'
import ScheduleThreshold from '@/views/ScheduleThreshold.vue'
import Threshold from '@/views/Threshold.vue'
import SafetyStock from '@/views/SafetyStock.vue'
import StorePickup from '@/views/StorePickup.vue'
import Shipping from '@/views/Shipping.vue'
import InventoryChannels from '@/views/InventoryChannels.vue'
import CreateThreshold from '@/views/CreateThreshold.vue';
import CreateSafetyStock from '@/views/CreateSafetyStock.vue'
import CreateStorePickup from '@/views/CreateStorePickup.vue'
import CreateShipping from '@/views/CreateShipping.vue'

import { hasPermission } from '@/authorization';
import { showToast } from '@/utils'
import { translate } from '@/i18n'

import 'vue-router'
import { DxpLogin, useAuthStore } from '@hotwax/dxp-components';
import { loader } from '@/user-utils';

// Defining types for the meta values
declare module 'vue-router' {
  interface RouteMeta {
    permissionId?: string;
  }
}

const authGuard = async (to: any, from: any, next: any) => {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated || !store.getters['user/isAuthenticated']) {
    await loader.present('Authenticating')
    // TODO use authenticate() when support is there
    const redirectUrl = window.location.origin + '/login'
    window.location.href = `${process.env.VUE_APP_LOGIN_URL}?redirectUrl=${redirectUrl}`
    loader.dismiss()
  }
  next()
};

const loginGuard = (to: any, from: any, next: any) => {
  const authStore = useAuthStore()
  if (authStore.isAuthenticated && !to.query?.token && !to.query?.oms) {
    next('/')
  }
  next();
};

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/threshold'
  },
  {
    path: '/select-product',
    name: 'SelectProduct',
    component: SelectProduct,
    beforeEnter: authGuard,
    meta: {
      permissionId: "APP_SELECT_PRODUCT_VIEW"
    }
  },    
  {
    path: '/threshold',
    name: 'Threshold',
    component: Threshold,
    beforeEnter: authGuard
  },
  {
    path: '/safety-stock',
    name: 'Safety stock',
    component: SafetyStock,
    beforeEnter: authGuard
  },
  {
    path: '/store-pickup',
    name: 'Store pickup',
    component: StorePickup,
    beforeEnter: authGuard
  },
  {
    path: '/shipping',
    name: 'Shipping',
    component: Shipping,
    beforeEnter: authGuard
  },
  {
    path: '/inventory-channels',
    name: 'Inventory channels',
    component: InventoryChannels,
    beforeEnter: authGuard
  },
  {
    path: '/create-threshold',
    name: 'Create threshold',
    component: CreateThreshold,
    beforeEnter: authGuard
  },
  {
    path: '/create-safety-stock',
    name: 'Create safety stock',
    component: CreateSafetyStock,
    beforeEnter: authGuard
  },
  {
    path: '/create-store-pickup',
    name: 'Create store pickup',
    component: CreateStorePickup,
    beforeEnter: authGuard
  },
  {
    path: '/create-shipping',
    name: 'Create shipping',
    component: CreateShipping,
    beforeEnter: authGuard
  },


  // {
  //   path: '/select-product-csv-upload',
  //   name: 'SelectProductCSVUpload',
  //   component: SelectProductCSVUpload,
  //   meta: {
  //     permissionId: ""
  //   }
  // },
  // {
  //   path: '/select-facility',
  //   name: 'SelectFacility',
  //   component: SelectFacility,
  //   beforeEnter: authGuard,
  //   meta: {
  //     permissionId: ""
  //   }
  // },
  // {
  //   path: '/select-facility-csv-upload',
  //   name: 'SelectFacilityCSVUpload',
  //   component: SelectFacilityCSVUpload,
  //   meta: {
  //     permissionId: ""
  //   }
  // },
  // {
  //   path: '/threshold-updates',
  //   name: 'ThresholdUpdates',
  //   component: ThresholdUpdates,
  //   beforeEnter: authGuard,
  //   meta: {
  //     permissionId: "APP_THRESHOLD_UPDATES_VIEW"
  //   }
  // },
  {
    path: '/login',
    name: 'DxpLogin',
    component: DxpLogin,
    beforeEnter: loginGuard
  },
  {
    path: "/settings",
    name: "Settings",
    component: Settings,
    beforeEnter: authGuard
  },
  // {
  //   path: '/schedule-threshold',
  //   name: 'ScheduleThreshold',
  //   component: ScheduleThreshold,
  //   beforeEnter: authGuard,
  //   meta: {
  //     permissionId: "APP_SAVE_THRESHOLD_VIEW"
  //   }
  // },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from) => {
  if (to.meta.permissionId && !hasPermission(to.meta.permissionId)) {
    let redirectToPath = from.path;
    // If the user has navigated from Login page or if it is page load, redirect user to settings page without showing any toast
    if (redirectToPath == "/login" || redirectToPath == "/") redirectToPath = "/settings";
    else {
      showToast(translate('You do not have permission to access this page'));
    }
    return {
      path: redirectToPath,
    }
  }
})

export default router