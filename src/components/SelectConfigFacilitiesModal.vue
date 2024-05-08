<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal"> 
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Select facilities") }}</ion-title>
      <ion-buttons slot="end">
        <!-- Added check to disabled clear all button if not facility is selected. -->
        <ion-button fill="clear" color="danger" :disabled="!selectedFacilityValues.length" @click="selectedFacilityValues = []">{{ translate("Clear All") }}</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-list v-if="configFacilities.length">
      <ion-item v-for="facility in configFacilities" :key="facility.facilityId">
        <ion-checkbox :checked="isSelected(facility.facilityId)" @ionChange="toggleFacilitySelection(facility)">
          <ion-label>
            {{ facility.facilityName }}
            <p>{{ facility.facilityId }}</p>
          </ion-label>
        </ion-checkbox>
      </ion-item>
    </ion-list>

    <div class="empty-state" v-else>
      <p>{{ translate("No record found") }}</p>
    </div>

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
import { computed, defineProps, onMounted, ref } from "vue";
import { closeOutline, saveOutline } from "ionicons/icons";
import { useStore } from "vuex";
import { translate } from "@/i18n";
import { RuleService } from "@/services/RuleService";
import { showToast } from "@/utils";
import logger from "@/logger";
import emitter from "@/event-bus";

const store = useStore();
const props = defineProps(["rule", "selectedFacilities"])

const configFacilities = computed(() => store.getters["util/getConfigFacilities"])
const selectedFacilityValues = ref(JSON.parse(JSON.stringify(props.selectedFacilities)));

onMounted(async () => {
  await store.dispatch("util/fetchConfigFacilities");
})

async function closeModal() {
  modalController.dismiss({ dismissed: true });
}

async function toggleFacilitySelection(updatedFacility: any) {
  const selectedFacility = selectedFacilityValues.value.some((facilityId: any) => facilityId === updatedFacility.facilityId);
  if (selectedFacility) {
    selectedFacilityValues.value = selectedFacilityValues.value.filter((facilityId: any) => facilityId !== updatedFacility.facilityId);
  } else {
    selectedFacilityValues.value.push(updatedFacility.facilityId);
  }
}

function isSelected(currentFacilityId: any) {
  return selectedFacilityValues.value.some((facilityId: any) => facilityId === currentFacilityId);
}

async function saveFacilities() {  
  emitter.emit("presentLoader");
  const rule = JSON.parse(JSON.stringify(props.rule))

  const condition = rule.ruleConditions.find((condition: any) => condition.conditionTypeEnumId === "ENTCT_ATP_FACILITIES")
  if(condition) {
    condition.fieldValue = selectedFacilityValues.value.join(",")
  } else {
    rule.ruleConditions.push({
      "ruleId": rule.ruleId,
      "conditionTypeEnumId": "ENTCT_ATP_FACILITIES",
      "fieldName": "facilities",
      "operator": "in",
      "fieldValue": selectedFacilityValues.value.length > 1 ? selectedFacilityValues.value.join(",") : selectedFacilityValues.value[0],
      "multiValued": selectedFacilityValues.value.length > 1 ? "Y" : "N"
    })
  }

  try {
    await RuleService.updateRule(rule, rule.ruleId)
    await store.dispatch('rule/updateRuleData', { rule })
    showToast(translate("Config facilities updated successfully."))
    modalController.dismiss();
  } catch(err: any) {
    showToast(translate("Failed to update config facilities."))
    logger.error(err)
  }
  emitter.emit("dismissLoader");
}
</script>

<style scoped>
ion-content {
  --padding-bottom: 80px;
}
</style>