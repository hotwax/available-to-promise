<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/threshold" />
        <ion-title>{{ currentRule.ruleId ? translate("Update threshold rule") : translate("New threshold rule") }}</ion-title>
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
                <ion-input v-model="formData.threshold" type="number" @keydown="validateThreshold($event)">
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
        <ion-note>{{ translate("No channel found for current product store.") }}</ion-note>
      </div>

      <ProductFilters />
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="currentRule.ruleId? updateRule() : createThresholdRule()">
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCheckbox,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonPage,
  IonNote,
  IonText,
  IonTitle,
  IonToolbar,
  onIonViewWillLeave,
onIonViewWillEnter
} from '@ionic/vue';
import { saveOutline } from 'ionicons/icons'
import { translate } from "@/i18n";
import ProductFilters from '@/components/ProductFilters.vue';
import { computed, defineProps, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { RuleService } from '@/services/RuleService';
import { hasError, showToast } from '@/utils';
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

onIonViewWillLeave(() => {
  formData.value = {
    ruleName: '',
    threshold: '',
    selectedConfigFacilites: []
  }
  store.dispatch("util/clearAppliedFilters")
})

const configFacilities = computed(() => store.getters["util/getConfigFacilities"])
const appliedFilters = computed(() => store.getters["util/getAppliedFilters"]);
const rules = computed(() => store.getters["rule/getRules"]);
const total = computed(() => store.getters["rule/getTotalRulesCount"])
const currentEComStore = computed(() => store.getters["user/getCurrentEComStore"])

onIonViewWillEnter(async () => {
  await store.dispatch("util/fetchConfigFacilities");
  if(props.ruleId) {
    try {
      const resp = await RuleService.fetchRules({ ruleId: props.ruleId })

      if(!hasError(resp)) {
        currentRule.value = resp.data[0];

        formData.value.ruleName = currentRule.value.ruleName;
        formData.value.threshold = currentRule.value.ruleActions[0]?.fieldValue ? currentRule.value.ruleActions[0]?.fieldValue : ''

        const facilityCondition = currentRule.value.ruleConditions.find((condition: any) => condition.conditionTypeEnumId === "ENTCT_ATP_FACILITIES")
        formData.value.selectedConfigFacilites = facilityCondition.fieldValue?.split(",");

        const currentAppliedFilters = JSON.parse(JSON.stringify(appliedFilters.value))
        currentRule.value.ruleConditions.map((condition: any) => {
          if(condition.conditionTypeEnumId === "ENTCT_ATP_FILTER") {
            if(condition.operator === "in") {
              currentAppliedFilters["included"][condition.fieldName] = condition.fieldValue.split(",")
            } else {
              currentAppliedFilters["excluded"][condition.fieldName] = condition.fieldValue.split(",")
            }
          }
        })
        await store.dispatch('util/updateAppliedFilters', currentAppliedFilters)

        console.log(generateRuleConditions(props.ruleId))
      } else {
        throw resp.data
      }
    } catch(err: any) {
      logger.error(err);
    }
  }
})

function toggleFacilitySelection(facilityId: any) {
  if(isFacilitySelected(facilityId)) {
    formData.value.selectedConfigFacilites = formData.value.selectedConfigFacilites.filter((currentFacilityId: string) => currentFacilityId !== facilityId)
  } else {
    formData.value.selectedConfigFacilites.push(facilityId)
  }
}

function isFacilitySelected(facilityId: any) {
  return formData.value.selectedConfigFacilites.includes(facilityId)
}

function generateRuleActions(ruleId: string) {
  if(currentRule.value.ruleId) {
    const ruleAction = currentRule.value.ruleActions.find((action: any) => action.actionTypeEnumId === "ATP_THRESHOLD")
    if(ruleAction) {
      ruleAction.fieldValue = formData.value.threshold ? formData.value.threshold : 0;
      return [ruleAction];
    }
  }

  return [{
    "ruleId": ruleId,
    "actionTypeEnumId": "ATP_THRESHOLD",
    "fieldName": "facility-safety-stock",
    "fieldValue": formData.value.threhold ? formData.value.threhold : 0
  }]
}

function generateRuleConditions(ruleId: string) {
  if(currentRule.value.ruleId) {
    const ruleConditions = JSON.parse(JSON.stringify(currentRule.value.ruleConditions));

    const facilityCondition = ruleConditions.find((condition: any) => condition.conditionTypeEnumId === "ENTCT_ATP_FACILITIES");
    if(facilityCondition) facilityCondition.fieldValue = formData.value.selectedConfigFacilites.join(",");

    Object.entries(appliedFilters.value).map(([type, filters]: any) => {
      Object.entries(filters as any).map(([filter, value]: any) => {
        const condition = ruleConditions.find((condition: any) => condition.conditionTypeEnumId === "ENTCT_ATP_FILTER" && condition.operator === (type === "included" ? "in" : "not-in"))
        if(condition) {
          condition.fieldValue = value.join(",")
        }
      })
    })

    return ruleConditions;
  } else {
    const conditions = [];

    const selectedFacilites = formData.value.selectedConfigFacilites
    if(selectedFacilites?.length) {
      conditions.push({
        "ruleId": ruleId,
        "conditionTypeEnumId": "ENTCT_ATP_FACILITIES",
        "fieldName": "facilities",
        "operator": "in",
        "fieldValue": selectedFacilites.length ? selectedFacilites.join(",") : "",
        "multiValued": "Y"
      })
    }

    Object.entries(appliedFilters.value).map(([type, filters]: any) => {
      Object.entries(filters as any).map(([filter, value]: any) => {
        if(value.length) {
          conditions.push({
            "ruleId": ruleId,
            "conditionTypeEnumId": "ENTCT_ATP_FILTER",
            "fieldName": filter,
            "operator": type === "included" ? "in" : "not-in",
            "fieldValue": value.length ? value.join(",") : "",
            "multiValued": "Y"
          })
        }
      })
    })

    return conditions;
  }
}

async function createThresholdRule() {
  validateRule();

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
      "ruleConditions": generateRuleConditions(rule.ruleId),
      "ruleActions": generateRuleActions(rule.ruleId)
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
  validateRule()
  
  try {
    await RuleService.updateRule({
      ...currentRule.value,
      "ruleName": formData.value.ruleName,
      "ruleConditions": generateRuleConditions(props.ruleId),
      "ruleActions": generateRuleActions(props.ruleId)
    }, props.ruleId);
    showToast(translate("Rule updated successfully."))
    store.dispatch("rule/clearRuleState")
    store.dispatch("util/clearAppliedFilters")
    router.push("/threshold");
  } catch(err: any) {
    logger.error(err);
  }
}

function validateRule() {
  if(!formData.value.ruleName.trim() || !formData.value.threshold) {
    showToast(translate("Please fill in all the required fields."))
    return;
  }
  if(formData.value.threshold < 0){
    showToast(translate("Threshold should be greater than or equal to 0."))
    return;
  }
  if(!formData.value.selectedConfigFacilites.length) {
    showToast(translate("Please select atleast one config facility."))
    return;
  }
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