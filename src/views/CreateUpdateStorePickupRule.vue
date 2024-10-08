<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/store-pickup" />
        <ion-title>{{ ruleId ? translate("Edit store pickup rule") : translate("New store pickup rule") }}</ion-title>
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
                <ion-icon slot="start" :icon="storefrontOutline"/>
                <ion-toggle v-model="formData.isPickupAllowed">{{ translate("Store pickup") }}</ion-toggle>
              </ion-item>
            </div>
          </ion-card>
        </div>
      </section>

      <div class="section-header">
        <h1 v-if="selectedSegment === 'RG_PICKUP_FACILITY'">{{ translate("Facilities") }} <ion-text color="danger">*</ion-text></h1>
        <h1 v-else-if="selectedSegment === 'RG_PICKUP_CHANNEL'">{{ translate("Channels") }} <ion-text color="danger">*</ion-text></h1>
      </div>

      <section>
        <ion-item lines="none">
          <ion-toggle v-model="formData.areAllSelected">{{ selectedSegment === "RG_PICKUP_FACILITY" ? translate("Select all facilities") : translate("Select all channels") }}</ion-toggle>
        </ion-item>
      </section>

      <template v-if="selectedSegment === 'RG_PICKUP_FACILITY'">
        <section v-if="facilityGroups.length">
          <ion-card :disabled="formData.areAllSelected">
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
  
          <ion-card :disabled="formData.areAllSelected">
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
        <div v-else class="empty-state">
          <ion-note>{{ translate("No facility group found for selected product store. Either change the product store or associate facility groups with the product store.") }}</ion-note>
        </div>
      </template>

      <template v-else>
        <section v-if="configFacilities.length">
          <ion-card v-for="facility in configFacilities" :key="facility.facilityId" @click="toggleFacilitySelection(facility.facilityId)" button :disabled="formData.areAllSelected">
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
      </template>

      <ProductFilters />
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button :disabled="selectedSegment === 'RG_PICKUP_FACILITY' ? !facilityGroups.length : !configFacilities.length" @click="currentRule.ruleId ? updateRule() : createRule()">
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCheckbox, IonChip, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonNote, IonPage, IonText, IonTitle, IonToggle, IonToolbar, modalController, onIonViewDidEnter, onIonViewWillLeave } from '@ionic/vue';
import { addCircleOutline, closeCircle, saveOutline, storefrontOutline } from 'ionicons/icons'
import { translate } from "@hotwax/dxp-components";
import { computed, defineProps, ref } from 'vue';
import ProductFilters from '@/components/ProductFilters.vue';
import { useRouter } from 'vue-router';
import AddProductFacilityGroupModal from '@/components/AddProductFacilityGroupModal.vue';
import { useStore } from 'vuex';
import { RuleService } from '@/services/RuleService';
import { generateRuleActions, generateRuleConditions, hasError, showToast } from '@/utils';
import logger from '@/logger';
import emitter from '@/event-bus';

const store = useStore();
const router = useRouter();

const currentRule = ref({}) as any;
const props = defineProps(["ruleId"]);

const configFacilities = computed(() => store.getters["util/getConfigFacilities"])
const appliedFilters = computed(() => store.getters["util/getAppliedFilters"])
const rules = computed(() => store.getters["rule/getRules"]);
const total = computed(() => store.getters["rule/getTotalRulesCount"])
const currentEComStore = computed(() => store.getters["user/getCurrentEComStore"])
const selectedSegment = computed(() => store.getters["util/getSelectedSegment"]);
const facilityGroups = computed(() => store.getters["util/getFacilityGroups"])

const formData = ref({
  ruleName: '',
  isPickupAllowed: false,
  selectedFacilityGroups: {
    included: [],
    excluded: []
  },
  selectedConfigFacilites: [],
  areAllSelected: false
}) as any;

