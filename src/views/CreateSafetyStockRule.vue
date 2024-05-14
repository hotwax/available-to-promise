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
                <ion-input v-model="formData.ruleName">
                  <div slot="label">{{ translate("Name") }} <ion-text color="danger">*</ion-text></div>
                </ion-input>
              </ion-item>
              <ion-item>
                <ion-input v-model="formData.safetyStock" type="number" @keydown="validateSafetyStock($event)">
                  <div slot="label">{{ translate("Safety stock") }} <ion-text color="danger">*</ion-text></div>
                </ion-input>
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
            <ion-label>{{ translate("Included") }} <ion-text color="danger">*</ion-text></ion-label>
            <ion-button fill="clear" @click="openProductFacilityGroupModal('included')">
              {{ translate("Add") }}
              <ion-icon :icon="addCircleOutline" slot="end" />
            </ion-button>
          </ion-item>
          <ion-card-content>
            <ion-chip outline v-for="group in formData.selectedFacilityGroups['included']" :key="group.facilityGroupId">
              {{ group.facilityGroupName }}
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
              {{ group.facilityGroupName }}
              <ion-icon :icon="closeCircle" @click="removeFacilityGroups(group.facilityGroupId, 'excluded')" />
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
import { IonBackButton, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonChip, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonPage, IonText, IonTitle, IonToolbar, modalController, onIonViewWillLeave } from '@ionic/vue';
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

const appliedFilters = computed(() => store.getters["util/getAppliedFilters"]);
const rules = computed(() => store.getters["rule/getRules"]);
const total = computed(() => store.getters["rule/getTotalRulesCount"])
const currentEComStore = computed(() => store.getters["user/getCurrentEComStore"])

onMounted(async () => {
  await Promise.allSettled([store.dispatch("util/fetchFacilityGroups")])
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
    if(result.data?.selectedGroups) {
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
      "multiValued": "Y"
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
          "fieldValue": value.length > 1 ? value.join(",") : value[0],
          "multiValued": "Y"
        })
      }
    })
  })

  return conditions;
}

async function createRule() {
  if(!formData.value.ruleName.trim() || !formData.value.safetyStock || !formData.value.selectedFacilityGroups.included.length) {
    showToast(translate("Please fill in all the required fields."))
    return;
  }

  if(formData.value.safety < 0) {
    showToast(translate("Safety stock should be greater than or equal to 0."));
    return;
  }

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
      "ruleConditions": generateRuleConditions(rule.ruleId),
      "ruleActions": generateRuleActions(rule.ruleId)
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

function validateSafetyStock(event: any) {
  if(/[`!@#$%^&*()_+\-=\\|,.<>?~e]/.test(event.key) && event.key !== 'Backspace') event.preventDefault();
}

function removeFacilityGroups(facilityGroupId: any, type: string) {
  formData.value.selectedFacilityGroups[type] = formData.value.selectedFacilityGroups[type].filter((group: any) => group.facilityGroupId !== facilityGroupId)
}
</script>