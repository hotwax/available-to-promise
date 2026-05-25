<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/threshold" />
        <ion-title>{{ ruleId ? translate("Edit threshold rule") : translate("New threshold rule") }}</ion-title>
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

      <section>
        <ion-item lines="none">
          <ion-toggle v-model="formData.areAllChannelsSelected">{{ translate("Select all channels") }}</ion-toggle>
        </ion-item>
      </section>

      <section v-if="configFacilities.length">
        <ion-card v-for="facility in configFacilities" :key="facility.facilityId" @click="toggleFacilitySelection(facility.facilityId)" button :disabled="formData.areAllChannelsSelected">
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
import { IonBackButton, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCheckbox, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonPage, IonNote, IonText, IonTitle, IonToggle, IonToolbar, onIonViewWillLeave, onIonViewDidEnter } from '@ionic/vue';
import { saveOutline } from 'ionicons/icons'
import { commonUtil, emitter, logger, translate } from "@common";
import ProductFilters from '@/components/ProductFilters.vue';
import { computed, ref } from 'vue';
import { useUserStore } from '@/store/user';
import { useProductStore } from '@/store/productStore';
import { useRuleStore } from '@/store/rule';
import { ruleUtil } from '@/utils/ruleUtil';
import router from '@/router';

const userStore = useUserStore();
const productStore = useProductStore();
const ruleStore = useRuleStore();

const formData = ref({
  ruleName: '',
  threshold: '',
  selectedConfigFacilites: [],
  areAllChannelsSelected: false
}) as any;
const currentRule = ref({}) as any;
const props = defineProps(["ruleId"]);

const configFacilities = computed(() => productStore.getConfigFacilities)
const appliedFilters = computed(() => productStore.getAppliedFilters);
const appliedFiltersOperator = computed(() => productStore.getAppliedFiltersOperator);
const rules = computed(() => ruleStore.getRules);
const total = computed(() => ruleStore.getTotalRulesCount)
const currentProductStore = computed(() => productStore.getCurrentProductStore)

