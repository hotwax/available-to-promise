<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal"> 
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Select facilities") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-list>
      <ion-item v-for="group in facilityGroups" :key="group.facilityGroupId">
        <ion-checkbox :checked="isSelected(group.facilityGroupId)" @ionChange="toggleFacilityGroupSelection(group)">
          <ion-label>
            {{ group.facilityGroupName }}
            <p>{{ group.facilityGroupId }}</p>
          </ion-label>
        </ion-checkbox>
      </ion-item>
    </ion-list>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="saveFacilities()">
        <ion-icon :icon="saveOutline" />  
      </ion-fab-button>
    </ion-fab>
  </ion-content>
</template>
  
<script setup lang="ts">
import {
  IonButtons,
  IonButton,
  IonCheckbox,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { computed, defineProps, onMounted } from "vue";
import { closeOutline, saveOutline } from "ionicons/icons";
import { useStore } from "vuex";
import { translate } from "@/i18n";
import { RuleService } from "@/services/RuleService";
import { showToast } from "@/utils";
import logger from "@/logger";

const store = useStore();
const props = defineProps(["rule", "selectedFacilityGroupIds"])

const facilityGroups = computed(() => store.getters["util/getFacilityGroups"])
let selectedFacilityGroupIds = JSON.parse(JSON.stringify(props.selectedFacilityGroupIds))

onMounted(async () => {
  await store.dispatch("util/fetchConfigFacilities");
})

async function closeModal() {
  modalController.dismiss({ dismissed: true });
}

async function toggleFacilityGroupSelection(updatedGroup: any) {
  const selectedGroup = selectedFacilityGroupIds.some((groupId: any) => groupId === updatedGroup.facilityGroupId);
  if(selectedGroup) {
    selectedFacilityGroupIds = selectedFacilityGroupIds.filter((groupId: any) => groupId !== updatedGroup.facilityGroupId);
  } else {
    selectedFacilityGroupIds.push(updatedGroup.facilityGroupId);
  }
}

function isSelected(currentGroupId: any) {
  return selectedFacilityGroupIds.some((groupId: any) => groupId === currentGroupId);
}

async function saveFacilities() {  
  const rule = JSON.parse(JSON.stringify(props.rule))

  if(!rule.ruleConditions) rule.ruleConditions = []

  const condition = rule.ruleConditions.find((condition: any) => condition.conditionTypeEnumId === "ENTCT_ATP_FAC_GROUPS")
  if(condition) {
    condition.fieldValue = selectedFacilityGroupIds.join(",")
  } else {
    rule.ruleConditions.push({
      "ruleId": rule.ruleId,
      "conditionTypeEnumId": "ENTCT_ATP_FAC_GROUPS",
      "fieldName": "facilityGroupId",
      "operator": "in",
      "fieldValue": selectedFacilityGroupIds.length > 1 ? selectedFacilityGroupIds.join(",") : selectedFacilityGroupIds[0],
      "multiValued": selectedFacilityGroupIds.length > 1 ? "Y" : "N"
    })
  }

  try {
    await RuleService.updateRule(rule, rule.ruleId)
    await store.dispatch('rule/updateRuleData', { rule })
    showToast(translate("Facility groups updated successfully."))
    modalController.dismiss();
  } catch(err: any) {
    showToast(translate("Failed to update facility groups."))
    logger.error(err)
  }
}
</script>

<style scoped>
ion-content {
  --padding-bottom: 80px;
}
</style>