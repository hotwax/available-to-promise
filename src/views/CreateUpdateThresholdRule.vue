<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/threshold" />
        <ion-title>{{ currentRule.ruleId ? translate("Edit threshold rule") : translate("New threshold rule") }}</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <section>
        <div class="rule-config">
          <ion-card>
            <ion-card-header>
              <ion-card-title>{{ translate("Rule Configuration") }}</ion-card-title>
            </ion-card-header>

            <div class="rule-inputs ion-padding">
              <ion-item>
                <ion-input v-model="formData.ruleName">
                  <div slot="label">{{ translate("Name") }} <ion-text color="danger">*</ion-text></div>
                </ion-input>
              </ion-item>
              <ion-item>
                <ion-input v-model="formData.threshold" type="number" min="0" @keydown="validateThreshold($event)">
                  <div slot="label">{{ translate("Threshold") }} <ion-text color="danger">*</ion-text></div>
                </ion-input>
              </ion-item>
            </div>
          </ion-card>
        </div>
      </section>
      <div class="section-header">
        <h1>{{ translate("Channels") }} <ion-text color="danger">*</ion-text></h1>
      </div>

      <section v-if="configFacilities.length">
        <ion-card v-for="facility in configFacilities" :key="facility.facilityId" @click="toggleFacilitySelection(facility.facilityId)" button>
          <ion-card-header>
            <div>
              <ion-card-title>{{ facility.facilityName }}</ion-card-title>
              <ion-card-subtitle>{{ facility.facilityId }}</ion-card-subtitle>
            </div>
            <ion-checkbox :checked="isFacilitySelected(facility.facilityId)" />
          </ion-card-header>
        </ion-card>
      </section>
      <div v-else class="empty-state">
        <ion-note>{{ translate("No channel found for selected product store. Either change the product store or associate channels with the product store.") }}</ion-note>
      </div>

      <ProductFilters />
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button :disabled="!configFacilities.length" @click="currentRule.ruleId? updateRule() : createThresholdRule()">
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCheckbox, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonPage, IonNote, IonText, IonTitle, IonToolbar, onIonViewWillLeave, onIonViewDidEnter } from '@ionic/vue';
import { saveOutline } from 'ionicons/icons'
import { translate } from "@/i18n";
import ProductFilters from '@/components/ProductFilters.vue';
import { computed, defineProps, ref } from 'vue';
import { useStore } from 'vuex';
import { RuleService } from '@/services/RuleService';
import { generateRuleActions, generateRuleConditions, hasError, showToast } from '@/utils';
import logger from '@/logger';
import router from '@/router';
import emitter from '@/event-bus';

const store = useStore();
const formData = ref({
  ruleName: '',
  threshold: '',
  selectedConfigFacilites: []
}) as any;
const currentRule = ref({}) as any;
const props = defineProps(["ruleId"]);

const configFacilities = computed(() => store.getters["util/getConfigFacilities"])
const appliedFilters = computed(() => store.getters["util/getAppliedFilters"]);
const rules = computed(() => store.getters["rule/getRules"]);
const total = computed(() => store.getters["rule/getTotalRulesCount"])
const currentEComStore = computed(() => store.getters["user/getCurrentEComStore"])

onIonViewDidEnter(async () => {
  emitter.on("productStoreOrConfigChanged", revertRedirect);
  emitter.emit("presentLoader");
  await store.dispatch("util/fetchConfigFacilities");

  if(props.ruleId) {
    try {
      const resp = await RuleService.fetchRules({ ruleId: props.ruleId })

      if(!hasError(resp)) {
        currentRule.value = resp.data[0];

        formData.value.ruleName = currentRule.value.ruleName;
        formData.value.threshold = currentRule.value.ruleActions[0]?.fieldValue ? currentRule.value.ruleActions[0].fieldValue : ''

        const facilityCondition = currentRule.value.ruleConditions.find((condition: any) => condition.conditionTypeEnumId === "ENTCT_ATP_FACILITIES")
        formData.value.selectedConfigFacilites = facilityCondition?.fieldValue ? facilityCondition.fieldValue?.split(",") : [];

        const currentAppliedFilters = JSON.parse(JSON.stringify(appliedFilters.value))
        currentRule.value.ruleConditions.map((condition: any) => {
          if(condition.conditionTypeEnumId === "ENTCT_ATP_FILTER") {
            if(condition.operator === "in") {
              currentAppliedFilters["included"][condition.fieldName] = condition.fieldValue ? condition.fieldValue.split(",") : []
            } else {
              currentAppliedFilters["excluded"][condition.fieldName] = condition.fieldValue ? condition.fieldValue.split(",") : []
            }
          }
        })

        await store.dispatch('util/updateAppliedFilters', currentAppliedFilters)
      } else {
        throw resp.data
      }
    } catch(err: any) {
      logger.error(err);
    }
  }
  emitter.emit("dismissLoader");
})

onIonViewWillLeave(() => {
  formData.value = {
    ruleName: '',
    threshold: '',
    selectedConfigFacilites: []
  }
  store.dispatch("util/clearAppliedFilters")
  emitter.off("productStoreOrConfigChanged", revertRedirect);
})

