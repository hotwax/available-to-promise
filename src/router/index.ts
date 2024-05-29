import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import Settings from "@/views/Settings.vue"
import store from '@/store'
import Threshold from '@/views/Threshold.vue'
import SafetyStock from '@/views/SafetyStock.vue'
import StorePickup from '@/views/StorePickup.vue'
import Shipping from '@/views/Shipping.vue'
import InventoryChannels from '@/views/InventoryChannels.vue'
import CreateUpdateThresholdRule from '@/views/CreateUpdateThresholdRule.vue';
import CreateUpdateSafetyStockRule from '@/views/CreateUpdateSafetyStockRule.vue'
import CreateUpdateStorePickupRule from '@/views/CreateUpdateStorePickupRule.vue'
import CreateUpdateShippingRule from '@/views/CreateUpdateShippingRule.vue'
import { DxpLogin, useAuthStore } from '@hotwax/dxp-components';
import { loader } from '@/user-utils';

import 'vue-router'

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
    component: CreateUpdateThresholdRule,
    beforeEnter: authGuard
  },
  {
    path: '/create-safety-stock',
    name: 'Create safety stock',
    component: CreateUpdateSafetyStockRule,
    beforeEnter: authGuard
  },
  {
    path: '/create-store-pickup',
    name: 'Create store pickup',
    component: CreateUpdateStorePickupRule,
    beforeEnter: authGuard
  },
  {
    path: '/create-shipping',
    name: 'Create shipping',
    component: CreateUpdateShippingRule,
    beforeEnter: authGuard
  },
  {
    path: '/update-threshold/:ruleId',
    name: 'Update threshold',
    component: CreateUpdateThresholdRule,
    beforeEnter: authGuard,
    props: true
  },
  {
    path: '/update-safety-stock/:ruleId',
    name: 'Update safety stock',
    component: CreateUpdateSafetyStockRule,
    beforeEnter: authGuard,
    props: true
  },
  {
    path: '/update-store-pickup/:ruleId',
    name: 'Update store pickup',
    component: CreateUpdateStorePickupRule,
    beforeEnter: authGuard,
    props: true
  },
  {
    path: '/update-shipping/:ruleId',
    name: 'Update shipping',
    component: CreateUpdateShippingRule,
    beforeEnter: authGuard,
    props: true
  },
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
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router