<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button>
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Link facilities") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-searchbar v-model="queryString" @keyup.enter="fetchFacilities()" />

    <ion-list v-if="facilities?.length">
      <ion-item lines="none" v-for="facility in facilities" :key="facility.facilityId" @click="updateSelectedFacilities(facility.facilityId)">
        <ion-checkbox :checked="isFacilitySelected(facility.facilityId)">
          <ion-label>
            {{ facility.facilityName }}
            <p>{{ facility.facilityId }}</p>
          </ion-label>
        </ion-checkbox>
      </ion-item> 
    </ion-list>
    <div v-else class="empty-state">
      <p>{{ translate("No facility found.") }}</p>
    </div> 

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button :disabled="!areFacilitiesUpdated()" @click="saveFacilities()">
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-content>
</template>

<script setup lang="ts">
import { IonButton, IonButtons, IonCheckbox, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonSearchbar, IonTitle, IonToolbar, modalController } from "@ionic/vue";
import { closeOutline, saveOutline } from "ionicons/icons";
import { translate } from '@/i18n'
import { defineProps, onMounted, ref } from "vue";
import { useStore } from "vuex";
import { DateTime } from "luxon";
import { ChannelService } from "@/services/ChannelService";
import { UtilService } from "@/services/UtilService";
import { showToast } from "@/utils";
import { hasError } from "@/utils";
import logger from "@/logger";

const store = useStore();
const queryString = ref('');
const selectedFacilityValues = ref([]) as any;

const props = defineProps(["group", "selectedFacilities"]);
const facilities = ref([]) as any;

onMounted(() => {
  fetchFacilities()
  selectedFacilityValues.value = JSON.parse(JSON.stringify(props.selectedFacilities));
})

async function fetchFacilities () {
  facilities.value = []

  try {
    const params = {
      productStoreId: store.state.user.currentEComStore.productStoreId,
      facilityName: queryString.value,
      facilityName_op: "contains",
      pageSize: 20
    }

    const resp = await UtilService.fetchFacilities(params);

    if(!hasError(resp)) {
      facilities.value = resp.data;
    } else {
      throw resp.data
    }
  } catch (err: any) {
    logger.error(err)
  }
}

function isFacilitySelected(facilityId: any) {
  return selectedFacilityValues.value.some((facility: any) => facility.facilityId === facilityId)
}

function updateSelectedFacilities(id: string) {
  const facility = isFacilitySelected(id)

  if(facility) {
    selectedFacilityValues.value = selectedFacilityValues.value.filter((facility: any) => facility.facilityId !== id)
  } else {
    selectedFacilityValues.value.push(facilities.value.find((facility: any) => facility.facilityId == id))
  }
}

function areFacilitiesUpdated() {
  if(props.selectedFacilities.length !== selectedFacilityValues.value.length) return true;

  return selectedFacilityValues.value.some((selectedFacility: any) => !props.selectedFacilities.find((facility: any) => facility.facilityId === selectedFacility.facilityId))
}

async function saveFacilities() {
  const facilitiesToAdd = selectedFacilityValues.value.filter((selectedFacility: any) => !props.selectedFacilities.some((facility: any) => facility.facilityId === selectedFacility.facilityId))
  const facilitiesToRemove = props.selectedFacilities.filter((facility: any) => !selectedFacilityValues.value.some((selectedFacility: any) => facility.facilityId === selectedFacility.facilityId))

  const removeResponses = await Promise.allSettled(facilitiesToRemove
    .map(async (facility: any) => await ChannelService.updateFacilityAssociationWithGroup({
      facilityId: facility.facilityId,
      facilityGroupId: props.group.facilityGroupId,
      fromDate: facility.fromDate,
      thruDate: DateTime.now().toMillis()
    }))
  )

  const addResponses = await Promise.allSettled(facilitiesToAdd
    .map(async (facility: any) => await ChannelService.updateFacilityAssociationWithGroup({
      facilityId: facility.facilityId,
      facilityGroupId: props.group.facilityGroupId,
      fromDate: DateTime.now().toMillis()
    }))
  )

  const hasFailedResponse = [...removeResponses, ...addResponses].some((response: any) => response.status === 'rejected')
  if(hasFailedResponse) {
    showToast(translate("Failed to associate some facilites to group."))
  } else {
    showToast(translate("Facilities associated to group successfully."))
  }
  await store.dispatch("channel/fetchGroupFacilities", props.group.facilityGroupId);
  modalController.dismiss()  
}
</script>