onIonViewDidEnter(async () => {
  emitter.on("productStoreOrConfigChanged", redirectLink);
  emitter.emit("presentLoader");
  await productStore.fetchConfigFacilities();

  if(props.ruleId) {
    try {
      const resp = await ruleStore.fetchRulesDirect({ ruleId: props.ruleId }) as any;

      if(!commonUtil.hasError(resp)) {
        currentRule.value = resp.data[0];

        formData.value.ruleName = currentRule.value.ruleName;
        formData.value.threshold = currentRule.value.ruleActions[0]?.fieldValue ? currentRule.value.ruleActions[0].fieldValue : ''

        const facilityCondition = currentRule.value.ruleConditions.find((condition: any) => condition.conditionTypeEnumId === "ENTCT_ATP_FACILITIES")
        if(facilityCondition?.fieldValue === "ALL") formData.value.areAllChannelsSelected = true
        else formData.value.selectedConfigFacilites = facilityCondition?.fieldValue ? facilityCondition.fieldValue?.split(",") : [];

        const currentAppliedFilters = JSON.parse(JSON.stringify(appliedFilters.value))
        const currentAppliedFiltersOperator = JSON.parse(JSON.stringify(appliedFiltersOperator.value))
        currentRule.value.ruleConditions.map((condition: any) => {
          if(condition.conditionTypeEnumId === "ENTCT_ATP_FILTER") {
            if(condition.operator === "contains") {
              currentAppliedFilters["included"][condition.fieldName] = condition.fieldValue ? condition.fieldValue.split(",") : []
              currentAppliedFiltersOperator["included"][condition.fieldName] = condition.joinOperator || ""
            } else {
              currentAppliedFilters["excluded"][condition.fieldName] = condition.fieldValue ? condition.fieldValue.split(",") : []
              currentAppliedFiltersOperator["excluded"][condition.fieldName] = condition.joinOperator || ""
            }
          }
        })

        await productStore.updateAppliedFilters(currentAppliedFilters)
        await productStore.updateAppliedFiltersOperator(currentAppliedFiltersOperator)
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
  productStore.clearAppliedFilters()
  productStore.clearAppliedFiltersOperator()
  emitter.off("productStoreOrConfigChanged", redirectLink);
})

async function redirectLink() {
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

  let ruleGroup = await ruleStore.fetchRuleGroup({ groupTypeEnumId: "RG_THRESHOLD" });

  try {
    if(!ruleGroup.ruleGroupId) {
      ruleGroup = await ruleStore.createRuleGroup({
        "groupTypeEnumId": "RG_THRESHOLD",
        "productStoreId": currentProductStore.value.productStoreId,
        "statusId": "ATP_RG_ACTIVE"
      })
    }

    const params = {
      "ruleGroupId": ruleGroup.ruleGroupId,
      "ruleName": formData.value.ruleName,
      "statusId": "ATP_RULE_ACTIVE",
      "sequenceNum": total.value ? rules.value[total.value-1].sequenceNum + 1 : 1
    }

    const rule = await ruleStore.createRule(params)

    await ruleStore.updateRuleApi({
      ...params,
      "ruleConditions": ruleUtil.generateRuleConditions(rule.ruleId, "ENTCT_ATP_FACILITIES", appliedFilters.value, formData.value.selectedConfigFacilites, formData.value.areAllChannelsSelected, appliedFiltersOperator.value),
      "ruleActions": ruleUtil.generateRuleActions(rule.ruleId, "ATP_THRESHOLD", formData.value.threshold, false, [])
    }, rule.ruleId);

    commonUtil.showToast(translate("Rule created successfully."))
    ruleStore.clearRuleState()
    productStore.clearAppliedFilters()
    router.push("/threshold");
  } catch(err: any) {
    logger.error(err);
    commonUtil.showToast(translate("Failed to create rule."))
  }
  emitter.emit("dismissLoader");
}

async function updateRule() {
  if(!isRuleValid()) return;

  const currentRuleConditions = JSON.parse(JSON.stringify(currentRule.value.ruleConditions));
  const updatedRuleConditions = ruleUtil.generateRuleConditions(props.ruleId, "ENTCT_ATP_FACILITIES", appliedFilters.value, formData.value.selectedConfigFacilites, formData.value.areAllChannelsSelected, appliedFiltersOperator.value);
  updatedRuleConditions.map((updatedCondition: any) => {
    const current = currentRuleConditions.find((condition: any) => condition.conditionTypeEnumId === updatedCondition.conditionTypeEnumId && condition.fieldName === updatedCondition.fieldName && condition.operator === updatedCondition.operator);
    if(current) updatedCondition["conditionSeqId"] = current.conditionSeqId;
  })

  const conditionsToRemove = currentRuleConditions.filter((condition: any) => !updatedRuleConditions.some((updatedCondition: any) => condition.conditionTypeEnumId === updatedCondition.conditionTypeEnumId && condition.fieldName === updatedCondition.fieldName && condition.operator === updatedCondition.operator && condition.conditionSeqId === updatedCondition.conditionSeqId))

  try {
    await ruleStore.updateRuleApi({
      ...currentRule.value,
      "ruleName": formData.value.ruleName,
      "ruleConditions": updatedRuleConditions,
      "ruleActions": ruleUtil.generateRuleActions(props.ruleId, "ATP_THRESHOLD", formData.value.threshold, true, currentRule.value.ruleActions)
    }, props.ruleId);
    commonUtil.showToast(translate("Rule updated successfully."))

    const removeResponses = await Promise.allSettled(conditionsToRemove.map(async (condition: any) => await ruleStore.deleteCondition({ ...condition, ruleId: props.ruleId})));
    const hasFailedResponse = removeResponses.some((response: any) => response.status === 'rejected');
    if(hasFailedResponse) logger.error("Failed to delete some rule conditions.")

    ruleStore.clearRuleState()
    productStore.clearAppliedFilters()
    router.push("/threshold");
  } catch(err: any) {
    logger.error(err);
  }
}

function isRuleValid() {
  if(!formData.value.ruleName.trim() || !formData.value.threshold) {
    commonUtil.showToast(translate("Please fill in all the required fields."))
    return false;
  }
  if(formData.value.threshold < 0){
    commonUtil.showToast(translate("Threshold should be greater than or equal to 0."))
    return false;
  }
  if(!formData.value.areAllChannelsSelected && !formData.value.selectedConfigFacilites.length) {
    commonUtil.showToast(translate("Please select atleast one channel."))
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