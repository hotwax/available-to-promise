<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ $t("Threshold management") }}</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="mobile-only">
            <ion-icon :icon="downloadOutline" />
          </ion-button>
          <ion-button fill="clear" class="mobile-only">
            <ion-icon :icon="filterOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="find">

        <aside class="filters desktop-only">
          <ion-list>
            <ion-item lines="inset">
              <ion-label>{{ $t("Threshold") }}</ion-label>
              <ion-input type="number" :placeholder="$t('global threshold')" v-model="threshold"/>
            </ion-item>
            <ion-list-header>
              <div>
                <h3>{{ $t("Include") }}</h3>
                <ion-button fill="clear" color="warning">{{ $t('reset') }}</ion-button>
              </div>
            </ion-list-header>
            <ion-card>
              <ion-toolbar>
                <ion-item lines="none">
                  <ion-label>{{ $t("Tags") }}</ion-label>
                  <ion-button fill="clear" slot="end" size="small">
                    <ion-label>{{ $t('add') }}</ion-label>
                    <ion-icon :icon="addCircleOutline" />
                  </ion-button>
                </ion-item>
              </ion-toolbar>
              <ion-card-content>
                <ion-chip @click="updateInclusionQuery(tag, 'tags')" :outline="!included['tags'].includes(tag)" v-for="(tag, index) in filters['tagsFacet']" :key="index" :disabled="excluded['tags'].includes(tag)">
                  <ion-icon :icon="pricetagOutline" />
                  <ion-label>{{ tag }}</ion-label>
                  <ion-icon :icon="closeCircle" />
                </ion-chip>
              </ion-card-content>
            </ion-card>
            <ion-card>
              <ion-toolbar>
                <ion-item lines="none">
                  <ion-label>{{ $t("Categories") }}</ion-label>
                  <ion-button fill="clear" slot="end" size="small">
                    <ion-label>{{ $t('add') }}</ion-label>
                    <ion-icon :icon="addCircleOutline" />
                  </ion-button>
                </ion-item>
              </ion-toolbar>
              <ion-card-content>
                <ion-chip @click="updateInclusionQuery(category, 'productCategoryNames')" :outline="!included['productCategoryNames'].includes(category)" v-for="(category, index) in filters['productCategoryNameFacet']" :key="index" :disabled="excluded['productCategoryNames'].includes(category)">
                  <ion-icon :icon="albumsOutline" />
                  <ion-label>{{ category }}</ion-label>
                  <ion-icon :icon="closeCircle" />
                </ion-chip>
              </ion-card-content>
            </ion-card>
          </ion-list>
          <ion-list>
            <ion-list-header>
              <div>
                <h3>{{ $t("Exclude") }}</h3>
                <ion-button fill="clear" color="warning">{{ $t('reset') }}</ion-button>
              </div>
            </ion-list-header>
            <ion-card>
              <ion-toolbar>
                <ion-item lines="none">
                  <ion-label>{{ $t("Tags") }}</ion-label>
                  <ion-button fill="clear" slot="end" size="small">
                    <ion-label>{{ $t('add') }}</ion-label>
                    <ion-icon :icon="addCircleOutline" />
                  </ion-button>
                </ion-item>
              </ion-toolbar>
              <ion-card-content>
                <ion-chip @click="updateExclusionQuery(tag, 'tags')" :outline="!excluded['tags'].includes(tag)" v-for="(tag, index) in filters['tagsFacet']" :key="index" :disabled="included['tags'].includes(tag)">
                  <ion-icon :icon="pricetagOutline" />
                  <ion-label>{{ tag }}</ion-label>
                  <ion-icon :icon="closeCircle" />
                </ion-chip>
              </ion-card-content>
            </ion-card>
            <ion-card>
              <ion-toolbar>
                <ion-item lines="none">
                  <ion-label>{{ $t("Categories") }}</ion-label>
                  <ion-button fill="clear" slot="end" size="small">
                    <ion-label>{{ $t('add') }}</ion-label>
                    <ion-icon :icon="addCircleOutline" />
                  </ion-button>
                </ion-item>
              </ion-toolbar>
              <ion-card-content>
                <ion-chip @click="updateExclusionQuery(category, 'productCategoryNames')" :outline="!excluded['productCategoryNames'].includes(category)" v-for="(category, index) in filters['productCategoryNameFacet']" :key="index" :disabled="included['productCategoryNames'].includes(category)">
                  <ion-icon :icon="albumsOutline" />
                  <ion-label>{{ category }}</ion-label>
                  <ion-icon :icon="closeCircle" />
                </ion-chip>
              </ion-card-content>
            </ion-card>
          </ion-list>
        </aside>

        <main class="main">
          <section class="sort">
            <ion-item lines="none">
              <h2>{{ $t("Results") }}: {{ products.total.virtual }} {{ $t("virtual, ") }} {{ products.total.variant }} {{ $t("variants") }}</h2>
            </ion-item>

            <section class="search">
              <ion-searchbar :placeholder="$t('Search products')" v-model="queryString" @keyup.enter="searchProducts($event)" />
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
                    <ion-label>
                      {{ variant.productName }}
                      <p>{{ $t("Color") }}: {{ variant.color }}</p>
                      <p>{{ $t("Size") }}: {{ variant.size }}</p>
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
        <ion-fab-button>
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
  IonCardContent,
  IonChip,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenuButton,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  modalController,
  IonInfiniteScroll,
  IonInfiniteScrollContent
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { arrowForwardOutline, downloadOutline, filterOutline, saveOutline, pricetagOutline, closeCircle, addCircleOutline, albumsOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { mapGetters, useStore } from 'vuex';
import SaveThresholdModal from '@/components/SaveThresholdModal.vue';

export default defineComponent({
  name: 'SelectProduct',
  components: {
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonChip,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonMenuButton,
    IonPage,
    IonSearchbar,
    IonTitle,
    IonToolbar,
    Image
  },
  computed: {
    ...mapGetters({
      products: 'product/getProducts',
      isScrollable: 'product/isScrollable',
      filters: 'product/getProductFacets'
    })
  },
  data () {
    return {
      included: {
        tags: [] as Array<string>,
        productCategoryNames: [] as Array<string>
      } as any,
      excluded: {
        tags: [] as Array<string>,
        productCategoryNames: [] as Array<string>
      } as any,
      threshold: '' as any,
      queryString: '',
      query: {
        "json": {
          "params": {
            "group": true,
            "group.field": "groupId",
            "group.limit": 10000,
            "group.ngroups": true,
            "q.op": "AND"
          } as any,
          "query": "*:*",
          "filter": ["docType: PRODUCT"]
        }
      } as any
    }
  },
  methods: {
    searchProducts(event: any){
      this.queryString = event.target.value;
      this.getProducts();
    },
    async getProducts(vSize?: any, vIndex?: any) {
      const viewSize = vSize ? vSize : process.env.VUE_APP_VIEW_SIZE;
      const viewIndex = vIndex ? vIndex : 0;
      const payload = {
        "json": {
          "params": {
            "rows": viewSize,
            "start": viewIndex * viewSize,
            "group": true,
            "group.field": "groupId",
            "group.limit": 10000,
            "group.ngroups": true,
          } as any,
          "query": "*:*",
          "filter": "docType: PRODUCT AND groupId: *"
        }
      }
      if(this.queryString) {
        payload.json.params.defType = 'edismax'
        payload.json.params.qf = 'productId productName sku internalName brandName'
        // passed this operator to do not split search string and consider the search string as a single value
        payload.json.params['q.op'] = 'AND'
        payload.json.query = `*${this.queryString}*`
      }
      this.store.dispatch("product/getProducts", payload);
    },
    async loadMoreProducts(event: any){
      this.getProducts(
        undefined,
        Math.ceil(this.products.list.length / process.env.VUE_APP_VIEW_SIZE).toString()
      ).then(() => {
        event.target.complete();
      })
    },
    updateInclusionQuery(value: string, type: string) {
      const filter = this.included[type]
      filter.includes(value) ? filter.splice(filter.indexOf(value), 1) : filter.push(value)
      this.updateQuery();
    },
    updateExclusionQuery(value: string, type: string) {
      const filter = this.excluded[type]
      filter.includes(value) ? filter.splice(filter.indexOf(value), 1) : filter.push(value)
      this.updateQuery();
    },
    updateQuery() {
      // initializing the filter always on updateQuery call because we are adding values in the filter
      // as string and if some value is removed then we need to do multiple operations on the filter string
      // to remove that value from the query filter
      this.query.json['filter'] = ["docType: PRODUCT"]

      this.query.json['filter'] = Object.keys(this.included).reduce((filter, value) => {
        this.included[value].length > 0 && filter.push(`${value}: (${this.included[value].join(' OR ')})`)
        return filter
      }, this.query.json['filter'])

      this.query.json['filter'] = Object.keys(this.excluded).reduce((filter, value) => {
        this.excluded[value].length > 0 && filter.push(`-${value}: (${this.excluded[value].join(' OR ')})`)
        return filter
      }, this.query.json['filter'])
    },
    async saveThreshold() {
      // an alert will be displayed, if the user does not enter a threshold value before proceeding to save page
      if (!this.threshold || this.threshold == 0) {
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
          query: this.query,
          totalSKUs: this.products.total.variant
        }
      })

      saveThresholdModal.present();
    }
  },
  mounted () {
    this.getProducts();
    this.store.dispatch("product/fetchProductFacets")
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    return {
      arrowForwardOutline,
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
.section-grid {
  grid-template-columns: repeat(auto-fill, 200px);
  padding: var( --spacer-lg);
  gap: var(--spacer-lg);
}

.find{
  padding: var( --spacer-lg);
  gap: var(--spacer-lg);
}
ion-list-header > div{
 flex: 1;
 display: flex;
 justify-content: space-between;
}

@media (min-width: 991px) {
 .action {
   position: fixed;
   z-index: 3;
   bottom: 10%;
   left: 50%;
   transform: translate(-50%, 0);
  }
}
</style>
