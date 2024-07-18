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
        <template v-if="ruleGroup.ruleGroupId && rules.length">
          <ScheduleRuleItem />

          <section>
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
import ScheduleRuleItem from '@/components/ScheduleRuleItem.vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import emitter from '@/event-bus';
import { doReorder, showToast } from '@/utils';
import { RuleService } from '@/services/RuleService';

const store = useStore();
const router = useRouter()

const ruleGroup = computed(() => store.getters["rule/getRuleGroup"]);
const rules = computed(() => store.getters["rule/getRules"]);
const isScrollable = computed(() => store.getters["util/isFacilitiesScrollable"]);
const facilities = computed(() => store.getters["util/getFacilities"]);
const selectedSegment = computed(() => store.getters["util/getSelectedSegment"]);
const isReorderActive = computed(() => store.getters["rule/isReorderActive"]);

const reorderingRules = ref([]);
const isScrollingEnabled = ref(false);
const contentRef = ref({}) as any;
const infiniteScrollRef = ref({}) as any;

onIonViewDidEnter(async() => {
  fetchRules();
  emitter.on("productStoreOrConfigChanged", fetchRules);
})

onIonViewDidLeave(() => {
  emitter.off("productStoreOrConfigChanged", fetchRules);
  store.dispatch("rule/updateIsReorderActive", false)
})

async function fetchRules() {
  emitter.emit("presentLoader");
  store.dispatch("rule/updateIsReorderActive", false)
  if(!selectedSegment.value || (selectedSegment.value !== 'RG_PICKUP_FACILITY' && selectedSegment.value !== 'RG_PICKUP_CHANNEL' && selectedSegment.value !== 'PICKUP_FACILITY')) store.dispatch("util/updateSelectedSegment", "RG_PICKUP_FACILITY");
  if(selectedSegment.value === 'PICKUP_FACILITY') {
    await fetchFacilities();
    store.dispatch("util/fetchPickupGroups")
  }
  await Promise.allSettled([store.dispatch('rule/fetchRules', { groupTypeEnumId: selectedSegment.value, pageSize: 50 }), store.dispatch("util/fetchConfigFacilities"), store.dispatch("util/fetchFacilityGroups")])
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
  if(selectedSegment.value === 'PICKUP_FACILITY') {
    isScrollingEnabled.value = false;
    await fetchFacilities();
    store.dispatch("rule/updateIsReorderActive", false)
    store.dispatch("util/fetchPickupGroups")
  } else {
    store.dispatch("rule/updateIsReorderActive", false)
    reorderingRules.value = []
    await store.dispatch('rule/fetchRules', { groupTypeEnumId: selectedSegment.value, pageSize: 50 })
  }
  emitter.emit("dismissLoader");
}

function activateReordering() {
  store.dispatch("rule/updateIsReorderActive", true)
  reorderingRules.value = rules.value;
}

async function saveReorder() {
  const diffRules = reorderingRules.value.filter((reorderRule: any) => rules.value.some((rule: any) => rule.ruleId === reorderRule.ruleId && rule.sequenceNum !== reorderRule.sequenceNum))
  if(!diffRules.length) {
    store.dispatch("rule/updateIsReorderActive", false)
    showToast(translate("No sequence has been changed."))
    return;
  }

  emitter.emit("presentLoader", { messgae: "Saving changes.." })
  const responses = await Promise.allSettled(diffRules.map(async (rule: any) => {
    await RuleService.updateRule(rule, rule.ruleId)
  }))

  const isFailedToUpdateSomeRule = responses.some((response) => response.status === 'rejected')
  if(isFailedToUpdateSomeRule) {
    showToast(translate("Failed to update sequence for some rules."))
  } else {
    showToast(translate("Sequence for rules updated successfully."))
  }
  emitter.emit("dismissLoader");
  await store.dispatch('rule/updateRules', { rules: reorderingRules.value })
  store.dispatch("rule/updateIsReorderActive", false)
}

function updateReorderingRules(event: any) {
  reorderingRules.value = doReorder(event, reorderingRules.value)
}

function createStorePickup() {
  router.push("create-store-pickup")
}
</script>