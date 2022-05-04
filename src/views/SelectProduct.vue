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
        <section class="search">
          <ion-searchbar :placeholder="$t('Search products')" v-model="queryString" @keyup.enter="searchProducts($event)" />
        </section>

        <aside class="filters desktop-only">
          <ion-list>
            <ion-list-header><h3>{{ $t("Include") }}</h3></ion-list-header>
            <ion-card>
              <ion-toolbar>
                <ion-title>{{ $t("Tags") }}</ion-title>
              </ion-toolbar>
              <ion-card-content>
                <ion-chip outline>
                  <ion-label>{{ 'Sample' }}</ion-label>
                </ion-chip>
              </ion-card-content>
            </ion-card>
            <ion-card>
              <ion-toolbar>
                <ion-title>{{ $t("Categories") }}</ion-title>
              </ion-toolbar>
              <ion-card-content>
                <ion-chip outline>
                  <ion-label>{{ 'Sample' }}</ion-label>
                </ion-chip>
              </ion-card-content>
            </ion-card>
            <ion-card>
              <ion-toolbar>
                <ion-title>{{ $t("Shop") }}</ion-title>
              </ion-toolbar>
              <ion-card-content>
                <ion-chip outline>
                  <ion-label>{{ 'Sample' }}</ion-label>
                </ion-chip>
              </ion-card-content>
            </ion-card>
          </ion-list>
          <ion-list>
            <ion-list-header><h3>{{ $t("Exclude") }}</h3></ion-list-header>
            <ion-card>
              <ion-toolbar>
                <ion-title>{{ $t("Tags") }}</ion-title>
              </ion-toolbar>
              <ion-card-content>
                <ion-chip outline>
                  <ion-label>{{ 'Sample' }}</ion-label>
                </ion-chip>
              </ion-card-content>
            </ion-card>
            <ion-card>
              <ion-toolbar>
                <ion-title>{{ $t("Categories") }}</ion-title>
              </ion-toolbar>
              <ion-card-content>
                <ion-chip outline>
                  <ion-label>{{ 'Sample' }}</ion-label>
                </ion-chip>
              </ion-card-content>
            </ion-card>
            <ion-card>
              <ion-toolbar>
                <ion-title>{{ $t("Shop") }}</ion-title>
              </ion-toolbar>
              <ion-card-content>
                <ion-chip outline>
                  <ion-label>{{ 'Sample' }}</ion-label>
                </ion-chip>
              </ion-card-content>
            </ion-card>
          </ion-list>
        </aside>

        <main class="main">
          <section class="sort">
            <ion-item lines="none">
              <h2>{{ $t("Results") }}: {{ products.count.virtual }} {{ $t("virtual, ") }} {{ products.count.variant }} {{ $t("variants") }}</h2>
            </ion-item>

            <div>
              <ion-item>
                <ion-label position="fixed">{{ $t("Threshold") }}</ion-label>
                <ion-input type="text" :placeholder="$t('global threshold')"/>
              </ion-item>
            </div>
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
import { arrowForwardOutline, downloadOutline, filterOutline, saveOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { mapGetters, useStore } from "vuex";
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
  computed:{
    ...mapGetters({
      products: 'product/getProducts',
      isScrollable: 'product/isScrollable'
    })
  },
  data(){
    return {
      queryString: '',
    }
  },
  methods:{
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
  },
  mounted() {
    this.getProducts();
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
      store
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
