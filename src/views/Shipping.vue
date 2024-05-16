<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ translate("Shipping") }}</ion-title>

        <ion-segment v-model="selectedSegment" @ionChange="updateRuleGroup()" slot="end">
          <ion-segment-button value="RG_SHIPPING_FACILITY">
            <ion-label>{{ translate("Product and facility") }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="RG_SHIPPING_CHANNEL">
            <ion-label>{{ translate("Product and channel") }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="facility">
            <ion-label>{{ translate("Facility") }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content ref="contentRef" :scroll-events="true" @ionScroll="enableScrolling()">
      <main v-if="selectedSegment !== 'facility'">
        <template v-if="ruleGroup.ruleGroupId">
          <ScheduleRuleItem v-if="rules.length" />

          <section>
            <ion-reorder-group :disabled="false" @ionItemReorder="reorderingRules = doReorder($event, reorderingRules)">
              <RuleItem v-for="(rule, ruleIndex) in (isReorderActive ? reorderingRules : rules)" :rule="rule" :ruleIndex="ruleIndex" :key="rule.ruleId" />
            </ion-reorder-group>
          </section>
        </template>
        <div v-else class="empty-state">
          <p>{{ translate("No shipping rule found.") }}</p>
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

    <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="ion-margin">
      <ion-fab-button :disabled="!rules.length" class="ion-margin-bottom" color="light" @click="isReorderActive ? saveReorder() : activateReordering()">
        <ion-icon :icon="isReorderActive ? saveOutline : balloonOutline" />
      </ion-fab-button>
      <ion-fab-button :disabled="isReorderActive" @click="createShipping()">
        <ion-icon :icon="addOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonLabel, IonMenuButton, IonPage, IonReorderGroup, IonSegment, IonSegmentButton, IonTitle, IonToolbar, onIonViewWillEnter } from '@ionic/vue';
import { computed, onUnmounted, ref } from 'vue';
import { addOutline, balloonOutline, saveOutline } from 'ionicons/icons';
import RuleItem from '@/components/RuleItem.vue'
import { translate } from '@/i18n';
import FacilityItem from '@/components/FacilityItem.vue';
import ScheduleRuleItem from '@/components/ScheduleRuleItem.vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import emitter from '@/event-bus';
import { RuleService } from '@/services/RuleService';
import { doReorder, showToast } from '@/utils';

const store = useStore();
const router = useRouter()

const rules = computed(() => store.getters["rule/getRules"]);
const ruleGroup = computed(() => store.getters["rule/getRuleGroup"]);
const isScrollable = computed(() => store.getters["util/isFacilitiesScrollable"]);
const facilities = computed(() => store.getters["util/getFacilities"]);
const isReorderActive = computed(() => store.getters["rule/isReorderActive"]);
const reorderingRules = ref([]);

const selectedSegment = ref("") as any;
const isScrollingEnabled = ref(false);
const contentRef = ref({}) as any;
const infiniteScrollRef = ref({}) as any;

onIonViewWillEnter(async() => {
  fetchRules();
  emitter.on("productStoreOrConfigChanged", fetchRules);
})

onUnmounted(() => {
  emitter.off("productStoreOrConfigChanged", fetchRules);
})

async function fetchRules() {
  emitter.emit("presentLoader");
  selectedSegment.value = router.currentRoute.value.query.groupTypeEnumId ? router.currentRoute.value.query.groupTypeEnumId : "RG_SHIPPING_FACILITY";
  await Promise.allSettled([store.dispatch('rule/fetchRules', { groupTypeEnumId: router.currentRoute.value.query.groupTypeEnumId ? router.currentRoute.value.query.groupTypeEnumId : "RG_SHIPPING_FACILITY" }), store.dispatch("util/fetchConfigFacilities"), store.dispatch("util/fetchFacilityGroups")])
  emitter.emit("dismissLoader");
}

async function fetchFacilities(vSize?: any, vIndex?: any) {
  const pageSize = vSize ? vSize : process.env.VUE_APP_VIEW_SIZE;
  const pageIndex = vIndex ? vIndex : 0;
  const payload = {
    pageSize,
    pageIndex,
    isOrderCountRequired: true
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

async function updateRuleGroup() {
  emitter.emit("presentLoader");
  if(selectedSegment.value === 'facility') {
    isScrollingEnabled.value = false;
    await fetchFacilities();
    store.dispatch("rule/updateIsReorderActive", false)
  } else {
    store.dispatch("rule/updateIsReorderActive", false)
    reorderingRules.value = []
    await store.dispatch('rule/fetchRules', { groupTypeEnumId: selectedSegment.value})
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

  const isFailedToUpdateSomeRUle = responses.some((response) => response.status === 'rejected')
  if(isFailedToUpdateSomeRUle) {
    showToast(translate("Failed to update sequence for some rules."))
  } else {
    showToast(translate("Sequence for rules updated successfully."))
  }
  emitter.emit("dismissLoader");
  await store.dispatch('rule/updateRules', { rules: reorderingRules.value })
  store.dispatch("rule/updateIsReorderActive", false)
}

function createShipping() {
  router.push({ path: '/create-shipping', query: { groupTypeEnumId: selectedSegment.value } })
}
</script>