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
              <ion-input type="text" :placeholder="$t('global threshold')"/>
            </ion-item>
            <ion-list-header>
              <h3>{{ $t("Include") }}</h3>
              <ion-button fill="clear" color="warning">{{ $t('reset') }}</ion-button>
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
                <ion-chip @click="updateInclusionQuery(tag, 'tag')" :outline="!includedTags.includes(tag)" v-for="(tag, index) in filters['tagsFacet']" :key="index" :disabled="excludedTags.includes(tag)">
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
                <ion-chip @click="updateInclusionQuery(category, 'category')" :outline="!includedCategories.includes(category)" v-for="(category, index) in filters['productCategoryNameFacet']" :key="index" :disabled="excludedCategories.includes(category)">
                  <ion-icon :icon="albumsOutline" />
                  <ion-label>{{ category }}</ion-label>
                  <ion-icon :icon="closeCircle" />
                </ion-chip>
              </ion-card-content>
            </ion-card>
          </ion-list>
          <ion-list>
            <ion-list-header>
              <h3>{{ $t("Exclude") }}</h3>
              <ion-button fill="clear" color="warning">{{ $t('reset') }}</ion-button>
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
                <ion-chip @click="updateExclusionQuery(tag, 'tag')" :outline="!excludedTags.includes(tag)" v-for="(tag, index) in filters['tagsFacet']" :key="index" :disabled="includedTags.includes(tag)">
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
                <ion-chip @click="updateExclusionQuery(category, 'category')" :outline="!excludedCategories.includes(category)" v-for="(category, index) in filters['productCategoryNameFacet']" :key="index" :disabled="includedCategories.includes(category)">
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
                      <p>{{ $t("Color") }}: {{ $filters.getFeature(variant.featureHierarchy, '1/COLOR/') }}</p>
                      <p>{{ $t("Size") }}: {{ $filters.getFeature(variant.featureHierarchy, '1/SIZE/') }}</p>
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
        <ion-button>
          <ion-icon :icon="saveOutline" />
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
  IonInfiniteScroll,
  IonInfiniteScrollContent
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { arrowForwardOutline, downloadOutline, filterOutline, saveOutline, pricetagOutline, closeCircle, addCircleOutline, albumsOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { mapGetters, useStore } from 'vuex';

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
      queryString: '',
      includedTags: [] as Array<string>,
      includedCategories: [] as Array<string>,
      includedShops: [] as Array<string>,
      excludedTags: [] as Array<string>,
      excludedCategories: [] as Array<string>,
      excludedShops: [] as Array<string>
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
      if (type === 'tag') {
        this.includedTags.includes(value) ? this.includedTags.splice(this.includedTags.indexOf(value), 1) : this.includedTags.push(value)
      } else if (type === 'category') {
        this.includedCategories.includes(value) ? this.includedCategories.splice(this.includedCategories.indexOf(value), 1) : this.includedCategories.push(value)
      } else if (type === 'shop') {
        this.includedShops.includes(value) ? this.includedShops.splice(this.includedShops.indexOf(value), 1) : this.includedShops.push(value)
      }
      this.updateQuery();
    },
    updateExclusionQuery(value: string, type: string) {
      if (type === 'tag') {
        this.excludedTags.includes(value) ? this.excludedTags.splice(this.excludedTags.indexOf(value), 1) : this.excludedTags.push(value)
      } else if (type === 'category') {
        this.excludedCategories.includes(value) ? this.excludedCategories.splice(this.excludedCategories.indexOf(value), 1) : this.excludedCategories.push(value)
      } else if (type === 'shop') {
        this.excludedShops.includes(value) ? this.excludedShops.splice(this.excludedShops.indexOf(value), 1) : this.excludedShops.push(value)
      }
      this.updateQuery();
    },
    updateQuery() {
      const payload = {
        "json": {
          "params": {
            "group": true,
            "group.field": "groupId",
            "group.limit": 10000,
            "group.ngroups": true,
            "q.op": "AND"
          } as any,
          "query": "*:*",
          "filter": "docType: PRODUCT"
        }
      }
      payload.json.filter = this.includedTags.length > 0 ? payload.json.filter.concat(` AND tags: (${this.includedTags.join(' OR ')})`) : payload.json.filter
      payload.json.filter = this.excludedTags.length > 0 ? payload.json.filter.concat(` AND -tags: (${this.excludedTags.join(' OR ')})`) : payload.json.filter
      payload.json.filter = this.includedCategories.length > 0 ? payload.json.filter.concat(` AND productCategoryNames: (${this.includedCategories.join(' OR ')})`) : payload.json.filter
      payload.json.filter = this.excludedCategories.length > 0 ? payload.json.filter.concat(` AND -productCategoryNames: (${this.excludedCategories.join(' OR ')})`) : payload.json.filter
      payload.json.filter = this.includedShops.length > 0 ? payload.json.filter.concat(` AND productStoreIds: (${this.includedShops.join(' OR ')})`) : payload.json.filter
      payload.json.filter = this.excludedShops.length > 0 ? payload.json.filter.concat(` AND -productStoreIds: (${this.excludedShops.join(' OR ')})`) : payload.json.filter
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
}

@media (min-width: 991px) {
  .action {
    position: absolute;
    bottom: 10%;
    left: 50%;
    transform: translate(-50%, 0);
  }
}
</style>
