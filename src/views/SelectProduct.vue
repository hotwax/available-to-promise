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
          <ion-button class="desktop-only" @click="() => router.push('/select-product-csv-upload')">{{ $t("Upload CSV") }}</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="find">
        <section class="search">
          <ion-searchbar placeholder="Search products" v-model="queryString" @keyup.enter="searchProducts($event)"/>
        </section>

        <aside class="filters desktop-only">
          <ion-item>
            <ion-label>{{ $t("Only show selected products") }}</ion-label>
            <ion-toggle slot="end" />
          </ion-item>
        </aside>

        <section class="main">
          <div  v-for="product in products" :key="product">
          <section class="sort"></section>

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

            <div class="metadata desktop-only">
              <ion-item lines="none">
                <ion-label>{{ $t("Select all variants") }}</ion-label>
                <ion-toggle v-model="product.isSelected" @click="selectAllVariants(product)" />
              </ion-item>
            </div>
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
                <ion-checkbox v-model="variant.isSelected" @click="select(variant)" slot="end" />
              </ion-item>
            </ion-card>
            </div>
          </section>
          <hr />
          </div>
        </section>
      </div>

      <div class="action desktop-only">
        <ion-button @click="() => router.push('/select-facility')">
          {{ $t("Select locations") }}
          <ion-icon :icon="arrowForwardOutline" />
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
  IonCheckbox,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonMenuButton,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToggle,
  IonToolbar
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { arrowForwardOutline, downloadOutline, filterOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { mapGetters, useStore } from "vuex";

export default defineComponent({
  name: 'SelectProduct',
  components: {
    IonButton,
    IonButtons,
    IonCard,
    IonCheckbox,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonMenuButton,
    IonPage,
    IonSearchbar,
    IonTitle,
    IonToggle,
    IonToolbar,
    Image
  },
  computed:{
    ...mapGetters({
      products: 'product/getProducts'
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
    selectAllVariants(product: any){
      product.variants.forEach((variant: any) => {
        variant.isSelected = !product.isSelected
      })
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
          "filter": "docType: PRODUCT"
        }
      }
      if(this.queryString) {
        payload.json.params.defType = 'edismax'
        payload.json.params.qf = 'productId productName sku internalName brandName'
        payload.json.params['q.op'] = 'AND'
        payload.json.query = `*${this.queryString}*`
      }
      this.store.dispatch("product/getProducts", payload);
    }
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
  grid-template-columns: repeat(auto-fill, 200px);
}

@media (min-width: 991px) {
  .action {
    position: absolute;
    bottom: 25px;
    left: 50%;
    transform: translate(-50%, 0);
  }
}
</style>
