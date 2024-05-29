<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/safety-stock" />
        <ion-title>{{ ruleId ? translate("Edit safety stock rule") : translate("New safety stock rule") }}</ion-title>
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
                <ion-input v-model="formData.safetyStock" type="number" min="0" @keydown="validateSafetyStock($event)">
                  <div slot="label">{{ translate("Safety stock") }} <ion-text color="danger">*</ion-text></div>
                </ion-input>
              </ion-item>
            </div>
          </ion-card>
        </div>
      </section>

      <div class="section-header">
        <h1>{{ translate("Facilities") }} <ion-text color="danger">*</ion-text></h1>
      </div>

      <section v-if="facilityGroups.length">
        <ion-card>
          <ion-item lines="none">
            <ion-label>{{ translate("Included") }} <ion-text color="danger">*</ion-text></ion-label>
            <ion-button fill="clear" @click="openProductFacilityGroupModal('included')">
              {{ translate("Add") }}
              <ion-icon :icon="addCircleOutline" slot="end" />
            </ion-button>
          </ion-item>
          <ion-card-content>
            <ion-chip outline v-for="group in formData.selectedFacilityGroups['included']" :key="group.facilityGroupId">
              {{ group.facilityGroupName ? group.facilityGroupName : group.facilityGroupId }}
              <ion-icon :icon="closeCircle" @click="removeFacilityGroups(group.facilityGroupId, 'included')" />
            </ion-chip>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-item lines="none"> 
            <ion-label>{{ translate("Excluded") }}</ion-label>
            <ion-button fill="clear" @click="openProductFacilityGroupModal('excluded')">
              {{ translate("Add") }}
              <ion-icon :icon="addCircleOutline" slot="end" />
            </ion-button>
          </ion-item>
          <ion-card-content>
            <ion-chip outline v-for="group in formData.selectedFacilityGroups['excluded']" :key="group.facilityGroupId">
              {{ group.facilityGroupName ? group.facilityGroupName : group.facilityGroupId }}
              <ion-icon :icon="closeCircle" @click="removeFacilityGroups(group.facilityGroupId, 'excluded')" />
            </ion-chip>
          </ion-card-content>
        </ion-card>
      </section>
      <div v-else class="empty-state">
        <ion-note>{{ translate("No facility group found for selected product store. Either change the product store or associate facility groups with the product store.") }}</ion-note>
      </div>

      <ProductFilters />
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button :disabled="!facilityGroups.length" @click="currentRule.ruleId ? updateRule() : createRule()">
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonChip, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonNote, IonPage, IonText, IonTitle, IonToolbar, modalController, onIonViewDidEnter  , onIonViewWillLeave } from '@ionic/vue';
import { addCircleOutline, closeCircle, saveOutline } from 'ionicons/icons'
import { translate } from "@/i18n";
import ProductFilters from '@/components/ProductFilters.vue';
import { computed, defineProps, ref } from 'vue';
import { useStore } from 'vuex';
import AddProductFacilityGroupModal from '@/components/AddProductFacilityGroupModal.vue';
import { RuleService } from '@/services/RuleService';
import { useRouter } from 'vue-router';
import logger from '@/logger';
import { generateRuleActions, generateRuleConditions, hasError, showToast } from '@/utils';
import emitter from '@/event-bus';

const router = useRouter();
const store = useStore();

const formData = ref({
  ruleName: '',
  safetyStock: '',
  selectedFacilityGroups: {
    included: [],
    excluded: []
  }
}) as any;
const currentRule = ref({}) as any;
const props = defineProps(["ruleId"]);

const appliedFilters = computed(() => store.getters["util/getAppliedFilters"]);
const rules = computed(() => store.getters["rule/getRules"]);
const total = computed(() => store.getters["rule/getTotalRulesCount"])
const currentEComStore = computed(() => store.getters["user/getCurrentEComStore"])
const facilityGroups = computed(() => store.getters["util/getFacilityGroups"])

