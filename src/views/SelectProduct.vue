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
          <ion-searchbar :placeholder="$t('Search products')" />
        </section>

        <aside class="filters desktop-only">
          <ion-list>
            <ion-list-header><h3>{{ $t("Include") }}</h3></ion-list-header>
            <ion-card>
              <ion-toolbar>
                <ion-title>{{ $t("Tags") }}</ion-title>
              </ion-toolbar>
              <ion-card-content>
                <ion-chip @click="updateInclusionQuery(tag, 'tags')" :outline="!included['tags'].includes(tag)" v-for="(tag, index) in filters['tagsFacet']" :key="index" :disabled="excluded['tags'].includes(tag)">
                  <ion-label>{{ tag }}</ion-label>
                </ion-chip>
              </ion-card-content>
            </ion-card>
            <ion-card>
              <ion-toolbar>
                <ion-title>{{ $t("Categories") }}</ion-title>
              </ion-toolbar>
              <ion-card-content>
                <ion-chip @click="updateInclusionQuery(category, 'productCategoryNames')" :outline="!included['productCategoryNames'].includes(category)" v-for="(category, index) in filters['productCategoryNameFacet']" :key="index" :disabled="excluded['productCategoryNames'].includes(category)">
                  <ion-label>{{ category }}</ion-label>
                </ion-chip>
              </ion-card-content>
            </ion-card>
            <ion-card>
              <ion-toolbar>
                <ion-title>{{ $t("Shop") }}</ion-title>
              </ion-toolbar>
              <ion-card-content>
                <ion-chip @click="updateInclusionQuery(productStoreId, 'productStoreIds')" :outline="!included['productStoreIds'].includes(productStoreId)" v-for="(productStoreId, index) in filters['productStoreIdFacet']" :key="index" :disabled="excluded['productStoreIds'].includes(productStoreId)">
                  <ion-label>{{ productStoreId }}</ion-label>
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
                <ion-chip @click="updateExclusionQuery(tag, 'tags')" :outline="!excluded['tags'].includes(tag)" v-for="(tag, index) in filters['tagsFacet']" :key="index" :disabled="included['tags'].includes(tag)">
                  <ion-label>{{ tag }}</ion-label>
                </ion-chip>
              </ion-card-content>
            </ion-card>
            <ion-card>
              <ion-toolbar>
                <ion-title>{{ $t("Categories") }}</ion-title>
              </ion-toolbar>
              <ion-card-content>
                <ion-chip @click="updateExclusionQuery(category, 'productCategoryNames')" :outline="!excluded['productCategoryNames'].includes(category)" v-for="(category, index) in filters['productCategoryNameFacet']" :key="index" :disabled="included['productCategoryNames'].includes(category)">
                  <ion-label>{{ category }}</ion-label>
                </ion-chip>
              </ion-card-content>
            </ion-card>
            <ion-card>
              <ion-toolbar>
                <ion-title>{{ $t("Shop") }}</ion-title>
              </ion-toolbar>
              <ion-card-content>
                <ion-chip @click="updateExclusionQuery(productStoreId, 'productStoreIds')" :outline="!excluded['productStoreIds'].includes(productStoreId)" v-for="(productStoreId, index) in filters['productStoreIdFacet']" :key="index" :disabled="included['productStoreIds'].includes(productStoreId)">
                  <ion-label>{{ productStoreId }}</ion-label>
                </ion-chip>
              </ion-card-content>
            </ion-card>
          </ion-list>
        </aside>

        <main class="main">
          <section class="sort">
            <ion-item lines="none">
              <h2>{{ $t("Results") }}:</h2>
            </ion-item>

            <div>
              <ion-item>
                <ion-label position="fixed">{{ $t("Threshold") }}</ion-label>
                <ion-input type="text" :placeholder="$t('global threshold')" v-model="threshold"/>
              </ion-item>
            </div>
          </section>

          <hr />

          <section class="section-header">
            <div class="primary-info">
              <ion-item lines="none">
                <ion-label>
                  Parent Product
                  <p>5 {{ $t("variants") }}</p>
                </ion-label>
              </ion-item>
            </div>

            <div class="tags"></div>
          </section>

          <section class="section-grid">
            <ion-card>
              <Image src="https://cdn.shopify.com/s/files/1/0069/7384/9727/products/test-track.jpg?v=1626255137" />
              <ion-item lines="none">
                <ion-label>
                  SKU
                  <p>Color: Blue</p>
                  <p>Size: XL</p>
                </ion-label>
              </ion-item>
            </ion-card>
          </section>
          <hr />
        </main>
      </div>

      <div class="action desktop-only">
        <ion-button @click="saveThreshold()">
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
  modalController
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { arrowForwardOutline, downloadOutline, filterOutline, saveOutline } from 'ionicons/icons';
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
  mounted() {
    this.store.dispatch("product/fetchProductFacets")
  },
  data () {
    return {
      included: {
        tags: [] as Array<string>,
        productCategoryNames: [] as Array<string>,
        productStoreIds: [] as Array<string>
      } as any,
      excluded: {
        tags: [] as Array<string>,
        productCategoryNames: [] as Array<string>,
        productStoreIds: [] as Array<string>
      } as any,
      threshold: '' as any,
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
    updateInclusionQuery(value: string, type: string) {
      this.included[type].includes(value) ? this.included[type].splice(this.included[type].indexOf(value), 1) : this.included[type].push(value)
      this.updateQuery();
    },
    updateExclusionQuery(value: string, type: string) {
      this.excluded[type].includes(value) ? this.excluded[type].splice(this.excluded[type].indexOf(value), 1) : this.excluded[type].push(value)
      this.updateQuery();
    },
    updateQuery() {
      // initializing the filter always on updateQuery call because we are adding values in the filter
      // as string and if some value is removed then we need to do multiple operations on the filter string
      // to remove that value from the query filter
      this.query.json['filter'] = ["docType: PRODUCT"]

      this.included['tags'].length > 0 && this.query.json['filter'].push(`tags: (${this.included['tags'].join(' OR ')})`)
      this.included['productCategoryNames'].length > 0 && this.query.json['filter'].push(`productCategoryNames: (${this.included['productCategoryNames'].join(' OR ')})`)
      this.included['productStoreIds'].length > 0 && this.query.json['filter'].push(`productStoreIds: (${this.included['productStoreIds'].join(' OR ')})`)

      this.excluded['tags'].length > 0 && this.query.json['filter'].push(`-tags: (${this.excluded['tags'].join(' OR ')})`)
      this.excluded['productCategoryNames'].length > 0 && this.query.json['filter'].push(`-productCategoryNames: (${this.excluded['productCategoryNames'].join(' OR ')})`)
      this.excluded['productStoreIds'].length > 0 && this.query.json['filter'].push(`-productStoreIds: (${this.excluded['productStoreIds'].join(' OR ')})`)
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
          query: this.query
        }
      })

      saveThresholdModal.present();
    }
  },
  computed: {
    ...mapGetters({
      filters: 'product/getProductFacets'
    })
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
