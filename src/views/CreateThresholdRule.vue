<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/threshold" />
        <ion-title>{{ translate("New threshold rule") }}</ion-title>
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
                <ion-input :label="translate('Name')" v-model="formData.ruleName" />
              </ion-item>
              <ion-item>
                <ion-input :label="translate('Threshold')" v-model="formData.threshold" />
              </ion-item>
            </div>
          </ion-card>
        </div>
      </section>
      <div class="section-header">
        <h1>{{ translate("Channels") }}</h1>
      </div>

      <section> 
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

      <ProductFilters />
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="createThresholdRule()">
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
  IonTitle,
  IonToolbar
} from '@ionic/vue';
import { saveOutline } from 'ionicons/icons'
import { translate } from "@/i18n";
import ProductFilters from '@/components/ProductFilters.vue';
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { RuleService } from '@/services/RuleService';
import { showToast } from '@/utils';
import logger from '@/logger';
import router from '@/router';

const store = useStore();
const formData = ref({
  ruleName: '',
  threshold: '',
  selectedConfigFacilites: []
}) as any;

const configFacilities = computed(() => store.getters["util/getConfigFacilities"])
const appliedFilters = computed(() => store.getters["util/getAppliedFilters"]);
const rules = computed(() => store.getters["rule/getRules"]);
const total = computed(() => store.getters["rule/getTotalRulesCount"])

onMounted(async () => {
  await store.dispatch("util/fetchConfigFacilities");
})

function toggleFacilitySelection(facilityId: any) {
  if(formData.value.selectedConfigFacilites.includes(facilityId)) {
    formData.value.selectedConfigFacilites = formData.value.selectedConfigFacilites.filter((currentFacilityId: string) => currentFacilityId !== facilityId)
  } else {
    formData.value.selectedConfigFacilites.push(facilityId)
  }
}

function isFacilitySelected(facilityId: any) {
  return formData.value.selectedConfigFacilites.includes(facilityId)
}

function generateRuleActions(ruleId: string) {
  return [{
    "_entity": "ruleAction",
    "ruleId": ruleId,
    "actionTypeEnumId": "ATP_THRESHOLD",
    "fieldName": "safety_stock",
    "fieldValue": formData.value.threshold
  }]
}

function generateRuleConditions(ruleId: string) {
  const conditions = [];
  
  const selectedFacilites = formData.value.selectedConfigFacilites
  if(selectedFacilites?.length) {
    conditions.push({
      "_entity": "ruleCondition",
      "ruleId": ruleId,
      "conditionTypeEnumId": "ENTCT_ATP_FACILITIES",
      "fieldName": "facilities",
      "operator": "in",
      "fieldValue": selectedFacilites.length > 1 ? selectedFacilites.join(",") : selectedFacilites[0],
      "multiValued": selectedFacilites.length > 1 ? "Y" : "N"
    })
  }

  Object.entries(appliedFilters.value).map(([type, filters]: any) => {
    Object.entries(filters as any).map(([filter, value]: any) => {
      if(value.length) {
        conditions.push({ 
          "_entity": "ruleCondition",
          "ruleId": ruleId,
          "conditionTypeEnumId": "ENTCT_ATP_FILTER",
          "fieldName": filter,
          "operator": type === "included" ? "in" : "not-in",
          "fieldValue": value.length > 1 ? value.join(",") : value[0],
          "multiValued": value?.length > 1 ? "Y" : "N"
        })
      }
    })
  })

  return conditions;
}

async function createThresholdRule() {
  let ruleGroup =   await store.dispatch("rule/fetchRuleGroup", { groupTypeEnumId: "RG_THRESHOLD" });

  try {
    if(!ruleGroup.ruleGroupId) {
      ruleGroup = await RuleService.createRuleGroup({
        "_entity": "ruleGroup",
        "groupTypeEnumId": "RG_THRESHOLD"
      })
    }

    const params = {
      "_entity": "rule",
      "ruleId": formData.value.ruleName.trim().toUpperCase().split(' ').join('_'),
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
    router.push("/threshold");
  } catch(err: any) {
    logger.error(err);
    showToast(translate("Failed to create rule."))
  }  
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
</style>