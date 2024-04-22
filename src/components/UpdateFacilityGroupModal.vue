<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal">
          <ion-icon slot="icon-only" :icon="arrowBackOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Select facility groups") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-segment v-model="selectedSegment">
      <ion-segment-button value="included">
        <ion-label>{{ translate("Included") }}</ion-label>
      </ion-segment-button>
      <ion-segment-button value="excluded">
        <ion-label>{{ translate("Excluded") }}</ion-label>
      </ion-segment-button>
    </ion-segment>

    <ion-list>
      <ion-item v-for="group in facilityGroups" :key="group.facilityGroupId" @click="!isAlreadyApplied(group.facilityGroupId) ? updateSelectedValues(group.facilityGroupId): ''">
        <ion-label v-if="isAlreadyApplied(group.facilityGroupId)">{{ group.facilityGroupName }}</ion-label>
        <ion-checkbox v-if="!isAlreadyApplied(group.facilityGroupId)" :checked="isSelected(group.facilityGroupId)">
          {{ group.facilityGroupName }}
        </ion-checkbox>
        <ion-note v-else slot="end" color="danger">{{ selectedSegment === 'included' ? translate("excluded") : translate("included") }}</ion-note>
      </ion-item>
    </ion-list>

    <!-- Added padding for better visiblity of the checkboxes beside the FAB -->
    <ion-fab class="ion-padding" vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="saveFacilityGroups()">
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-content>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { arrowBackOutline, saveOutline } from 'ionicons/icons';
import { useStore } from "vuex";
import { RuleService } from "@/services/RuleService";
import { defineProps, ref } from "vue";
import { translate } from "@/i18n";
import { showToast } from "@/utils";
import logger from "@/logger";

const selectedSegment = ref("included")
const includedGroups = ref([]) as any;
const excludedGroups = ref([]) as any;

const props = defineProps(["rule"]);
const store = useStore();

const facilityGroups = computed(() => store.getters["util/getFacilityGroups"])

onMounted(async () => {
  await store.dispatch("util/fetchFacilityGroups");
  const includedCondition = props.rule.ruleConditions?.find((condition: any) => condition.conditionTypeEnumId === 'ENTCT_ATP_FAC_GROUPS' && condition.fieldName === 'facilityGroups' && condition.operator === 'in')
  if(includedCondition && includedCondition.fieldValue) includedGroups.value = includedCondition.fieldValue.split(",");

  const excludedCondition = props.rule.ruleConditions?.find((condition: any) => condition.conditionTypeEnumId === 'ENTCT_ATP_FAC_GROUPS' && condition.fieldName === 'facilityGroups' && condition.operator === 'not-in')
  if(excludedCondition && excludedCondition.fieldValue) excludedGroups.value = excludedCondition.fieldValue.split(",");
})

function closeModal() {
  modalController.dismiss({ dismissed: true });
}

function updateSelectedValues(value: string) {
  if(selectedSegment.value === 'included') {
    if(includedGroups.value.includes(value)) includedGroups.value.splice(includedGroups.value.indexOf(value), 1)
    else includedGroups.value.push(value)
  } 
  else {
    if(excludedGroups.value.includes(value)) excludedGroups.value.splice(excludedGroups.value.indexOf(value), 1)
    else excludedGroups.value.push(value) 
  }
}

function isAlreadyApplied(value: string) {
  if(selectedSegment.value === 'included') return excludedGroups.value.includes(value);
  else return includedGroups.value.includes(value);
}

function isSelected(value: string) {
  if(selectedSegment.value === 'included') return includedGroups.value.includes(value);
  else return excludedGroups.value.includes(value);
}

async function saveFacilityGroups() {
  const rule = JSON.parse(JSON.stringify(props.rule))

  if(!rule.ruleConditions) rule.ruleConditions = []

  const includeCondition = rule.ruleConditions.find((condition: any) => condition.conditionTypeEnumId === 'ENTCT_ATP_FAC_GROUPS' && condition.fieldName === 'facilityGroups' && condition.operator === 'in')
  if(includeCondition) {
    includeCondition.fieldValue = includedGroups.value.join(",")
  } else {
    rule.ruleConditions.push({
      "ruleId": rule.ruleId,
      "conditionTypeEnumId": "ENTCT_ATP_FAC_GROUPS",
      "fieldName": "facilityGroups",
      "operator": selectedSegment.value === "included" ? "in" : "not-in",
      "fieldValue": includedGroups.value?.length > 1 ? includedGroups.value.join(",") : includedGroups.value[0],
      "multiValued": includedGroups.value?.length > 1 ? "Y" : "N"
    })
  }

  const excludeCondition = rule.ruleConditions.find((condition: any) => condition.conditionTypeEnumId === 'ENTCT_ATP_FAC_GROUPS' && condition.fieldName === 'facilityGroups' && condition.operator === 'not-in')
  if(excludeCondition) {
    excludeCondition.fieldValue = excludedGroups.value.join(",")
  } else {
    rule.ruleConditions.push({
      "ruleId": rule.ruleId,
      "conditionTypeEnumId": "ENTCT_ATP_FAC_GROUPS",
      "fieldName": "facilityGroups",
      "operator": selectedSegment.value === "included" ? "in" : "not-in",
      "fieldValue": excludedGroups.value?.length > 1 ? excludedGroups.value.join(",") : excludedGroups.value[0],
      "multiValued": excludedGroups.value?.length > 1 ? "Y" : "N"
    })
  }

  try {
    await RuleService.updateRule(rule, rule.ruleId)
    await store.dispatch('rule/updateRuleData', { rule })
    showToast(translate("Facility groups updated succesfully."))
    modalController.dismiss()
  } catch(err: any) {
    showToast(translate("Failed to update facility groups."))
    logger.error(err);
  }
}
</script>