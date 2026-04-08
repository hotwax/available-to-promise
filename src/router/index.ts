import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import Settings from "@/views/Settings.vue"
import Threshold from '@/views/Threshold.vue'
import SafetyStock from '@/views/SafetyStock.vue'
import StorePickup from '@/views/StorePickup.vue'
import Shipping from '@/views/Shipping.vue'
import InventoryChannels from '@/views/InventoryChannels.vue'
import CreateUpdateThresholdRule from '@/views/CreateUpdateThresholdRule.vue';
import CreateUpdateSafetyStockRule from '@/views/CreateUpdateSafetyStockRule.vue'
import CreateUpdateStorePickupRule from '@/views/CreateUpdateStorePickupRule.vue'
import CreateUpdateShippingRule from '@/views/CreateUpdateShippingRule.vue'
import Login from '@/views/Login.vue';
import { useAuth } from '@/composables/useAuth';
import { cloudUploadOutline, globeOutline, settingsOutline, sendOutline, storefrontOutline, pulseOutline } from 'ionicons/icons';

import 'vue-router'

// Defining types for the meta values
declare module 'vue-router' {
  interface RouteMeta {
    permissionId?: string;
    title?: string;
    icon?: string;
    menuIndex?: number;
    childRoutes?: string[];
  }
}

const authGuard = async (to: any, from: any, next: any) => {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated.value) {
    next('/login');
  } else {
    next()
  }
};

const loginGuard = (to: any, from: any, next: any) => {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated.value && !to.query?.token && !to.query?.oms) {
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
    beforeEnter: authGuard,
    meta: {
      title: "Threshold",
      icon: globeOutline,
      menuIndex: 1,
      childRoutes: ["/create-threshold", "/update-threshold/"]
    }
  },
  {
    path: '/safety-stock',
    name: 'Safety stock',
    component: SafetyStock,
    beforeEnter: authGuard,
    meta: {
      title: "Safety stock",
      icon: pulseOutline,
      menuIndex: 2,
      childRoutes: ["/create-safety-stock", "/update-safety-stock/"]
    }
  },
  {
    path: '/store-pickup',
    name: 'Store pickup',
    component: StorePickup,
    beforeEnter: authGuard,
    meta: {
      title: "Store pickup",
      icon: storefrontOutline,
      menuIndex: 3,
      childRoutes: ["/create-store-pickup", "/update-store-pickup/"]
    }
  },
  {
    path: '/shipping',
    name: 'Shipping',
    component: Shipping,
    beforeEnter: authGuard,
    meta: {
      title: "Shipping",
      icon: sendOutline,
      menuIndex: 4,
      childRoutes: ["/create-shipping", "/update-shipping/"]
    }
  },
  {
    path: '/inventory-channels',
    name: 'Inventory channels',
    component: InventoryChannels,
    beforeEnter: authGuard,
    meta: {
      title: "Inventory channels",
      icon: cloudUploadOutline,
      menuIndex: 5
    }
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
    name: 'Login',
    component: Login,
    beforeEnter: loginGuard
  },
  {
    path: "/settings",
    name: "Settings",
    component: Settings,
    beforeEnter: authGuard,
    meta: {
      title: "Settings",
      icon: settingsOutline,
      menuIndex: 6
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router