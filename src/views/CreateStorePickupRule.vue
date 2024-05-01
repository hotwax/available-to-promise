<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" :default-href="getDefaultUrl()" />
        <ion-title>{{ translate("New store pickup rule") }}</ion-title>
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
        <ion-segment v-model="selectedSegment">
          <ion-segment-button value="RG_PICKUP_FACILITY">
            <ion-label>{{ translate("Facility") }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="RG_PICKUP_CHANNEL">
            <ion-label>{{ translate("Channel") }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>

      <section v-if="selectedSegment === 'RG_PICKUP_FACILITY'">
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

      <section v-else>
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
      <ion-fab-button @click="createRule()">
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCheckbox, IonChip, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonPage, IonSegment, IonSegmentButton, IonText, IonTitle, IonToggle, IonToolbar, modalController } from '@ionic/vue';
import { addCircleOutline, closeCircle, saveOutline, storefrontOutline } from 'ionicons/icons'
import { translate } from "@/i18n";
import { computed, onMounted, ref } from 'vue';
import ProductFilters from '@/components/ProductFilters.vue';
import { useRouter } from 'vue-router';
import AddProductFacilityGroupModal from '@/components/AddProductFacilityGroupModal.vue';
import { useStore } from 'vuex';
import { RuleService } from '@/services/RuleService';
import { showToast } from '@/utils';
import logger from '@/logger';
import emitter from '@/event-bus';

const store = useStore();
const router = useRouter();
const selectedSegment = ref(router.currentRoute.value.query.groupTypeEnumId)
const configFacilities = computed(() => store.getters["util/getConfigFacilities"])
const appliedFilters = computed(() => store.getters["util/getAppliedFilters"])
const rules = computed(() => store.getters["rule/getRules"]);
const total = computed(() => store.getters["rule/getTotalRulesCount"])
const currentEComStore = computed(() => store.getters["user/getCurrentEComStore"])

const formData = ref({
  ruleName: '',
  isPickupAllowed: false,
  selectedFacilityGroups: {
    included: [],
    excluded: []
  },
  selectedConfigFacilites: []
}) as any;

onMounted(async () => {
  await store.dispatch("util/fetchConfigFacilities");
})

function getDefaultUrl() {
  return `store-pickup?groupTypeEnumId=${selectedSegment.value}`
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
    if(result.data?.selectedGroups?.length) {
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
  if(!formData.value.ruleName) {
    showToast(translate("Please fill in all the required fields."))
    return;
  }

  if(selectedSegment.value === 'RG_PICKUP_FACILITY' && !formData.value.selectedFacilityGroups.included.length) {
    showToast(translate("Please include atleast one facility group."))
    return;
  } else if(selectedSegment.value === 'RG_PICKUP_CHANNEL' && !formData.value.selectedConfigFacilites.length) {
    showToast(translate("Please select atleast one config facility."))
    return;
  }

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
      "ruleConditions": generateRuleConditions(rule.ruleId),
      "ruleActions": generateRuleActions(rule.ruleId)
    }, rule.ruleId);

    showToast(translate("Rule created successfully."))
    store.dispatch("rule/clearRuleState")
    store.dispatch("util/clearAppliedFilters")
    router.push(getDefaultUrl());
  } catch(err: any) {
    logger.error(err);
    showToast(translate("Failed to create rule."))
  }
  emitter.emit("dismissLoader");
}

function generateRuleActions(ruleId: string) {
  return [{
    "ruleId": ruleId,
    "actionTypeEnumId": "ATP_ALLOW_PICKUP",
    "fieldName": "allow-pickup",
    "fieldValue": formData.value.isPickupAllowed ? 'Y' : 'N'
  }]
}

function generateRuleConditions(ruleId: string) {
  const conditions = [];

  if(selectedSegment.value === 'RG_PICKUP_FACILITY') {
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
  } else {
    const selectedFacilites = formData.value.selectedConfigFacilites
    if(selectedFacilites?.length) {
      conditions.push({
        "ruleId": ruleId,
        "conditionTypeEnumId": "ENTCT_ATP_FACILITIES",
        "fieldName": "facilities",
        "operator": "in",
        "fieldValue": selectedFacilites.length > 1 ? selectedFacilites.join(",") : selectedFacilites[0],
        "multiValued": selectedFacilites.length > 1 ? "Y" : "N"
      })
    }
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