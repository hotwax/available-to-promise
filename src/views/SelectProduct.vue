<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button v-if="!jobId" slot="start" />
        <ion-back-button v-if="jobId" slot="start" @click="navigateBack" default-href="/" />
        <ion-title>{{ $t("Create rule") }}</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="mobile-only">
            <ion-icon :icon="downloadOutline" />
          </ion-button>
          <ion-button fill="clear" class="mobile-only">
            <ion-icon :icon="filterOutline" />
          </ion-button>
          <ion-button v-if="jobId && (isFilterChanged || threshold != job?.runtimeData?.threshold)" fill="clear">
            <ion-icon slot="end" color="warning" :icon="warningOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content ref="contentRef" :scroll-events="true" @ionScroll="enableScrolling()">
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
                <ion-chip :outline="true" v-for="(tag, index) in appliedFilters['included']['tags'].list" :key="index">
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
                <ion-chip :outline="true" v-for="(tag, index) in appliedFilters['excluded']['tags'].list" :key="index">
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
                  <DxpShopifyImg :src="variant.mainImageUrl" />
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
          <!--
            When searching for a keyword, and if the user moves to the last item, then the didFire value inside infinite scroll becomes true and thus the infinite scroll does not trigger again on the same page(https://github.com/hotwax/users/issues/84).
            Also if we are at the section that has been loaded by infinite-scroll and then move to the details page then the list infinite scroll does not work after coming back to the page
            In ionic v7.6.0, an issue related to infinite scroll has been fixed that when more items can be added to the DOM, but infinite scroll does not fire as the window is not completely filled with the content(https://github.com/ionic-team/ionic-framework/issues/18071).
            The above fix in ionic 7.6.0 is resulting in the issue of infinite scroll not being called again.
            To fix this we have maintained another variable `isScrollingEnabled` to check whether the scrolling can be performed or not.
            If we do not define an extra variable and just use v-show to check for `isScrollable` then when coming back to the page infinite-scroll is called programatically.
            We have added an ionScroll event on ionContent to check whether the infiniteScroll can be enabled or not by toggling the value of isScrollingEnabled whenever the height < 0.
          -->
          <ion-infinite-scroll @ionInfinite="loadMoreProducts($event)" threshold="100px" v-show="isScrollable" ref="infiniteScrollRef">
            <ion-infinite-scroll-content loading-spinner="crescent" :loading-text="$t('Loading')"/>
          </ion-infinite-scroll>
        </main>
      </div>

      <div class="action desktop-only">
        <ion-button v-if="jobId" :disabled="!hasPermission(Actions.APP_THRESHOLD_RULE_UPDATE) || isJobEditable() || isServiceScheduling" @click="updateThreshold()">
          <ion-icon slot="start" :icon="saveOutline" />
          {{ $t("Update threshold rule") }}
        </ion-button>
        <ion-button :disabled="!hasPermission(Actions.APP_THRESHOLD_RULE_UPDATE)" v-else @click="saveThreshold()">
          <ion-icon slot="start" :icon="saveOutline" />
          {{ $t("Save threshold rule") }}
        </ion-button>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="mobile-only">
        <ion-fab-button v-if="jobId" :disabled="!hasPermission(Actions.APP_THRESHOLD_RULE_UPDATE) || isServiceScheduling || isJobEditable()" @click="updateThreshold()">
          <ion-icon :icon="arrowForwardOutline" />
        </ion-fab-button>
        <ion-fab-button :disabled="!hasPermission(Actions.APP_THRESHOLD_RULE_UPDATE)" v-else @click="saveThreshold()">
          <ion-icon :icon="arrowForwardOutline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { DxpShopifyImg } from '@hotwax/dxp-components'; 
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
import ProductFilterModal from '@/components/ProductFilterModal.vue';
import { hasError, showToast } from '@/utils';
import { translate } from '@/i18n';
import { ProductService } from '@/services/ProductService';
import { JobService } from '@/services/JobService';
import { DateTime } from 'luxon';
import { Actions, hasPermission } from '@/authorization'
import emitter from '@/event-bus';

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
    DxpShopifyImg
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
      job: {} as any,
      jobId: "" as any,
      isScrollingEnabled: false
    }
  },
  methods: {
    async applyThresholdRule(){
      let job = this.pendingJobs.find((job: any) => job.jobId === this.jobId)
      job = job ? job : await JobService.fetchJob({eComStoreId: this.getCurrentEComStore.productStoreId, jobId: this.jobId})
      if (job) {
        this.job = job;
        if (job.runtimeData?.searchPreferenceId) {
          await this.store.dispatch('product/setAppliedfiltersAndOperator', this.prepareAppliedFilters(job)); 
          this.threshold = job.runtimeData.threshold;
        } else {
          showToast(translate("No threshold rule found. Invalid job"));
        }
      } else {
        showToast(translate("No job found."));
      }
    },
    isJobEditable(){
      return !(((this.job.statusId === 'SERVICE_PENDING' && this.job.runTime > DateTime.now().toMillis()) && (this.isFilterChanged || this.threshold != this.job.runtimeData.threshold)));
    },
    prepareAppliedFilters(job: any){
      const includedTagsAndOperator = this.getTagsAndOperator(job.runtimeData.searchPreferenceId, "included");
      const excludedTagsAndOperator = this.getTagsAndOperator(job.runtimeData.searchPreferenceId, "excluded");
      return {
        included: {
          tags: {
            list: includedTagsAndOperator.tags,
            operator: includedTagsAndOperator.operator
          }
        },
        excluded: {
          tags: {
            list: excludedTagsAndOperator.tags,
            operator: excludedTagsAndOperator.operator
          } 
        }
      }
    },
    async navigateBack(){
      if(this.isFilterChanged || this.threshold != this.job?.runtimeData?.threshold){
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
                this.isFilterChanged = false;
                this.store.dispatch('product/clearAllFilters');
                this.router.push("/threshold-updates");
              },
            },
          ],
        });
        return alert.present();
      }
      this.router.push("/threshold-updates");
      this.store.dispatch('product/clearAllFilters');
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
    enableScrolling() {
      const parentElement = (this as any).$refs.contentRef.$el
      const scrollEl = parentElement.shadowRoot.querySelector("main[part='scroll']")
      let scrollHeight = scrollEl.scrollHeight, infiniteHeight = (this as any).$refs.infiniteScrollRef.$el.offsetHeight, scrollTop = scrollEl.scrollTop, threshold = 100, height = scrollEl.offsetHeight
      const distanceFromInfinite = scrollHeight - infiniteHeight - scrollTop - threshold - height
      if(distanceFromInfinite < 0) {
        this.isScrollingEnabled = false;
      } else {
        this.isScrollingEnabled = true;
      }
    },
    async loadMoreProducts(event: any){
       // Added this check here as if added on infinite-scroll component the Loading content does not gets displayed
       if(!(this.isScrollingEnabled && this.isScrollable)) {
        await event.target.complete();
      }
      this.getProducts(
        undefined,
        Math.ceil(this.products.list.length / process.env.VUE_APP_VIEW_SIZE).toString()
      ).then(async () => {
        await event.target.complete();
      });
    },
    async updateThreshold() {
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
          const payload = {
            'JOB_NAME': this.job.jobName,
            'SERVICE_NAME': this.job.serviceName,
            'SERVICE_COUNT': '0',
            'jobFields': {
              'productStoreId': this.job.productStoreId ? this.job.productStoreId : '',
              'systemJobEnumId': this.job.systemJobEnumId,
              'parentJobId': this.job.parentJobId
            },
            'shopifyConfigId': this.job.runtimeData.shopifyConfigId ? this.job.runtimeData.shopifyConfigId : "",
            'statusId': "SERVICE_PENDING",
            'systemJobEnumId': this.job.systemJobEnumId,
            'includeAll': true, // true: includes all the product, false: includes only products updated in the last 24 hours
            'searchPreferenceId': this.job.runtimeData.searchPreferenceId,
            'threshold': this.threshold,
            'facilityId': this.job.runtimeData.facilityId ? this.job.runtimeData.facilityId : [],
          } as any;

          // checking if the runtimeData has productStoreId, and if present then adding it on root level
          this.job.runtimeData?.productStoreId?.length >= 0 && (payload['productStoreId'] = this.job.productStoreId)
          this.job.priority && (payload['SERVICE_PRIORITY'] = this.job.priority.toString())

          if(this.job.runtimeData.threshold != this.threshold){
            this.job.runtimeData.threshold = this.threshold
            await this.store.dispatch('job/cancelJob', this.job).then((resp) => {
              if(resp.status === 200 && !hasError(resp)){
                // Scheduling Job that will run only once for all the products
                JobService.scheduleJob(JSON.parse(JSON.stringify({ ...this.job.runtimeData, ...payload }))).then((resp: any) => {
                  if(resp.status === 200 && !hasError(resp) && resp.data){
                    payload['SERVICE_TEMP_EXPR'] = this.job.tempExprId;
                    payload['jobFields'].tempExprId = this.job.tempExprId; // Need to remove this as we are passing frequency in SERVICE_TEMP_EXPR, currently kept it for backward compatibility
                    payload['jobFields'].maxRecurrenceCount = '-1';
                    payload['jobFields'].recurrenceTimeZone = this.job.recurrenceTimeZone;
                    payload['SERVICE_RUN_AS_SYSTEM'] = 'Y';
                    payload['jobFields'].runAsUser = 'system';// default system, but empty in run now. TODO Need to remove this as we are using SERVICE_RUN_AS_SYSTEM, currently kept it for backward compatibility
                    payload['includeAll'] =  false;
                    payload['SERVICE_TIME'] = this.job.runTime.toString()
                    // Scheduling Job that will run everyday and as system
                    JobService.scheduleJob({ ...this.job.runtimeData, ...payload }).then((resp) => {
                      if(resp.status === 200 && !hasError(resp) && resp.data){
                        this.isFilterChanged = false;
                        this.store.dispatch('job/removeThresholdRule', this.job.runtimeData.searchPreferenceId);
                        this.$router.push('/threshold-updates')
                      } else {
                        this.$log.error(resp);
                        showToast(translate('Unable to schedule service.'))
                      }
                    }).catch(error => { return error });
                  } else {
                    this.$log.error(resp);
                    showToast(translate('Unable to schedule service.'))
                  }
                }).catch((error: any) => { return error })
              } else {
                this.$log.error(resp);
              } 
            }).catch(err => {
              this.$log.error(err);
            })
          } else {
            JobService.scheduleJob(JSON.parse(JSON.stringify({ ...this.job.runtimeData, ...payload }))).then((resp: any) => {
              if(resp.status === 200 && !hasError(resp) && resp.data){
                showToast(translate('Service updated successfully'));
                this.isFilterChanged = false;
                this.store.dispatch('job/removeThresholdRule', this.job.runtimeData.searchPreferenceId);
                this.$router.push('/threshold-updates')
              } else {
                this.$log.error(resp);
                showToast(translate('Unable to schedule service.'))
              }
            }).catch((error: any) => { return error })  
          }
        } else {
          showToast(translate('Unable to schedule service.'))
        }
      } catch (err) {
        this.$log.error(err);
        showToast(translate('Unable to update threshold rule.'))
      }
      this.isServiceScheduling = false;
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
      await this.store.dispatch('product/updateThreshold', this.threshold)
      this.router.push('/schedule-threshold')
    },
    async searchFilter(label: string, facetToSelect: string, searchfield: string, type: string) {
      const modal = await modalController.create({
        component: ProductFilterModal,
        componentProps: {
          label,
          facetToSelect,
          searchfield,
          type
        },
        backdropDismiss: false
      })
      modal.onDidDismiss().then((payload) => {
        if(payload.data?.isFilterChanged){
          this.queryString = '';
          this.isFilterChanged = true;
        }
      })
      modal.present();
    },
    async removeFilters(type: string, id: string, value: string) {
      const appliedFilters = JSON.parse(JSON.stringify(this.appliedFilters[type][id]))
      appliedFilters.list.splice(appliedFilters.list.indexOf(value), 1)

      await this.store.dispatch('product/updateAppliedFilters', {
        type,
        id,
        value: appliedFilters
      })
      this.queryString = ''
      this.isFilterChanged = true;
    },
    async applyOperator(type: string, id: string, value: string) {
      // TODO Find a better way
      // This is done as when applying the exisiting rule as the value of the select box changes
      // query is sent multiple times
      if (this.appliedFilters[type][id].operator === value) return;

      await this.store.dispatch('product/updateAppliedFilterOperator', {
        type,
        id,
        value
      })
      this.queryString = ''
      this.isFilterChanged = true;
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
    emitter.off("productStoreChanged", this.getProducts);
  },
  async ionViewWillEnter(){
    this.isScrollingEnabled = false;
    this.jobId = this.$route.query.id
    this.isFilterChanged = false;
    if (this.jobId) {
      this.applyThresholdRule()
    } else {
      // subscribing for emitter only we are creating a new rule for job scheduling, as when updating a rule
      // there is no option to change the product store
      emitter.on("productStoreChanged", this.getProducts);
      this.getProducts();
    }
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    return {
      Actions,
      arrowForwardOutline,
      downloadOutline,
      filterOutline,
      hasPermission,
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
  grid-auto-flow: column;
  grid-auto-columns: 200px;
  grid-template-columns: none;
  width: 100vw;
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
}

.section-grid > div {
  scroll-snap-align: start;
  /* Here 20px padding-bottom is given 
    to match the 10px bottom and 10px top margin of card */
  padding-bottom: calc(10px * 2);
}

.section-grid > div > ion-card {
  height: 100%;
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

  .section-grid {
    width: unset;
    grid-auto-columns: unset;
    grid-template-columns: repeat(auto-fill, 200px);
    grid-auto-flow: unset;
    overflow: unset;
  }
}
</style>
