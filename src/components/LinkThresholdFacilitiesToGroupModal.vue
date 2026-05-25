<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal">
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Link threshold") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-radio-group v-if="configFacilities.length" v-model="selectedFacilityId">
      <ion-item v-for="facility in configFacilities" :key="facility.facilityId">
        <ion-radio :value="facility.facilityId">
          <ion-label>
            {{ facility.facilityName }}
            <p>{{ facility.facilityId }}</p>
          </ion-label>
        </ion-radio>
      </ion-item>
    </ion-radio-group>

    <div v-else class="empty-state">
      <p>{{ translate("No facility found.") }}</p>
    </div> 

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button :disabled="!isFacilityUpdated()" @click="saveFacility()">
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-content>
</template>

<script setup lang="ts">
import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonRadio, IonRadioGroup, IonTitle, IonToolbar, modalController } from "@ionic/vue";
import { closeOutline, saveOutline } from "ionicons/icons";
import { commonUtil, emitter, logger, translate } from '@common';
import { computed, onMounted, ref } from "vue";
import { useProductStore } from "@/store/productStore";
import { useChannelStore } from "@/store/channel";
import { DateTime } from "luxon";

const productStore = useProductStore();
const channelStore = useChannelStore();
const selectedFacilityId = ref("");
const props = defineProps(["group", "selectedConfigFacilityId"]);

const configFacilities = computed(() => productStore.getConfigFacilities)

onMounted(() => {
  selectedFacilityId.value = props.selectedConfigFacilityId?.facilityId ? JSON.parse(JSON.stringify(props.selectedConfigFacilityId.facilityId)) : '';
})

function closeModal() {
  modalController.dismiss({ dismissed: true });
}

async function saveFacility() {
  if(!selectedFacilityId.value) {
    commonUtil.showToast(translate("Please select a facility to update."))
    return;
  }
  let resp = {} as any;
  
  emitter.emit("presentLoader");

  try {
    if(props.selectedConfigFacilityId?.facilityId) {
      resp = await channelStore.updateFacilityAssociationWithGroup({
        facilityGroupId: props.group.facilityGroupId,
        facilityId: props.selectedConfigFacilityId.facilityId,
        fromDate: props.selectedConfigFacilityId.fromDate,
        thruDate: DateTime.now().toMillis()
      }) as any;
      if(resp && commonUtil.hasError(resp)) {
        throw resp.data;
      }
    }

    resp = await channelStore.updateFacilityAssociationWithGroup({
      facilityGroupId: props.group.facilityGroupId,
      facilityId: selectedFacilityId.value,
      fromDate: DateTime.now().toMillis()
    }) as any;
    if(resp && !commonUtil.hasError(resp)) {
      commonUtil.showToast(translate("Threshold facility updated successfully."))
      modalController.dismiss();
    } else {
      throw resp ? resp.data : "Failed to update threshold facility.";
    }
  } catch(err: any) {
    logger.error(err)
    commonUtil.showToast(translate("Failed to update threshold facility."))
  }
  await channelStore.fetchGroupFacilities(props.group.facilityGroupId);
  emitter.emit("dismissLoader");
}

function isFacilityUpdated() {
  return props.selectedConfigFacilityId?.facilityId !== selectedFacilityId.value
}
</script>

<style scoped>
  ion-content {
    --padding-bottom: 80px;
  }
</style>