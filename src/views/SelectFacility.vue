<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button default-href="/" slot="start" />
        <ion-title>{{ $t("Select facility") }}</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="mobile-only">
            <ion-icon :icon="downloadOutline" />
          </ion-button>
          <ion-button fill="clear" class="mobile-only">
            <ion-icon :icon="filterOutline" />
          </ion-button>
          <ion-button class="desktop-only" @click="() => router.push('/select-facility-csv-upload')">{{ $t("Upload CSV") }}</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="find">
        <section class="search">
          <ion-searchbar :placeholder="$t('Search orders')" />
        </section>

        <aside class="filters desktop-only">
          <ion-list>
            <ion-list-header>{{ $t("Filter stores") }}</ion-list-header>
            <ion-item>
              <ion-label>{{ $t("State") }}</ion-label>
              <ion-select value="all">
                <ion-select-option value="all">All</ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-label>{{ $t("Type") }}</ion-label>
              <ion-select value="any">
                <ion-select-option value="any">Any</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-list>

          <ion-list>
            <ion-list-header>{{ $t("Selected products") }}</ion-list-header>
            <ion-item-divider>
              Parent
              <ion-checkbox slot="end"/>
            </ion-item-divider>
            <ion-item>
              <ion-label>Variant name</ion-label>
              <ion-checkbox slot="end" />
            </ion-item>
            <ion-item>
              <ion-label>Variant name</ion-label>
              <ion-checkbox slot="end" />
            </ion-item>
            <ion-item>
              <ion-label>Variant name</ion-label>
              <ion-checkbox slot="end" />
            </ion-item>
          </ion-list>
        </aside>

        <main class="main">
          <section class="sort"></section>

          <section class="section-header"></section>

          <ion-item lines="none">
            <ion-label>{{ $t("Stores") }}</ion-label>
          </ion-item>

          <section class="section-grid">
              <ion-card>
                <ion-item-divider>
                  {{ $t('WAREHOUSE') }}
                  <ion-checkbox slot="end" :checked="isAllFacilitiesSelected(warehouseFacilities, 'WAREHOUSE')" @ionChange="selectAllFacilities($event['detail'].checked, warehouseFacilities)" />
                </ion-item-divider>
                <ion-item v-for="facility in warehouseFacilities" :key="facility?.facilityId">
                  <ion-label>{{ facility?.facilityName }}</ion-label>
                  <ion-checkbox slot="end" :checked="isFacilitySelected(facility?.facilityId)" @ionChange="updateSelectedFacilities($event['detail'].checked, facility)" />
                </ion-item>
              </ion-card>

              <ion-card>
                <ion-item-divider>
                  {{ $t('RETAIL_STORE') }}
                  <ion-checkbox slot="end" :checked="isAllFacilitiesSelected(retailFacilities, 'RETAIL_STORE')" @ionChange="selectAllFacilities($event['detail'].checked, retailFacilities)" />
                </ion-item-divider>
                <ion-item v-for="facility in retailFacilities" :key="facility?.facilityId">
                  <ion-label>{{ facility?.facilityName }}</ion-label>
                  <ion-checkbox slot="end" :checked="isFacilitySelected(facility?.facilityId)" @ionChange="updateSelectedFacilities($event['detail'].checked, facility)" />
                </ion-item>
              </ion-card>
          </section>
        </main>
      </div>

      <div class="action desktop-only">
        <ion-button @click="setSafetyStock()">
          {{ $t("Set safety stock") }}
          <ion-icon slot="end" :icon="checkmarkDoneOutline" />
        </ion-button>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="mobile-only">
        <ion-fab-button @click="setSafetyStock()">
          <ion-icon :icon="checkmarkDoneOutline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonContent,
  IonCheckbox,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { defineComponent } from "vue";
import {
  checkmarkDoneOutline,
  downloadOutline,
  filterOutline
} from "ionicons/icons";
import { useRouter } from "vue-router";
import SafetyStockModal from "@/components/SafetyStockModal.vue";
import { useStore } from "@/store";
import { mapGetters } from "vuex";