async function revertRedirect() {
  router.push("/threshold")
}

function toggleFacilitySelection(facilityId: any) {
  if(isFacilitySelected(facilityId)) {
    formData.value.selectedConfigFacilites = formData.value.selectedConfigFacilites.filter((currentFacilityId: string) => currentFacilityId !== facilityId)
  } else {
    formData.value.selectedConfigFacilites.push(facilityId)
  }
}

function isFacilitySelected(facilityId: any) {
  return formData.value.selectedConfigFacilites?.includes(facilityId)
}

async function createThresholdRule() {
  if(!isRuleValid()) return;

  emitter.emit("presentLoader");

  let ruleGroup = await store.dispatch("rule/fetchRuleGroup", { groupTypeEnumId: "RG_THRESHOLD" });

  try {
    if(!ruleGroup.ruleGroupId) {
      ruleGroup = await RuleService.createRuleGroup({
        "groupTypeEnumId": "RG_THRESHOLD",
        "productStoreId": currentEComStore.value.productStoreId,
        "statusId": "ATP_RG_ACTIVE"
      })
    }

    const params = {
      "ruleGroupId": ruleGroup.ruleGroupId,
      "ruleName": formData.value.ruleName,
      "statusId": "ATP_RULE_ACTIVE",
      "sequenceNum": total.value ? rules.value[total.value-1].sequenceNum + 1 : 1
    }

    const rule = await RuleService.createRule(params)

    await RuleService.updateRule({
      ...params,
      "ruleConditions": generateRuleConditions(rule.ruleId, "ENTCT_ATP_FACILITIES", appliedFilters.value, formData.value.selectedConfigFacilites),
      "ruleActions": generateRuleActions(rule.ruleId, "ATP_THRESHOLD", formData.value.threshold, false, [])
    }, rule.ruleId);

    showToast(translate("Rule created successfully."))
    store.dispatch("rule/clearRuleState")
    store.dispatch("util/clearAppliedFilters")
    router.push("/threshold");
  } catch(err: any) {
    logger.error(err);
    showToast(translate("Failed to create rule."))
  }
  emitter.emit("dismissLoader");
}

async function updateRule() {
  if(!isRuleValid()) return;

  const currentRuleConditions = JSON.parse(JSON.stringify(currentRule.value.ruleConditions));
  const updatedRuleConditions = generateRuleConditions(props.ruleId, "ENTCT_ATP_FACILITIES", appliedFilters.value, formData.value.selectedConfigFacilites);
  const conditionsToRemove = currentRuleConditions.filter((condition: any) => !updatedRuleConditions.some((updatedCondition: any) => condition.conditionTypeEnumId === updatedCondition.conditionTypeEnumId && condition.fieldName === updatedCondition.fieldName && condition.operator === updatedCondition.operator))

  updatedRuleConditions.map((updatedCondition: any) => {
    const current = currentRuleConditions.find((condition: any) => condition.conditionTypeEnumId === updatedCondition.conditionTypeEnumId && condition.fieldName === updatedCondition.fieldName && condition.operator === updatedCondition.operator);
    if(current) updatedCondition["conditionSeqId"] = current.conditionSeqId;
  })

  try {
    await RuleService.updateRule({
      ...currentRule.value,
      "ruleName": formData.value.ruleName,
      "ruleConditions": updatedRuleConditions,
      "ruleActions": generateRuleActions(props.ruleId, "ATP_THRESHOLD", formData.value.threshold, true, currentRule.value.ruleActions)
    }, props.ruleId);
    showToast(translate("Rule updated successfully."))

    const removeResponses = await Promise.allSettled(conditionsToRemove.map(async (condition: any) => await RuleService.deleteCondition({ ...condition, ruleId: props.ruleId})));
    const hasFailedResponse = removeResponses.some((response: any) => response.status === 'rejected');
    if(hasFailedResponse) logger.error("Failed to delete some rule conditions.")

    store.dispatch("rule/clearRuleState")
    store.dispatch("util/clearAppliedFilters")
    router.push("/threshold");
  } catch(err: any) {
    logger.error(err);
  }
}

function isRuleValid() {
  if(!formData.value.ruleName.trim() || !formData.value.threshold) {
    showToast(translate("Please fill in all the required fields."))
    return false;
  }
  if(formData.value.threshold < 0){
    showToast(translate("Threshold should be greater than or equal to 0."))
    return false;
  }
  if(!formData.value.selectedConfigFacilites.length) {
    showToast(translate("Please select atleast one channel."))
    return false;
  }
  return true
}

function validateThreshold(event: any) {
  if(/[`!@#$%^&*()_+\-=\\|,.<>?~e]/.test(event.key) && event.key !== 'Backspace') event.preventDefault();
}
</script>

<style scoped>
ion-card-header {
  display: flex;
  flex-direction: row ;
  justify-content: space-between;
  align-items: center;
}

ion-card-header > ion-checkbox {
  flex-shrink: 0;
}

.empty-state {
  align-items: start;
}
</style>