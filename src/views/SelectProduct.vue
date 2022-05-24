<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" id="navigation" menu="navigation" />
        <ion-title>{{ $t("Threshold management") }}</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="mobile-only">
            <ion-icon :icon="downloadOutline" />
          </ion-button>
          <ion-menu-button menu="filter" id="filter" slot="end" v-show="showFilterButton"  @click="openProductFilter()">
            <ion-icon :icon="filterOutline" />
          </ion-menu-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

     <ion-menu content-id="main" menu-id="filter" type="overlay" side="end">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="closeMenu">
              <ion-icon :icon="closeOutline" slot="icon-only" />
            </ion-button>
          </ion-buttons>
          <ion-title>{{ $t("Filters")}}</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content id="content">
        <ProductFilter />     
     </ion-content>
    </ion-menu>

    <ion-content>
      <div class="find">

        <aside class="filters desktop-only">
          <div class="product-filters">
            <ProductFilter />
          </div>
        </aside>

        <main class="main">
          <section class="sort">
            <ion-item lines="none">
              <h2>{{ $t("Results") }}: {{ products.total.virtual }} {{ $t("virtual, ") }} {{ products.total.variant }} {{ $t("variants") }}</h2>
            </ion-item>

            <section class="search">
              <ion-searchbar :placeholder="$t('Check products')" v-model="queryString" @keyup.enter="queryString = $event.target.value; searchProducts($event)" />
            </section>  
          </section>

          <hr />
          <div v-for="product in products.list" :key="product">
            <section class="section-header">
              <div class="primary-info">
                <ion-item lines="none">
                  <ion-label>
                    {{ product.productName }}
                    <p>{{ product.variants.length}} {{ $t("variants") }}</p>
                  </ion-label>
                </ion-item>
              </div>
  
            <div class="tags"></div>
            </section>
  
            <section class="section-grid">
              <div v-for="variant in product.variants" :key="variant">
                <ion-card>
                  <Image :src="variant.mainImageUrl" />
                  <ion-item lines="none">
                    <ion-label class="ion-text-wrap">
                      {{ variant.productName }}
                      <p v-if="variant.color">{{ $t("Color") }}: {{ variant.color }}</p>
                      <p v-if="variant.size">{{ $t("Size") }}: {{ variant.size }}</p>
                    </ion-label>
                  </ion-item>
                </ion-card>
              </div>
            </section>
            <hr />
          </div>
          <ion-infinite-scroll @ionInfinite="loadMoreProducts($event)" threshold="100px" :disabled="!isScrollable">
            <ion-infinite-scroll-content loading-spinner="crescent" :loading-text="$t('Loading')"/>
          </ion-infinite-scroll>
        </main>
      </div>

      <div class="action desktop-only">
        <ion-button @click="saveThreshold()">
          <ion-icon slot="start" :icon="saveOutline" />
          {{ $t("Save threshold rule") }}
        </ion-button>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="mobile-only">
        <ion-fab-button @click="saveThreshold()">
          <ion-icon :icon="arrowForwardOutline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import Image from '@/components/Image.vue';
