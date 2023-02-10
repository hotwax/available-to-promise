import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import SelectFacility from '@/views/SelectFacility.vue'
import SelectFacilityCSVUpload from '@/views/SelectFacilityCSVUpload.vue'
import SelectProduct from '@/views/SelectProduct.vue'
import SelectProductCSVUpload from '@/views/SelectProductCSVUpload.vue'
import ThresholdUpdates from '@/views/ThresholdUpdates.vue'
import Login from '@/views/Login.vue'
import Settings from "@/views/Settings.vue"
import store from '@/store'
import ScheduleThreshold from '@/views/ScheduleThreshold.vue'

import { hasPermission } from '@/authorization';
import { showToast } from '@/utils'
import { translate } from '@/i18n'

import 'vue-router'

// Defining types for the meta values
declare module 'vue-router' {
  interface RouteMeta {
    permissionId?: string;
  }
}

const authGuard = (to: any, from: any, next: any) => {
  if (store.getters['user/isAuthenticated']) {
      next()
  } else {
    next("/login")
  }
};

const loginGuard = (to: any, from: any, next: any) => {
  if (!store.getters['user/isAuthenticated']) {
      next()
  } else {
    next("/")
  }
};

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/select-product'
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
    path: '/select-product-csv-upload',
    name: 'SelectProductCSVUpload',
    component: SelectProductCSVUpload,
    meta: {
      permissionId: ""
    }
  },
  {
    path: '/select-facility',
    name: 'SelectFacility',
    component: SelectFacility,
    beforeEnter: authGuard,
    meta: {
      permissionId: ""
    }
  },
  {
    path: '/select-facility-csv-upload',
    name: 'SelectFacilityCSVUpload',
    component: SelectFacilityCSVUpload,
    meta: {
      permissionId: ""
    }
  },
  {
    path: '/threshold-updates',
    name: 'ThresholdUpdates',
    component: ThresholdUpdates,
    beforeEnter: authGuard,
    meta: {
      permissionId: "APP_THRESHOLD_UPDATES_VIEW"
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    beforeEnter: loginGuard
  },
  {
    path: "/settings",
    name: "Settings",
    component: Settings,
    beforeEnter: authGuard
  },
  {
    path: '/schedule-threshold',
    name: 'ScheduleThreshold',
    component: ScheduleThreshold,
    beforeEnter: authGuard
  },
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