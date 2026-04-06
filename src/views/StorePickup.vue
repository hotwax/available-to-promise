<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title slot="start">{{ translate("Store pickup") }}</ion-title>

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
        <template v-if="ruleGroup.ruleGroupId && (rules.length || archivedRules.length)">
          <ScheduleRuleItem v-if="rules.length" />
          <ArchivedRuleItem v-if="archivedRules?.length" />

          <section v-if="rules.length">
            <ion-reorder-group :disabled="false" @ionItemReorder="updateReorderingRules($event)">
              <RuleItem v-for="(rule, ruleIndex) in (isReorderActive ? reorderingRules : rules)" :rule="rule" :ruleIndex="ruleIndex" :key="rule.ruleId" />
            </ion-reorder-group>
          </section>
        </template>
        <div class="empty-state" v-else>
          <p>{{ translate("No store pickup rule found.") }}</p>
        </div>
      </main>
      <main v-else>
        <div v-if="!pickupGroups.length" class="empty-state">
          <p>{{ translate("No store pickup group found linked with current product store.") }}</p>
        </div>
        <section v-else-if="facilities.length">
          <FacilityItem v-for="facility in facilities" :facility="facility" :key="facility.facilityId" />
        </section>
        <div v-else class="empty-state">
          <p>{{ translate("No facility found.") }}</p>
        </div>
      </main>

      <ion-infinite-scroll
        @ionInfinite="loadMoreFacilities($event)"
        threshold="100px"
        v-show="selectedSegment === 'PICKUP_FACILITY' && isScrollable"
        ref="infiniteScrollRef"
      >
        <ion-infinite-scroll-content
          loading-spinner="crescent"
          :loading-text="translate('Loading')"
        />
      </ion-infinite-scroll>
    </ion-content>

    <ion-fab v-if="selectedSegment !== 'PICKUP_FACILITY'" vertical="bottom" horizontal="end" slot="fixed" class="ion-margin">
      <ion-fab-button :disabled="!rules.length" class="ion-margin-bottom" color="light" @click="isReorderActive ? saveReorder() : activateReordering()">
        <ion-icon :icon="isReorderActive ? saveOutline : balloonOutline" />
      </ion-fab-button>
      <ion-fab-button :disabled="isReorderActive" @click="createStorePickup()">
        <ion-icon :icon="addOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonLabel, IonMenuButton, IonPage, IonReorderGroup, IonSegment, IonSegmentButton, IonTitle, IonToolbar, onIonViewDidLeave, onIonViewDidEnter } from '@ionic/vue';
import { computed, ref } from 'vue';
import { addOutline, balloonOutline, saveOutline } from 'ionicons/icons';
import RuleItem from '@/components/RuleItem.vue'
import FacilityItem from '@/components/FacilityItem.vue'
import { translate } from '@hotwax/dxp-components';
import emitter from '@/event-bus';
import { doReorder, showToast } from '@/utils';
import ArchivedRuleItem from '@/components/ArchivedRuleItem.vue';
import { useRouter } from 'vue-router';
import { useRuleStore } from '@/store/rule';
import { useUtilStore } from '@/store/util';

const ruleStore = useRuleStore();
const utilStore = useUtilStore();
const router = useRouter()

const ruleGroup = computed(() => ruleStore.getRuleGroup);
const rules = computed(() => ruleStore.getRules);
const isScrollable = computed(() => utilStore.isFacilitiesScrollable);
const facilities = computed(() => utilStore.getFacilities);
const selectedSegment = computed(() => utilStore.getSelectedSegment);
const isReorderActive = computed(() => ruleStore.isReorderActive);
const pickupGroups = computed(() => utilStore.getPickupGroups);
const archivedRules = computed(() => ruleStore.getArchivedRules);

const reorderingRules = ref([]) as any;
const isScrollingEnabled = ref(false);
const contentRef = ref({}) as any;
const infiniteScrollRef = ref({}) as any;

onIonViewDidEnter(async() => {
  fetchRules();
  emitter.on("productStoreOrConfigChanged", fetchRules);
})

onIonViewDidLeave(() => {
  emitter.off("productStoreOrConfigChanged", fetchRules);
  ruleStore.updateIsReorderActive(false)
})

async function fetchRules() {
  emitter.emit("presentLoader");
  ruleStore.updateIsReorderActive(false)
  if(!selectedSegment.value || (selectedSegment.value !== 'RG_PICKUP_FACILITY' && selectedSegment.value !== 'RG_PICKUP_CHANNEL' && selectedSegment.value !== 'PICKUP_FACILITY')) await utilStore.updateSelectedSegment("RG_PICKUP_FACILITY");
  if(selectedSegment.value === 'PICKUP_FACILITY') {
    await Promise.allSettled([fetchFacilities(), utilStore.fetchPickupGroups()]) ;
  } else {
    await Promise.allSettled([ruleStore.fetchRules({ groupTypeEnumId: selectedSegment.value, pageSize: 50 }), utilStore.fetchConfigFacilities(), utilStore.fetchFacilityGroups()])
  }
  emitter.emit("dismissLoader");
}

async function fetchFacilities(vSize?: any, vIndex?: any) {
  const pageSize = vSize ? vSize : process.env.VUE_APP_VIEW_SIZE;
  const pageIndex = vIndex ? vIndex : 0;
  const payload = {
    pageSize,
    pageIndex
  };
  await utilStore.fetchFacilities(payload)
}

function enableScrolling() {
  const parentElement = contentRef.value.$el
  const scrollEl = parentElement.shadowRoot.querySelector("div[part='scroll']")
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
  utilStore.updateSelectedSegment(event.detail.value);

  emitter.emit("presentLoader");
  if(selectedSegment.value === 'PICKUP_FACILITY') {
    isScrollingEnabled.value = false;
    await fetchFacilities();
    ruleStore.updateIsReorderActive(false)
    utilStore.fetchPickupGroups()
  } else {
    ruleStore.updateIsReorderActive(false)
    reorderingRules.value = []
    await ruleStore.fetchRules({ groupTypeEnumId: selectedSegment.value, pageSize: 50 })
  }
  emitter.emit("dismissLoader");
}

function activateReordering() {
  ruleStore.updateIsReorderActive(true)
  reorderingRules.value = rules.value;
}

async function saveReorder() {
  const diffRules = reorderingRules.value.filter((reorderRule: any) => rules.value.some((rule: any) => rule.ruleId === reorderRule.ruleId && rule.sequenceNum !== reorderRule.sequenceNum))
  if(!diffRules.length) {
    ruleStore.updateIsReorderActive(false)
    showToast(translate("No sequence has been changed."))
    return;
  }

  emitter.emit("presentLoader", { messgae: "Saving changes.." })
  const responses = await Promise.allSettled(diffRules.map(async (rule: any) => {
    await ruleStore.updateRuleApi(rule, rule.ruleId)
  }))

  const isFailedToUpdateSomeRule = responses.some((response: any) => response.status === 'rejected')
  if(isFailedToUpdateSomeRule) {
    showToast(translate("Failed to update sequence for some rules."))
  } else {
    showToast(translate("Sequence for rules updated successfully."))
  }
  emitter.emit("dismissLoader");
  await ruleStore.updateRules({ rules: reorderingRules.value })
  ruleStore.updateIsReorderActive(false)
}

function updateReorderingRules(event: any) {
  reorderingRules.value = doReorder(event, reorderingRules.value)
}

function createStorePickup() {
  router.push("create-store-pickup")
}
</script>