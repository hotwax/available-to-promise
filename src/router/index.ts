import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import Settings from "@/views/Settings.vue"
import store from '@/store'
import Login from '@/views/Login.vue'
import Threshold from '@/views/Threshold.vue'
import SafetyStock from '@/views/SafetyStock.vue'
import StorePickup from '@/views/StorePickup.vue'
import Shipping from '@/views/Shipping.vue'
import InventoryChannels from '@/views/InventoryChannels.vue'
import CreateThresholdRule from '@/views/CreateThresholdRule.vue';
import CreateSafetyStockRule from '@/views/CreateSafetyStockRule.vue'
import CreateStorePickupRule from '@/views/CreateStorePickupRule.vue'
import CreateShippingRule from '@/views/CreateShippingRule.vue'


import 'vue-router'

// Defining types for the meta values
declare module 'vue-router' {
  interface RouteMeta {
    permissionId?: string;
  }
}

const authGuard = async (to: any, from: any, next: any) => {
  if (store.getters["user/isAuthenticated"]) {
    next()
  } else {
    next("/login")
  }
};

const loginGuard = (to: any, from: any, next: any) => {
  if (!store.getters["user/isAuthenticated"]) {
    next()
  } else {
    next("/")
  }
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
    component: CreateThresholdRule,
    beforeEnter: authGuard
  },
  {
    path: '/create-safety-stock',
    name: 'Create safety stock',
    component: CreateSafetyStockRule,
    beforeEnter: authGuard
  },
  {
    path: '/create-store-pickup',
    name: 'Create store pickup',
    component: CreateStorePickupRule,
    beforeEnter: authGuard
  },
  {
    path: '/create-shipping',
    name: 'Create shipping',
    component: CreateShippingRule,
    beforeEnter: authGuard
  },
  {
    path: '/update-threshold/:ruleId',
    name: 'Update threshold',
    component: CreateThresholdRule,
    beforeEnter: authGuard,
    props: true
  },
  {
    path: '/update-safety-stock/:ruleId',
    name: 'Update safety stock',
    component: CreateSafetyStockRule,
    beforeEnter: authGuard,
    props: true
  },
  {
    path: '/update-store-pickup/:ruleId',
    name: 'Update store pickup',
    component: CreateStorePickupRule,
    beforeEnter: authGuard,
    props: true
  },
  {
    path: '/update-shipping/:ruleId',
    name: 'Update shipping',
    component: CreateShippingRule,
    beforeEnter: authGuard,
    props: true
  },
  {
    path: '/login',
    name: 'DxpLogin',
    component: Login,
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