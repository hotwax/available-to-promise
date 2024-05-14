<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ translate("Store pickup") }}</ion-title>

        <ion-segment :value="selectedSegment" @ionChange="updateSegment($event)" slot="end">
          <ion-segment-button value="RG_PICKUP_FACILITY">
            <ion-label>{{ translate("Product and facility") }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="RG_PICKUP_CHANNEL">
            <ion-label>{{ translate("Product and channel") }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="PICKUP_FACILITY">
            <ion-label>{{ translate("Facility") }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content ref="contentRef" :scroll-events="true" @ionScroll="enableScrolling()">
      <main v-if="selectedSegment !== 'PICKUP_FACILITY'">
        <template v-if="ruleGroup.ruleGroupId">
          <ScheduleRuleItem v-if="rules.length" />

          <section>
            <RuleItem :selectedSegment="selectedSegment" v-for="(rule, ruleIndex) in rules" :rule="rule" :ruleIndex="ruleIndex" :key="rule.ruleId" />
          </section>
        </template>
        <div class="empty-state" v-else>
          <p>{{ translate("No store pickup rules found") }}</p>
        </div>
      </main>
      <main v-else>
        <section v-if="facilities.length">
          <FacilityItem v-for="facility in facilities" :facility="facility" :key="facility.facilityId" />
        </section>
        <div v-else class="empty-state">
          <p>{{ translate("No facility found.") }}</p>
        </div>
      </main>

      <ion-infinite-scroll
        @ionInfinite="loadMoreFacilities($event)"
        threshold="100px"
        v-show="isScrollable"
        ref="infiniteScrollRef"
      >
        <ion-infinite-scroll-content
          loading-spinner="crescent"
          :loading-text="translate('Loading')"
        />
      </ion-infinite-scroll>
    </ion-content>

    <ion-fab v-if="selectedSegment !== 'PICKUP_FACILITY'" vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="createStorePickup()">
        <ion-icon :icon="addOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonLabel, IonMenuButton, IonPage, IonSegment, IonSegmentButton, IonTitle, IonToolbar, onIonViewWillLeave, onIonViewDidEnter } from '@ionic/vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { addOutline } from 'ionicons/icons';
import RuleItem from '@/components/RuleItem.vue'
import FacilityItem from '@/components/FacilityItem.vue'
import { translate } from '@/i18n';
import ScheduleRuleItem from '@/components/ScheduleRuleItem.vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import emitter from '@/event-bus';

const store = useStore();
const router = useRouter()

const ruleGroup = computed(() => store.getters["rule/getRuleGroup"]);
const rules = computed(() => store.getters["rule/getRules"]);
const isScrollable = computed(() => store.getters["util/isFacilitiesScrollable"]);
const facilities = computed(() => store.getters["util/getFacilities"]);
const selectedSegment = computed(() => store.getters["util/getSelectedSegment"]);

const isScrollingEnabled = ref(false);
const contentRef = ref({}) as any;
const infiniteScrollRef = ref({}) as any;

onMounted(() => {
  fetchRules();
  emitter.on("productStoreOrConfigChanged", fetchRules);
})

onUnmounted(() => {
  emitter.off("productStoreOrConfigChanged", fetchRules);
})

async function fetchRules() {
  emitter.emit("presentLoader");
  if(!selectedSegment.value || (selectedSegment.value !== 'RG_PICKUP_FACILITY' && selectedSegment.value !== 'RG_PICKUP_CHANNEL' && selectedSegment.value !== 'PICKUP_FACILITY')) store.dispatch("util/updateSelectedSegment", "RG_PICKUP_FACILITY");
  await Promise.allSettled([store.dispatch('rule/fetchRules', { groupTypeEnumId: selectedSegment.value}), store.dispatch("util/fetchConfigFacilities"), store.dispatch("util/fetchFacilityGroups")])
  emitter.emit("dismissLoader");
}

async function fetchFacilities(vSize?: any, vIndex?: any) {
  const pageSize = vSize ? vSize : process.env.VUE_APP_VIEW_SIZE;
  const pageIndex = vIndex ? vIndex : 0;
  const payload = {
    pageSize,
    pageIndex
  };
  await store.dispatch('util/fetchFacilities', payload)
}

function enableScrolling() {
  const parentElement = contentRef.value.$el
  const scrollEl = parentElement.shadowRoot.querySelector("main[part='scroll']")
  let scrollHeight = scrollEl.scrollHeight, infiniteHeight = infiniteScrollRef.value.$el.offsetHeight, scrollTop = scrollEl.scrollTop, threshold = 100, height = scrollEl.offsetHeight
  const distanceFromInfinite = scrollHeight - infiniteHeight - scrollTop - threshold - height
  if(distanceFromInfinite < 0) {
    isScrollingEnabled.value = false;
  } else {
    isScrollingEnabled.value = true;
  }
}

async function loadMoreFacilities(event: any) {
  // Added this check here as if added on infinite-scroll component the Loading content does not gets displayed
  if(!(isScrollingEnabled.value && isScrollable.value)) {
    await event.target.complete();
  }
  fetchFacilities(
    undefined,
    Math.ceil(
      facilities.value?.length / (process.env.VUE_APP_VIEW_SIZE as any)
    ).toString()
  ).then(async () => {
    await event.target.complete();
  });
}

async function updateSegment(event: any) {
  store.dispatch("util/updateSelectedSegment", event.detail.value);

  emitter.emit("presentLoader");
  if(selectedSegment.value === 'facility') {
    isScrollingEnabled.value = false;
    await fetchFacilities();
  } else {
    await store.dispatch('rule/fetchRules', { groupTypeEnumId: selectedSegment.value })
  }
  emitter.emit("dismissLoader");
}

function createStorePickup() {
  router.push("create-store-pickup")
}
</script>