export default defineComponent({
  name: "SelectFacility",
  components: {
    IonBackButton,
    IonButton,
    IonButtons,
    IonCard,
    IonContent,
    IonCheckbox,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonItemDivider,
    IonLabel,
    IonList,
    IonListHeader,
    IonPage,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar
  },
  data() {
    return {
      selectedFacilities: [] as any,
      warehouseFacilities: [] as any,
      retailFacilities: [] as any,
    }
  },
  computed: {
    ...mapGetters({
      facilities: 'util/getFacilityLocations',
    })
  },
  methods: {
    async setSafetyStock() {
      const safetystockmodal = await modalController.create({
        component: SafetyStockModal,
      });
      return safetystockmodal.present();
    },
    getFacilitiesByType(facilityTypeId: any, facilities: any) {
      return facilities.filter((facility: any) => facilityTypeId === facility.facilityTypeId)
    },
    async getFacilities() {
      const payload = {
        "fieldList": ["facilityId", "facilityName", "facilityTypeId"],
        "viewSize": 50,
        "entityName": "ProductStoreAndFacility",
        "noConditionFind": "Y",
        "distinct": "Y"
      }
      await this.store.dispatch('util/getFacilities', payload).then(() => {
        this.warehouseFacilities = this.getFacilitiesByType('WAREHOUSE', this.facilities);
        this.retailFacilities = this.getFacilitiesByType('RETAIL_STORE', this.facilities);   
      })
    },
    async updateSelectedFacilities( checked: boolean, facility: any) {
      const selectedFacility = this.selectedFacilities.find((fac: any) => fac?.facilityId === facility?.facilityId)
      if(selectedFacility && checked || !selectedFacility && !checked) {
        return;
      }
      checked ? this.selectedFacilities.push(facility) : this.selectedFacilities.splice(this.selectedFacilities.indexOf(facility), 1);
    },
    isFacilitySelected(id: any): boolean {
      const facility = this.selectedFacilities.find((fac: any) => fac?.facilityId === id);
      return facility?.facilityId === id;
    },
    isAllFacilitiesSelected(facilities: any, facilityType: any): boolean {
      const facilitySelectedByType = this.selectedFacilities.filter((facility: any) => facility?.facilityTypeId === facilityType);
      return facilities.length === facilitySelectedByType.length;
    },
    selectAllFacilities(value: boolean, facilities: any) {
      const facilitySelectedByType = this.selectedFacilities.filter((facility: any) => facility?.facilityTypeId === facilities[0]?.facilityTypeId);

      if(value) {
        if(facilitySelectedByType.length === facilities.length) {
          return;
        } else {
          facilities.forEach((fac: any) => {
            const facility = facilitySelectedByType.find((selectedFac: any) => selectedFac?.facilityId === fac?.facilityId);
            if(!facility?.facilityId) this.selectedFacilities.push(fac);
          })
        }
      } else {
        if(facilitySelectedByType.length === facilities.length) {
          this.selectedFacilities = this.selectedFacilities.reduce((remainingFac: any, facility: any) => {
            if(facility?.facilityTypeId !== facilities[0]?.facilityTypeId) {
              remainingFac.push(facility)
            }
            return remainingFac;
          }, []) 
        }
      }
    }
  },
  mounted() {
    this.getFacilities();
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    return {
      checkmarkDoneOutline,
      downloadOutline,
      filterOutline,
      router,
      store
    };
  },
});
</script>

<style scoped>
.filters {
  border-right: 1px solid var(--ion-color-medium);
}

.section-grid {
  align-items: start;
}

ion-item-divider > ion-checkbox {
   margin-inline-end: 16px;
}

@media (min-width: 991px) {
  .action {
    position: absolute;
    bottom: 25%;
    left: 50%;
    transform: translate(-50%, 0);
  }
}
</style>
