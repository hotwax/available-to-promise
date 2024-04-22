<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/safety-stock" />
        <ion-title>{{ translate("New safety stock rule") }}</ion-title>
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
                <ion-input :label="translate('Safety stock')" v-model="formData.safetyStock" />
              </ion-item>
            </div>
          </ion-card>
        </div>
      </section>

      <div class="section-header">
        <h1>{{ translate("Facilities") }}</h1>
      </div>

      <section>
        <ion-card>
          <ion-item lines="none">
            <ion-label>{{ translate("Included") }}</ion-label>
            <ion-button fill="clear" @click="openProductFacilityGroupModal('included')">
              {{ translate("Add") }}
              <ion-icon :icon="addCircleOutline" slot="end" />
            </ion-button>
          </ion-item>
          <ion-card-content>
            <ion-chip outline v-for="group in formData.selectedFacilityGroups['included']" :key="group.facilityGroupId">
              {{ group.facilityGroupName }}
              <ion-icon :icon="closeCircle"/>
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
              {{ group.facilityGroupName }}
              <ion-icon :icon="closeCircle"/>
            </ion-chip>
          </ion-card-content>
        </ion-card>
      </section>

      <ProductFilters />
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="createRule()">
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonChip, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonPage, IonTitle, IonToolbar, modalController } from '@ionic/vue';
import { addCircleOutline, closeCircle, saveOutline } from 'ionicons/icons'
import { translate } from "@/i18n";
import ProductFilters from '@/components/ProductFilters.vue';
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import AddProductFacilityGroupModal from '@/components/AddProductFacilityGroupModal.vue';
import { RuleService } from '@/services/RuleService';
import { useRouter } from 'vue-router';
import logger from '@/logger';
import { showToast } from '@/utils';

const router = useRouter();
const store = useStore();

const formData = ref({
  ruleName: '',
  SafetyStock: '',
  selectedFacilityGroups: {
    included: [],
    excluded: []
  }
}) as any;

const appliedFilters = computed(() => store.getters["util/getAppliedFilters"]);
const rules = computed(() => store.getters["rule/getRules"]);
const total = computed(() => store.getters["rule/getTotalRulesCount"])
const currentEComStore = computed(() => store.getters["user/getCurrentEComStore"])

onMounted(async () => {
  store.dispatch("util/clearAppliedFilters")
  await store.dispatch("util/fetchFacilityGroups");
})

async function openProductFacilityGroupModal(type: string) {
  const modal = await modalController.create({
    component: AddProductFacilityGroupModal,
    componentProps: {
      type,
      selectedFacilityGroups: formData.value.selectedFacilityGroups
    }
  })

  modal.onDidDismiss().then((result: any) => {
    if(result.data?.selectedGroups?.length) {
      formData.value.selectedFacilityGroups[type] = result.data.selectedGroups
    }
  })

  modal.present()
}

function generateRuleActions(ruleId: string) {
  return [{
    "ruleId": ruleId,
    "actionTypeEnumId": "ATP_SAFETY_STOCK",
    "fieldName": "facility-safety-stock",
    "fieldValue": formData.value.safetyStock
  }]
}

function generateRuleConditions(ruleId: string) {
  const conditions = [];

  const includedFacilityGroupIds = formData.value.selectedFacilityGroups.included.map((group: any) => group.facilityGroupId)  
  if(includedFacilityGroupIds?.length) {
    conditions.push({
      "ruleId": ruleId,
      "conditionTypeEnumId": "ENTCT_ATP_FAC_GROUPS",
      "fieldName": "facilities",
      "operator": "in",
      "fieldValue": includedFacilityGroupIds.length > 1 ? includedFacilityGroupIds.join(",") : includedFacilityGroupIds[0],
      "multiValued": includedFacilityGroupIds.length > 1 ? "Y" : "N"
    })
  }

  const excludedFacilityGroupIds = formData.value.selectedFacilityGroups.excluded.map((group: any) => group.facilityGroupId)
  if(excludedFacilityGroupIds?.length) {
    conditions.push({
      "ruleId": ruleId,
      "conditionTypeEnumId": "ENTCT_ATP_FAC_GROUPS",
      "fieldName": "facilities",
      "operator": "not-in",
      "fieldValue": excludedFacilityGroupIds.length > 1 ? excludedFacilityGroupIds.join(",") : excludedFacilityGroupIds[0],
      "multiValued": excludedFacilityGroupIds.length > 1 ? "Y" : "N"
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
          "fieldValue": value.length > 1 ? value.join(",") : value[0],
          "multiValued": value.length > 1 ? "Y" : "N"
        })
      }
    })
  })

  return conditions;
}

async function createRule() {
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
      "ruleConditions": generateRuleConditions(rule.ruleId) ? generateRuleConditions(rule.ruleId): [],
      "ruleActions": generateRuleActions(rule.ruleId) ? generateRuleActions(rule.ruleId) : []
    }, rule.ruleId);

    showToast(translate("Rule created successfully."))
    store.dispatch("rule/clearRuleState")
    store.dispatch("util/clearAppliedFilters")
    router.push("/safety-stock");
  } catch(err: any) {
    logger.error(err);
    showToast(translate("Failed to create rule."))
  }  
}
</script>