onIonViewDidEnter(async () => {
  emitter.on("productStoreOrConfigChanged", redirectLink);
  emitter.emit("presentLoader");
  await Promise.allSettled([store.dispatch("util/fetchFacilityGroups"), store.dispatch("util/fetchConfigFacilities")]);
  
  if(props.ruleId) {
    try {
      const resp = await RuleService.fetchRules({ ruleId: props.ruleId })
      
      if(!hasError(resp)) {
        currentRule.value = resp.data[0];

        formData.value.ruleName = currentRule.value.ruleName;
        formData.value.isPickupAllowed = currentRule.value.ruleActions[0]?.fieldValue === "Y" ? true : false;

        if(selectedSegment.value === "RG_PICKUP_FACILITY") {
          const includedGroups = currentRule.value.ruleConditions.find((condition: any) => condition.conditionTypeEnumId === "ENTCT_ATP_FAC_GROUPS" && condition.operator === "in")
          if(includedGroups?.fieldValue === "ALL") formData.value.areAllSelected = true
          else {
            const includedGroupIds = includedGroups?.fieldValue ? includedGroups.fieldValue.split(",") : []
            formData.value.selectedFacilityGroups.included = facilityGroups.value.filter((group: any) => includedGroupIds.includes(group.facilityGroupId));

            const excludedGroups = currentRule.value.ruleConditions.find((condition: any) => condition.conditionTypeEnumId === "ENTCT_ATP_FAC_GROUPS" && condition.operator === "not-in")
            const excludedGroupIds = excludedGroups?.fieldValue ? excludedGroups.fieldValue.split(",") : []
            formData.value.selectedFacilityGroups.excluded = facilityGroups.value.filter((group: any) => excludedGroupIds.includes(group.facilityGroupId));
          }
        } else if(selectedSegment.value === "RG_PICKUP_CHANNEL") {
          const facilityCondition = currentRule.value.ruleConditions.find((condition: any) => condition.conditionTypeEnumId === "ENTCT_ATP_FACILITIES")
          if(facilityCondition?.fieldValue === "ALL") formData.value.areAllSelected = true
          else formData.value.selectedConfigFacilites = facilityCondition?.fieldValue ? facilityCondition.fieldValue.split(",") : [];
        }
        
        const currentAppliedFilters = JSON.parse(JSON.stringify(appliedFilters.value))
        currentRule.value.ruleConditions.map((condition: any) => {
          if(condition.conditionTypeEnumId === "ENTCT_ATP_FILTER") {
            if(condition.operator === "contains") {
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
    isPickupAllowed: false,
    selectedFacilityGroups: {
      included: [],
      excluded: []
    },
    selectedConfigFacilites: []
  }
  store.dispatch("util/clearAppliedFilters")
  emitter.off("productStoreOrConfigChanged", redirectLink);
})

async function redirectLink() {
  router.push("/store-pickup");
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

async function createRule() {
  if(!isRuleValid()) return;

  emitter.emit("presentLoader");

  let ruleGroup = await store.dispatch("rule/fetchRuleGroup", { groupTypeEnumId: selectedSegment.value });

  try {
    if(!ruleGroup.ruleGroupId) {
      ruleGroup = await RuleService.createRuleGroup({
        "groupTypeEnumId": selectedSegment.value,
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
      "ruleConditions": generateRuleConditions(rule.ruleId, selectedSegment.value === 'RG_PICKUP_FACILITY' ? "ENTCT_ATP_FAC_GROUPS" : "ENTCT_ATP_FACILITIES", appliedFilters.value, selectedSegment.value === 'RG_PICKUP_FACILITY' ? formData.value.selectedFacilityGroups : formData.value.selectedConfigFacilites, formData.value.areAllSelected),
      "ruleActions": generateRuleActions(rule.ruleId, "ATP_ALLOW_PICKUP", formData.value.isPickupAllowed, false, [])
    }, rule.ruleId);

    showToast(translate("Rule created successfully."))
    store.dispatch("rule/clearRuleState")
    store.dispatch("util/clearAppliedFilters")
    router.push("/store-pickup");
  } catch(err: any) {
    logger.error(err);
    showToast(translate("Failed to create rule."))
  }
  emitter.emit("dismissLoader");
}

async function updateRule() {
  if(!isRuleValid()) return;

  const currentRuleConditions = JSON.parse(JSON.stringify(currentRule.value.ruleConditions));
  const updatedRuleConditions = generateRuleConditions(props.ruleId, selectedSegment.value === 'RG_PICKUP_FACILITY' ? "ENTCT_ATP_FAC_GROUPS" : "ENTCT_ATP_FACILITIES", appliedFilters.value, selectedSegment.value === 'RG_PICKUP_FACILITY' ? formData.value.selectedFacilityGroups : formData.value.selectedConfigFacilites, formData.value.areAllSelected);

  updatedRuleConditions.map((updatedCondition: any) => {
    const current = currentRuleConditions.find((condition: any) => condition.conditionTypeEnumId === updatedCondition.conditionTypeEnumId && condition.fieldName === updatedCondition.fieldName && condition.operator === updatedCondition.operator);
    if(current) updatedCondition["conditionSeqId"] = current.conditionSeqId;
  })

  const conditionsToRemove = currentRuleConditions.filter((condition: any) => !updatedRuleConditions.some((updatedCondition: any) => condition.conditionTypeEnumId === updatedCondition.conditionTypeEnumId && condition.fieldName === updatedCondition.fieldName && condition.operator === updatedCondition.operator && condition.conditionSeqId === updatedCondition.conditionSeqId))

  try {
    await RuleService.updateRule({
      ...currentRule.value,
      "ruleName": formData.value.ruleName,
      "ruleConditions": updatedRuleConditions,
      "ruleActions": generateRuleActions(props.ruleId, "ATP_ALLOW_PICKUP", formData.value.isPickupAllowed, true, currentRule.value.ruleActions)
    }, props.ruleId);
    showToast(translate("Rule updated successfully."))

    const removeResponses = await Promise.allSettled(conditionsToRemove.map(async (condition: any) => await RuleService.deleteCondition({ ...condition, ruleId: props.ruleId})));
    const hasFailedResponse = removeResponses.some((response: any) => response.status === 'rejected');
    if(hasFailedResponse) logger.error("Failed to delete some rule conditions.")

    store.dispatch("rule/clearRuleState")
    store.dispatch("util/clearAppliedFilters")
    router.push('/store-pickup');
  } catch(err: any) {
    logger.error(err);
  }
}

function isRuleValid() {
  if(!formData.value.ruleName.trim()) {
    showToast(translate("Please fill in all the required fields."))
    return false;
  }

  if(selectedSegment.value === 'RG_PICKUP_FACILITY' && !formData.value.areAllSelected && !formData.value.selectedFacilityGroups.included.length) {
    showToast(translate("Please include atleast one facility."))
    return false;
  } else if(selectedSegment.value === 'RG_PICKUP_CHANNEL' && !formData.value.areAllSelected && !formData.value.selectedConfigFacilites.length) {
    showToast(translate("Please select atleast one channel."))
    return false;
  }

  return true;
}

function removeFacilityGroups(facilityGroupId: any, type: string) {
  formData.value.selectedFacilityGroups[type] = formData.value.selectedFacilityGroups[type].filter((group: any) => group.facilityGroupId !== facilityGroupId)
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