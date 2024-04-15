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
      <ion-item v-for="facility in configFacilities" :key="facility.facilityId">
        <ion-checkbox :checked="isSelected(facility.facilityId)" @ionChange="toggleFacilitySelection(facility)">
          <ion-label>
            {{ facility.facilityName }}
            <p>{{ facility.facilityId }}</p>
          </ion-label>
        </ion-checkbox>
      </ion-item>
    </ion-list>

    <ion-fab @click="saveFacilities()" vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button>
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

const store = useStore();
const props = defineProps(["rule", "selectedFacilities"])

const configFacilities = computed(() => store.getters["util/getConfigFacilities"])
let selectedFacilityValues = JSON.parse(JSON.stringify(props.selectedFacilities))

onMounted(async () => {
  await store.dispatch("util/fetchConfigFacilities");
})

async function closeModal() {
  modalController.dismiss({ dismissed: true });
}

async function toggleFacilitySelection(updatedFacility: any) {
  const selectedFacility = selectedFacilityValues.some((facilityId: any) => facilityId === updatedFacility.facilityId);
  if (selectedFacility) {
    selectedFacilityValues = selectedFacilityValues.filter((facilityId: any) => facilityId !== updatedFacility.facilityId);
  } else {
    selectedFacilityValues.push(updatedFacility.facilityId);
  }
}

function isSelected(currentFacilityId: any) {
  return selectedFacilityValues.some((facilityId: any) => facilityId === currentFacilityId);
}

async function saveFacilities() {  
  const rule = JSON.parse(JSON.stringify(props.rule))

  rule.ruleConditions.map((condition: any) => {
    if(condition.conditionTypeEnumId === "ENTCT_ATP_FACILITIES") {
      condition.fieldValue = selectedFacilityValues.join(",")
    }
  })

  await RuleService.updateRule(rule, rule.ruleId)

  showToast(translate("Config facilities updated successfully."))
  await store.dispatch('rule/updateRuleData', { rule })
  modalController.dismiss();
}
</script>

<style scoped>
ion-content {
  --padding-bottom: 80px;
}
</style>