import {
  alertController,
  IonButton,
  IonButtons,
  IonCard,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonMenu,
  IonMenuButton,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  menuController,
  modalController,
  IonInfiniteScroll,
  IonInfiniteScrollContent
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { arrowForwardOutline, closeOutline,  downloadOutline, filterOutline, saveOutline, pricetagOutline, closeCircle, addCircleOutline, albumsOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { mapGetters, useStore } from 'vuex';
import SaveThresholdModal from '@/components/SaveThresholdModal.vue';
import ProductFilterModal from '@/components/ProductFilterModal.vue';
import ProductFilter from '@/components/ProductFilter.vue';

export default defineComponent({
  name: 'SelectProduct',
  components: {
    IonButton,
    IonButtons,
    IonCard,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonItem,
    IonLabel,
    IonMenu,
    IonMenuButton,
    IonPage,
    IonSearchbar,
    IonTitle,
    IonToolbar,
    Image,
    ProductFilter
  },
  computed: {
    ...mapGetters({
      products: 'product/getProducts',
      isScrollable: 'product/isScrollable',
      appliedFilters: 'product/getAppliedFilters',
      query: 'product/getQuery',
      threshold: 'product/getThreshold'
    })
  },

  data () {
    return {
      queryString: '',
      showFilterButton: false,
    }
  },
  async mounted() {
    this.showFilters();
  },

  methods: {
    showFilters(){
      const el = document.querySelector('.product-filters') as Element;
      const observer = new window.IntersectionObserver(([entry]) => {
        this.showFilterButton = !entry.isIntersecting;
      }, {
        root: null
      })
      observer.observe(el);
    },
    async openProductFilter() {
      await menuController.open('filter');
    },
    async closeMenu() {
      await menuController.close();
    },
    searchProducts(event: any) {
      this.queryString = event.target.value;
      this.getProducts();
    },
    async getProducts(vSize?: any, vIndex?: any) {
      const viewSize = vSize ? vSize : process.env.VUE_APP_VIEW_SIZE;
      const viewIndex = vIndex ? vIndex : 0;
      this.store.dispatch("product/updateQuery", { viewSize, viewIndex, queryString: this.queryString })
    },
    async loadMoreProducts(event: any){
      this.getProducts(
        undefined,
        Math.ceil(this.products.list.length / process.env.VUE_APP_VIEW_SIZE).toString()
      ).then(() => {
        event.target.complete();
      })
    },
    async saveThreshold() {
      // an alert will be displayed, if the user does not enter a threshold value before proceeding to save page
      if (!this.threshold) {
        const alert = await alertController
          .create({
            header: this.$t('Enter threshold value'),
            message: this.$t('Please enter a threshold value to set for these products before proceeding.'),
            buttons: [{
              text: this.$t("Ok"),
              role: 'cancel'
            }],
          });
        return alert.present();
      }

      const saveThresholdModal = await modalController.create({
        component: SaveThresholdModal,
        componentProps: {
          threshold: this.threshold,
          totalSKUs: this.products.total.variant
        }
      })

      saveThresholdModal.present();
    },
    async searchFilter(label: string, facetToSelect: string, searchfield: string, type: string) {
      const modal = await modalController.create({
        component: ProductFilterModal,
        componentProps: {
          label,
          facetToSelect,
          searchfield,
          type
        }
      })
      modal.onDidDismiss().then((payload) => {
        if(payload.data.isFilterChanged){
          this.queryString = '';
        }
      })
      modal.present();
    },
    async removeFilters(type: string, id: string, value: string) {
      await this.store.dispatch('product/updateAppliedFilters', {
        type,
        id,
        value
      })
      this.queryString = ''
    },
    async resetFilters(type: string) {
      // checking that if any of the current type does not have any attribute selected than not making solr query
      if (Object.entries(this.appliedFilters[type]).every((filter: any) => filter[1].length <= 0)) {
        return;
      }
      await this.store.dispatch('product/resetFilters', { type })
      this.queryString = ''
    }
  },
  ionViewDidLeave() {
    //Cleared query string to clear search keyword whenever user navigates to SelectProduct page
    this.queryString = '';
    this.threshold = '';
  },
  ionViewDidEnter () {
    this.getProducts();
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    return {
      arrowForwardOutline,
      closeOutline,
      downloadOutline,
      filterOutline,
      router,
      saveOutline,
      store,
      pricetagOutline,
      closeCircle,
      addCircleOutline,
      albumsOutline
    };
  },
});
</script>

<style scoped>
ion-menu {
  --width: 100%;
}

.section-grid {
  grid-template-columns: repeat(auto-fill, 200px);
}

.find {
  padding: 0 var( --spacer-base);
}

ion-list-header > div {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

@media (min-width: 991px) {
  ion-menu {
    --width: 375px;
  }
  .find {
    padding: var( --spacer-lg);
    gap: var(--spacer-lg);
   }
  .action {
    position: fixed;
    z-index: 3;
    bottom: 10%;
    left: 50%;
    transform: translate(-50%, 0);
  }
}
</style>
