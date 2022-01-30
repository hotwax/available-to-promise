import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import Home from '@/views/Home.vue'
import SelectFacility from '@/views/SelectFacility.vue'
import SelectFacilityCSVUpload from '@/views/SelectFacilityCSVUpload.vue'
import SelectProduct from '@/views/SelectProduct.vue'
import SelectProductCSVUpload from '@/views/SelectProductCSVUpload.vue'
import Login from '@/views/Login.vue'
import Settings from "@/views/Settings.vue"
import store from '@/store'

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
    beforeEnter: authGuard
  },    
  {
    path: '/select-product-csv-upload',
    name: 'SelectProductCSVUpload',
    component: SelectProductCSVUpload
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    beforeEnter: authGuard
  },
  {
    path: '/select-facility',
    name: 'SelectFacility',
    component: SelectFacility,
    beforeEnter: authGuard
  },
  {
    path: '/select-facility-csv-upload',
    name: 'SelectFacilityCSVUpload',
    component: SelectFacilityCSVUpload
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
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router