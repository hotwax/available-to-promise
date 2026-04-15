import { defineStore } from 'pinia'
import { api, logger, commonUtil } from '@common'
import { DateTime } from 'luxon'
import { useUserStore } from '@/store/user'

export interface ProductStoreState {
  productStores: any[]
  currentProductStore: any
  configFacilities: any[];
  appliedFilters: {
    included: {
      tags: string[];
      productFeatures: string[];
    };
    excluded: {
      tags: string[];
      productFeatures: string[];
    };
  };
  appliedFiltersOperator: {
    included: {
      tags: string;
      productFeatures: string;
    };
    excluded: {
      tags: string;
      productFeatures: string;
    };
  };
  facilityGroups: any[];
  facilities: {
    list: any[];
    isScrollable: boolean;
  };
  selectedSegment: string;
  pickupGroups: any[];
  pickupGroupFacilities: any;
  facetOptions: any;
}

export const useProductStore = defineStore('productStore', {
  state: (): ProductStoreState => ({
    productStores: [],
    currentProductStore: {},
    configFacilities: [],
    appliedFilters: {
      included: {
        tags: [],
        productFeatures: []
      },
      excluded: {
        tags: [],
        productFeatures: []
      }
    },
    appliedFiltersOperator: {
      included: {
        tags: "",
        productFeatures: ""
      },
      excluded: {
        tags: "",
        productFeatures: ""
      }
    },
    facilityGroups: [],
    facilities: {
      list: [],
      isScrollable: true
    },
    selectedSegment: 'included',
    pickupGroups: [],
    pickupGroupFacilities: {},
    facetOptions: {},
  }),
  getters: {
    getProductStores: (state) => state.productStores,
    getCurrentProductStore: (state) => state.currentProductStore,
    getConfigFacilities: (state) => state.configFacilities ? JSON.parse(JSON.stringify(state.configFacilities)) : [],
    getAppliedFilters: (state) => state.appliedFilters,
    getAppliedFiltersOperator: (state) => state.appliedFiltersOperator,
    getFacilityGroups: (state) => state.facilityGroups,
    getFacilities: (state) => state.facilities.list ? JSON.parse(JSON.stringify(state.facilities.list)) : [],
    isFacilitiesScrollable: (state) => state.facilities.isScrollable,
    getSelectedSegment: (state) => state.selectedSegment,
    getPickupGroups: (state) => state.pickupGroups,
    getPickupGroupFacilities: (state) => state.pickupGroupFacilities,
    getFacetOptions: (state) => (searchField: string) => {
      return state.facetOptions[searchField]?.length ? state.facetOptions[searchField] : [];
    },
  },
  actions: {
    setCurrentProductStore(productStore: any) {
      if (!productStore) {
        productStore = this.productStores.find((store: any) => store.productStoreId === productStore.productStoreId);
      }
      this.currentProductStore = productStore;
    },
    async fetchUserProductStores() {
      try {
        const resp = await api({
          url: "admin/user/productStore",
          method: "GET"
        });
        // Disallow login if the user is not associated with any product store
        if (!commonUtil.hasError(resp)) {
          this.productStores = resp.data
        } else {
          throw resp.data;
        }
      } catch (error: any) {
        logger.error(error)
      }
    },
    async fetchConfigFacilities() {
      let configFacilities = [];
      try {
        const resp = await api({
          url: `admin/productStores/${this.currentProductStore.productStoreId}/facilities`,
          method: "GET",
          params: { facilityTypeId: 'CONFIGURATION', productStoreId: this.currentProductStore.productStoreId }
        }) as any;
        if (!commonUtil.hasError(resp)) {
          configFacilities = resp.data;
        } else {
          throw resp.data
        }
      } catch (err: any) {
        logger.error(err)
      }
      this.configFacilities = configFacilities;
    },
    async fetchFacilityGroups() {
      let facilityGroups = [];
      try {
        const resp = await api({
          url: `admin/productStores/${this.currentProductStore.productStoreId}/facilityGroups`,
          method: "GET",
          params: { productStoreId: this.currentProductStore.productStoreId, pageSize: 100 }
        }) as any;
        if (!commonUtil.hasError(resp)) {
          facilityGroups = resp.data;
        } else {
          throw resp.data
        }
      } catch (err: any) {
        logger.error(err)
      }
      this.facilityGroups = facilityGroups;
    },
    updateAppliedFilters(payload: any) {
      this.appliedFilters = payload;
    },
    updateAppliedFiltersOperator(payload: any) {
      this.appliedFiltersOperator = payload;
    },
    clearProductStoreState() {
      this.configFacilities = [];
      this.appliedFilters = {
        included: { tags: [], productFeatures: [] },
        excluded: { tags: [], productFeatures: [] }
      };
      this.appliedFiltersOperator = {
        included: { tags: "", productFeatures: "" },
        excluded: { tags: "", productFeatures: "" }
      };
      this.facetOptions = {};
    },
    clearAppliedFilters() {
      this.appliedFilters = {
        included: { tags: [], productFeatures: [] },
        excluded: { tags: [], productFeatures: [] }
      };
    },
    clearAppliedFiltersOperator() {
      this.appliedFiltersOperator = {
        included: { tags: "", productFeatures: "" },
        excluded: { tags: "", productFeatures: "" }
      };
    },
    async fetchFacilities(payload: any) {
      const userStore = useUserStore()
      const params = {
        parentFacilityTypeId: 'VIRTUAL_FACILITY',
        parentFacilityTypeId_not: 'Y',
        facilityTypeId: 'VIRTUAL_FACILITY',
        facilityTypeId_not: 'Y',
        productStoreId: this.currentProductStore.productStoreId,
        pageSize: payload.pageSize,
        pageIndex: payload.pageIndex
      }
      const facilities = this.facilities.list ? JSON.parse(JSON.stringify(this.facilities.list)) : [];
      let isScrollable = true, facilityList = [];
      try {
        const resp = await api({
          url: `admin/productStores/${params.productStoreId}/facilities`,
          method: "GET",
          params
        }) as any;
        if (!commonUtil.hasError(resp)) {
          if (payload.isOrderCountRequired) {
            const facilityIds = resp.data.map((facility: any) => facility.facilityId)
            const facilityCounts = await this.fetchFacilitiesOrderCount({ facilityIds })
            resp.data.map((facility: any) => {
              if (facilityCounts[facility.facilityId]) facility.orderCount = facilityCounts[facility.facilityId]
              else facility.orderCount = 0;
            })
          }
          if (payload.pageIndex && payload.pageIndex > 0) {
            facilityList = facilities.concat(resp.data)
          } else {
            facilityList = resp.data
          }
          if (resp.data.length == payload.pageSize) isScrollable = true
          else isScrollable = false
        } else {
          throw resp.data
        }
      } catch (error) {
        logger.error(error)
      }
      this.facilities.list = facilityList;
      this.facilities.isScrollable = isScrollable;
    },
    async fetchFacilitiesOrderCount(payload: any) {
      const facilitiesData = {} as any;
      try {
        const resp = await api({
          url: `admin/facilities/orderCount`,
          method: "GET",
          params: {
            facilityId: payload.facilityIds.join(","),
            facilityId_op: "in",
            entryDate: DateTime.now().toFormat('yyyy-MM-dd')
          }
        }) as any;
        if (resp && !commonUtil.hasError(resp)) {
          resp.data.map((facility: any) => {
            facilitiesData[facility.facilityId] = facility.lastOrderCount
          })
        } else {
          throw resp.data
        }
      } catch (error) {
        logger.error(error)
      }
      return facilitiesData;
    },
    async fetchPickupGroups() {
      const userStore = useUserStore()
      let groups = [] as any;
      const pickGroupFacilities = {} as any;
      try {
        const resp = await api({
          url: `admin/productStores/${this.currentProductStore.productStoreId}/facilityGroups`,
          method: "GET",
          params: { facilityGroupTypeId: 'PICKUP', productStoreId: this.currentProductStore.productStoreId, pageSize: 100 }
        }) as any;
        if (resp && !commonUtil.hasError(resp)) {
          groups = resp.data;
          const responses = await Promise.allSettled(groups.map(async (group: any) => {
            const facilities = await this.fetchPickGroupFacilities(group.facilityGroupId)
            pickGroupFacilities[group.facilityGroupId] = facilities
          }))
          const hasFailedResponse = responses.some((response: any) => response.status === 'rejected')
          if (hasFailedResponse) {
            logger.error("Failed to fetch facilities for some pickup group.")
          }
        } else {
          throw resp.data
        }
      } catch (error) {
        logger.error(error)
      }
      this.pickupGroups = groups;
      this.pickupGroupFacilities = pickGroupFacilities;
    },
    async fetchPickGroupFacilities(facilityGroupId: string) {
      let pickupGroupFacilities = [] as any;
      try {
        const resp = await api({
          url: `admin/facilityGroups/${facilityGroupId}/facilities`,
          method: "GET",
          params: {
            pageSize: 100,
            parentFacilityTypeId: 'VIRTUAL_FACILITY',
            parentFacilityTypeId_not: 'Y',
            facilityTypeId: 'VIRTUAL_FACILITY',
            facilityTypeId_not: 'Y',
          }
        }) as any;
        if (resp && !commonUtil.hasError(resp)) {
          pickupGroupFacilities = resp.data;
        } else {
          throw resp.data
        }
      } catch (error) {
        logger.error(error)
      }
      return pickupGroupFacilities;
    },
    async fetchProductFilters(params: any) {
      const filters = JSON.parse(JSON.stringify(this.facetOptions));
      if (filters[params.searchfield]?.length && !params.queryString) return;
      let allFacets = [] as any;
      let offset = 0;
      let currentFacets = [];
      try {
        do {
          const payload = {
            facetToSelect: params.facetToSelect,
            docType: 'PRODUCT',
            coreName: 'enterpriseSearch',
            jsonQuery: '{"query":"*:*","filter":["docType:PRODUCT"]}',
            noConditionFind: 'Y',
            limit: 1000,
            offset,
            searchfield: "tags",
            term: params.queryString || "",
            q: params.queryString || ""
          }
          const resp = await api({
            url: "admin/solrFacets",
            method: "GET",
            params: payload
          }) as any;
          if (resp && !commonUtil.hasError(resp)) {
            currentFacets = resp.data.facetResponse ? resp.data.facetResponse.response : resp.data.response
            allFacets = allFacets.concat(currentFacets)
            offset = offset + payload.limit
          } else {
            throw resp.data;
          }
        } while (currentFacets.length && allFacets.length < (import.meta.env.VITE_MAX_FACETS as any))
      } catch (error) {
        logger.error(error);
      }
      filters[params.searchfield] = allFacets
      this.facetOptions = filters;
    },
    updatePickupGroupFacilities(payload: any) {
      this.pickupGroupFacilities = payload;
    },
    updateFacilities(payload: any) {
      this.facilities.list = payload.facilities;
    },
    updateSelectedSegment(payload: any) {
      this.selectedSegment = payload;
    },
    async fetchFacilitiesDirect(payload: any) {
      return await api({
        url: `admin/productStores/${payload.productStoreId}/facilities`,
        method: "GET",
        params: payload
      });
    },
    async updateFacility(payload: any) {
      return await api({
        url: `admin/facilities/${payload.facilityId}`,
        method: "PUT",
        data: payload
      });
    },
    async updateFacilityAssociationWithPickupGroup(payload: any) {
      return await api({
        url: `admin/facilityGroups/${payload.facilityGroupId}/facilities/${payload.facilityId}/association`,
        method: "POST",
        data: payload
      });
    }
  },
  persist: true
})
