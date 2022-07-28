<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-back-button slot="start" @click="navigateBack" default-href="/" />
        <ion-title>{{ $t("Threshold management") }}</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="mobile-only">
            <ion-icon :icon="downloadOutline" />
          </ion-button>
          <ion-button fill="clear" class="mobile-only">
            <ion-icon :icon="filterOutline" />
          </ion-button>
          <ion-button v-if="isFilterChanged" fill="clear">
            <ion-icon slot="end" color="warning" :icon="warningOutline"></ion-icon>
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
                <ion-button fill="clear" color="warning" @click="resetFilters('included')">{{ $t('reset') }}</ion-button>
              </div>
            </ion-list-header>
            <ion-card>
              <ion-item lines="none">
                <ion-label>{{ $t("Tags") }}</ion-label>
                <ion-button fill="clear" slot="end" size="small" @click="searchFilter('tags', 'tagsFacet', 'tags', 'included')">
                  <ion-label>{{ $t('add') }}</ion-label>
                  <ion-icon :icon="addCircleOutline" />
                </ion-button>
              </ion-item>
              <ion-item lines="none">
                <ion-label>{{ $t("Operator") }}</ion-label>
                <ion-select interface="popover" @ionChange="applyOperator('included', 'tags', $event.detail.value)" :value="appliedFilters['included']['tags'].operator">
                  <ion-select-option value="AND">AND</ion-select-option>
                  <ion-select-option value="OR">OR</ion-select-option>
                </ion-select>
              </ion-item>
              <ion-card-content>
                <ion-chip v-for="(tag, index) in appliedFilters['included']['tags'].list" :key="index">
                  <ion-icon :icon="pricetagOutline" />
                  <ion-label>{{ tag }}</ion-label>
                  <ion-icon :icon="closeCircle" @click="removeFilters('included', 'tags', tag)"/>
                </ion-chip>
              </ion-card-content>
            </ion-card>
          </ion-list>
          <ion-list>
            <ion-list-header>
              <div>
                <h3>{{ $t("Exclude") }}</h3>
                <ion-button fill="clear" color="warning" @click="resetFilters('excluded')">{{ $t('reset') }}</ion-button>
              </div>
            </ion-list-header>
            <ion-card>
              <ion-item lines="none">
                <ion-label>{{ $t("Tags") }}</ion-label>
                <ion-button fill="clear" slot="end" size="small" @click="searchFilter('tags', 'tagsFacet', 'tags', 'excluded')">
                  <ion-label>{{ $t('add') }}</ion-label>
                  <ion-icon :icon="addCircleOutline" />
                </ion-button>
              </ion-item>
              <ion-item lines="none">
                <ion-label>{{ $t("Operator") }}</ion-label>
                <ion-select @ionChange="applyOperator('excluded', 'tags', $event.detail.value)" interface="popover" :value="appliedFilters['excluded']['tags'].operator">
                  <ion-select-option value="AND">AND</ion-select-option>
                  <ion-select-option value="OR">OR</ion-select-option>
                </ion-select>
              </ion-item>
              <ion-card-content>
                <ion-chip v-for="(tag, index) in appliedFilters['excluded']['tags'].list" :key="index">
                  <ion-icon :icon="pricetagOutline" />
                  <ion-label>{{ tag }}</ion-label>
                  <ion-icon :icon="closeCircle" @click="removeFilters('excluded', 'tags', tag)"/>
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
                    <ion-label>
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
        <ion-button :disabled="isServiceScheduling" @click="saveThreshold()">
          <ion-icon slot="start" :icon="saveOutline" />
          {{ $t($route.query.id? "Update threshold rule" : "Save threshold rule") }}
        </ion-button>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="mobile-only">
        <ion-fab-button :disabled="isServiceScheduling" @click="saveThreshold()">
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
  IonBackButton,
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
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  modalController,
  IonInfiniteScroll,
  IonInfiniteScrollContent
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { arrowForwardOutline, downloadOutline, filterOutline, saveOutline, pricetagOutline, closeCircle, addCircleOutline, albumsOutline, warningOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { mapGetters, useStore } from 'vuex';
import SaveThresholdModal from '@/components/SaveThresholdModal.vue';
import ProductFilterModal from '@/components/ProductFilterModal.vue';
import { hasError, showToast } from '@/utils';
import { translate } from '@/i18n';
import { ProductService } from '@/services/ProductService';
import { JobService } from '@/services/JobService';

export default defineComponent({
  name: 'SelectProduct',
  components: {
    IonBackButton,
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
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
    Image
  },
  computed: {
    ...mapGetters({
      products: 'product/getProducts',
      isScrollable: 'product/isScrollable',
      appliedFilters: 'product/getAppliedFilters',
      query: 'product/getQuery',
      pendingJobs: 'job/getPendingJobs',
      getTagsAndOperator: 'job/getTagsAndOperator',
      getCurrentEComStore:'user/getCurrentEComStore',
      userProfile: 'user/getUserProfile',
      currentEComStore: 'user/getCurrentEComStore',
      shopifyConfig: 'util/getShopifyConfig',
      facilitiesByProductStore: 'util/getFacilityByProductStore',
    })
  },
  data () {
    return {
      threshold: '' as any,
      queryString: '',
      isFilterChanged: false,
      isServiceScheduling: false,
      job: {} as any
    }
  },
  async ionViewWillEnter(){
    if (this.$route.query.id) {
      const job = this.pendingJobs.find((job: any) => job.jobId === this.$route.query.id) ? this.pendingJobs.find((job: any) => job.jobId === this.$route.query.id) : await this.store.dispatch('job/fetchJob', {eComStoreId: this.getCurrentEComStore.productStoreId, jobId: this.$route.query.id})
      if (job) {
        this.job = job;
        if (job.runtimeData?.searchPreferenceId) {
          const includedTags = this.getTagsAndOperator(job.runtimeData.searchPreferenceId, "included").tags
          const excludedTags = this.getTagsAndOperator(job.runtimeData.searchPreferenceId, "excluded").tags
          this.threshold = job.runtimeData.threshold;
          if (includedTags) {
            includedTags.map((tag: any) => {
              this.updateFilter(tag, "included", "tags")
            })
            this.applyOperator("included", "tags", this.getTagsAndOperator(job.runtimeData.searchPreferenceId, "included").operator)
          }
          if (excludedTags) {
            excludedTags.map((tag: any) => {
              this.updateFilter(tag, "excluded", "tags")
            })
            this.applyOperator("excluded", "tags", this.getTagsAndOperator(job.runtimeData.searchPreferenceId, "excluded").operator)
          }  
          this.isFilterChanged = false;
        } else {
          showToast(translate("No threshold rule found. Invalid job"));
        }
      } else {
        showToast(translate("No job found."));
      } 
    }
  },
  methods: {
    async navigateBack(){
      if(this.isFilterChanged){
        const alert = await alertController.create({
          header: this.$t("Save changes"),
          message: this.$t("Make sure you have saved your changes. All unsaved changes to this rule will be lost."),
          buttons: [
            {
              text: this.$t("Keep editing"),
              role: 'cancel',
            },
            {
              text: this.$t("Discard"),
              handler: () => {
                this.router.push("/threshold-updates");
              },
            },
          ],
        });
        return alert.present();
      }
      this.router.push("/threshold-updates");
    },
    searchProducts(event: any) {
      this.queryString = event.target.value;
      this.getProducts();
    },
    async updateFilter(value: string, type: string, id: string) {
      await this.store.dispatch('product/updateAppliedFilters', {
        type,
        id,
        value
      })
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

      if(!this.$route.query.id){
        const saveThresholdModal = await modalController.create({
          component: SaveThresholdModal,
          componentProps: {
            threshold: this.threshold,
            totalSKUs: this.products.total.variant
          }
        })
      
        saveThresholdModal.present();
      } else {
        this.isServiceScheduling = true;
        const solrQuery = this.query

        // re-initialized params object from query as there is no need for grouping or pagination when storing the query
        solrQuery.json.params = {
          "q.op": "AND"
        }
        // made the query to default (*:*) before storing, as the threshold will be set for all the products those
        // are fullfilling the filters condition
        solrQuery.json['query'] = "*:*"

        try {
          const resp = await ProductService.updateSearchPreference({
            searchPrefId: this.job.runtimeData.searchPreferenceId,
            searchPrefValue: JSON.stringify(solrQuery)
          });

          if (resp.status === 200 && !hasError(resp)) {
            const productStoreId = this.currentEComStore.productStoreId
            let shopifyConfigId = this.shopifyConfig[productStoreId]
            let facilityId = this.facilitiesByProductStore[productStoreId]
            if(!shopifyConfigId) {
              const shopifyConfig = await this.store.dispatch('util/getShopifyConfig', productStoreId)
              shopifyConfigId = shopifyConfig.shopifyConfigId
            }

            if (!facilityId) {
              const resp = await this.store.dispatch('util/fetchFacilitiesByProductStore', {
                inputFields: {
                  productStoreId,
                  facilityTypeId: 'CONFIGURATION'
                },
                entityName: 'ProductStoreFacilityDetail',
                fieldList: ['facilityId', 'productStoreId'],
                distinct: 'Y',
                noConditionFind: 'Y',
                filterByDate: 'Y',
                viewSize: 10
              })
              facilityId = resp[productStoreId]
            }
            const payload = {
              'JOB_NAME': this.job.jobName ? this.job.jobName : this.userProfile.partyName,
              'SERVICE_NAME': this.job.serviceName,
              'SERVICE_COUNT': '0',
              'jobFields': {
                'productStoreId': productStoreId,
                'systemJobEnumId': this.job.systemJobEnumId,
                'maxRecurrenceCount': '-1',
                'parentJobId': this.job.parentJobId,
                'recurrenceTimeZone': this.userProfile?.userTimeZone
              },
              'shopifyConfigId': shopifyConfigId,
              'statusId': "SERVICE_PENDING",
              'systemJobEnumId': this.job.systemJobEnumId,
              'includeAll': true, // true: includes all the product, false: includes only products updated in the last 24 hours
              searchPreferenceId: this.job.runtimeData.searchPreferenceId,
              threshold: this.threshold,
              facilityId: facilityId
            } as any;

            // checking if the runtimeData has productStoreId, and if present then adding it on root level
            this.job.runtimeData?.productStoreId?.length >= 0 && (payload['productStoreId'] = productStoreId)
            this.job.priority && (payload['SERVICE_PRIORITY'] = this.job.priority.toString())
  
            JobService.scheduleJob(JSON.parse(JSON.stringify({ ...this.job.runtimeData, ...payload }))).catch((error: any) => { return error })
            if(this.job.runtimeData.threshold !== this.threshold){
              this.job.runtimeData.threshold = this.threshold
              JobService.updateRuntimeData({
                "jobId": this.job.runtimeDataId,
                "runtimeInfo": JSON.stringify(this.job.runtimeData)
              })
            }
            this.isFilterChanged = false;
          } else {
            showToast(translate('Something went wrong'))
          }
        } catch (err) {
          console.error(err)
          showToast(translate('Something went wrong'))
        }
        this.isServiceScheduling = false
      }
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
          this.isFilterChanged = true;
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
      this.isFilterChanged = true;
    },
    async applyOperator(type: string, id: string, value: string) {
      await this.store.dispatch('product/updateAppliedFilterOperator', {
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
      this.isFilterChanged = true;
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
      downloadOutline,
      filterOutline,
      router,
      saveOutline,
      store,
      pricetagOutline,
      closeCircle,
      addCircleOutline,
      albumsOutline,
      warningOutline
    };
  },
});
</script>

<style scoped>

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