onIonViewDidEnter(async () => {
  emitter.on("productStoreOrConfigChanged", redirectLink);
  emitter.emit("presentLoader");
  await store.dispatch("util/fetchFacilityGroups")
  
  if(props.ruleId) {
    try {
      const resp = await RuleService.fetchRules({ ruleId: props.ruleId })

      if(!hasError(resp)) {
        currentRule.value = resp.data[0];

        formData.value.ruleName = currentRule.value.ruleName;
        formData.value.safetyStock = currentRule.value.ruleActions[0]?.fieldValue ? currentRule.value.ruleActions[0].fieldValue : ''

        const includedGroups = currentRule.value.ruleConditions.find((condition: any) => condition.conditionTypeEnumId === "ENTCT_ATP_FAC_GROUPS" && condition.operator === "in")
        const includedGroupIds = includedGroups?.fieldValue ? includedGroups.fieldValue.split(",") : []
        formData.value.selectedFacilityGroups.included = facilityGroups.value.filter((group: any) => includedGroupIds.includes(group.facilityGroupId));
        
        const excludedGroups = currentRule.value.ruleConditions.find((condition: any) => condition.conditionTypeEnumId === "ENTCT_ATP_FAC_GROUPS" && condition.operator === "not-in")
        const excludedGroupIds = excludedGroups?.fieldValue ? excludedGroups.fieldValue.split(",") : []
        formData.value.selectedFacilityGroups.excluded = facilityGroups.value.filter((group: any) => excludedGroupIds.includes(group.facilityGroupId));

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
    safetyStock: '',
    selectedFacilityGroups: {
      included: [],
      excluded: []
    }
  }
  store.dispatch("util/clearAppliedFilters")
  emitter.off("productStoreOrConfigChanged", redirectLink);
})

async function redirectLink() {
  router.push("/safety-stock");
}

async function openProductFacilityGroupModal(type: string) {
  const modal = await modalController.create({
    component: AddProductFacilityGroupModal,
    componentProps: {
      type,
      selectedFacilityGroups: formData.value.selectedFacilityGroups
    }
  })

  modal.onDidDismiss().then((result: any) => {
    if(result.data?.selectedGroups) {
      formData.value.selectedFacilityGroups[type] = result.data.selectedGroups
    }
  })

  modal.present()
}

async function createRule() {
  if(!isRuleValid()) return;

  emitter.emit("presentLoader");

  let ruleGroup = await store.dispatch("rule/fetchRuleGroup", { groupTypeEnumId: "RG_SAFETY_STOCK" });

  try {
    if(!ruleGroup.ruleGroupId) {
      ruleGroup = await RuleService.createRuleGroup({
        "groupTypeEnumId": "RG_SAFETY_STOCK",
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
      "ruleConditions": generateRuleConditions(rule.ruleId, "ENTCT_ATP_FAC_GROUPS", appliedFilters.value, formData.value.selectedFacilityGroups),
      "ruleActions": generateRuleActions(rule.ruleId, "ATP_SAFETY_STOCK", formData.value.safetyStock, false, [])
    }, rule.ruleId);

    showToast(translate("Rule created successfully."))
    store.dispatch("rule/clearRuleState")
    store.dispatch("util/clearAppliedFilters")
    router.push("/safety-stock");
  } catch(err: any) {
    logger.error(err);
    showToast(translate("Failed to create rule."))
  }
  emitter.emit("dismissLoader");
}

async function updateRule() {
  if(!isRuleValid()) return;

  const currentRuleConditions = JSON.parse(JSON.stringify(currentRule.value.ruleConditions));
  const updatedRuleConditions = generateRuleConditions(props.ruleId, "ENTCT_ATP_FAC_GROUPS", appliedFilters.value, formData.value.selectedFacilityGroups);
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
      "ruleActions": generateRuleActions(props.ruleId, "ATP_SAFETY_STOCK", formData.value.safetyStock, true, currentRule.value.ruleActions)
    }, props.ruleId);
    showToast(translate("Rule updated successfully."))

    const removeResponses = await Promise.allSettled(conditionsToRemove.map(async (condition: any) => await RuleService.deleteCondition({ ...condition, ruleId: props.ruleId})));
    const hasFailedResponse = removeResponses.some((response: any) => response.status === 'rejected');
    if(hasFailedResponse) logger.error("Failed to delete some rule conditions.")

    store.dispatch("rule/clearRuleState")
    store.dispatch("util/clearAppliedFilters")
    router.push("/safety-stock");
  } catch(err: any) {
    logger.error(err);
  }
}

function isRuleValid() {
  if(!formData.value.ruleName.trim() || !formData.value.safetyStock) {
    showToast(translate("Please fill in all the required fields."))
    return false;
  }

  if(formData.value.safetyStock < 0) {
    showToast(translate("Safety stock should be greater than or equal to 0."));
    return false;
  }

  if(!formData.value.selectedFacilityGroups.included.length) {
    showToast(translate("Please include atleast one facility."))
    return false;
  }

  return true
}

function validateSafetyStock(event: any) {
  if(/[`!@#$%^&*()_+\-=\\|,.<>?~e]/.test(event.key) && event.key !== 'Backspace') event.preventDefault();
}

function removeFacilityGroups(facilityGroupId: any, type: string) {
  formData.value.selectedFacilityGroups[type] = formData.value.selectedFacilityGroups[type].filter((group: any) => group.facilityGroupId !== facilityGroupId)
}
</script>

<style scoped>
.empty-state {
  align-items: start;
}
</style>