<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button>
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Link threshold") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-radio-group v-if="configFacilities.length" v-model="selectedValue">
      <ion-item v-for="facility in configFacilities" :key="facility.facilityId">
        <ion-radio :value="facility.facilityId">
          <ion-label>
            {{ facility.facilityName }}
            <p>{{ facility.facilityId }}</p>
          </ion-label>
        </ion-radio>
      </ion-item>
    </ion-radio-group>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="saveFacility()">
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-content>
</template>

<script setup lang="ts">
import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonRadio, IonRadioGroup, IonSearchbar, IonTitle, IonToolbar } from "@ionic/vue";
import { closeOutline, saveOutline } from "ionicons/icons";
import { translate } from '@/i18n'
import { useStore } from "vuex";
import { computed, defineProps, onMounted, ref } from "vue";
import { hasError, showToast } from "@/utils";
import { ChannelService } from '@/services/ChannelService';
import logger from "@/logger";
import { DateTime } from "luxon";
import { modalController } from "@ionic/core";

const store = useStore();
const configFacilities = computed(() => store.getters["util/getConfigFacilities"])

const props = defineProps(["group", "selectedConfigFacilityId"]);
const selectedValue = ref("");

onMounted(() => {
  selectedValue.value = props.selectedConfigFacilityId?.facilityId ? JSON.parse(JSON.stringify(props.selectedConfigFacilityId.facilityId)) : '';
})

async function saveFacility() {
  if(!selectedValue.value) {
    showToast(translate("Please select a facility to update."))
    return;
  }
  let resp = {} as any;
  
  try {
    if(props.selectedConfigFacilityId?.facilityId) {
      resp = await ChannelService.updateFacilityAssociationWithGroup({
        facilityGroupId: props.group.facilityGroupId,
        facilityId: props.selectedConfigFacilityId.facilityId,
        fromDate: props.selectedConfigFacilityId.fromDate
      });
      if(hasError(resp)) {
        throw resp.data;
      }
    }

    resp = await ChannelService.updateFacilityAssociationWithGroup({
      facilityGroupId: props.group.facilityGroupId,
      facilityId: selectedValue.value,
      fromDate: DateTime.now().toMillis()
    });
    if(!hasError(resp)) {
      showToast(translate("Threshold facility updated successfully."))
      modalController.dismiss();
    } else {
      throw resp.data;
    }
  } catch(err: any) {
    logger.error(err)
    showToast(translate("Failed to update threshold facility."))
  }
  await store.dispatch("channel/fetchInventoryChannels");
}
</script>