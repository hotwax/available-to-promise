<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal()">
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Create group") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-list>
      <ion-item>
        <ion-input labelPlacement="floating" v-model="formData.facilityGroupName" @ionBlur="formData.facilityGroupId ? null : setFacilityGroupId($event)">
          <div slot="label">{{ translate("Name") }} <ion-text color="danger">*</ion-text></div>
        </ion-input>
      </ion-item>
      <ion-item lines="none">
        <ion-input :label="translate('ID')" labelPlacement="floating" ref="facilityGroupId" v-model="formData.facilityGroupId" @ionInput="validateFacilityGroupId" @ionBlur="markFacilityGroupIdTouched" :error-text="translate('Internal ID cannot be more than 20 characters.')" />
      </ion-item>
      <ion-item>
        <ion-textarea :label="translate('Description')" v-model="formData.description" labelPlacement="floating" />
      </ion-item>
      <ion-item>
        <ion-label>{{ translate("Product store") }}</ion-label>
        <ion-label slot="end">{{ eComStore.storeName }}</ion-label>
      </ion-item>
      <ion-item>
        <ion-select :label="translate('Group level configurations')" v-model="selectedConfigFacilityId" interface="popover">
          <ion-select-option value="new">{{ translate("Create new") }}</ion-select-option>
          <ion-select-option v-for="facility in configFacilities" :key="facility.facilityId" :value="facility.facilityId" >{{ facility.facilityName }}</ion-select-option>
        </ion-select>
      </ion-item>
    </ion-list>
  </ion-content>

  <ion-fab vertical="bottom" horizontal="end" slot="fixed">
    <ion-fab-button @click="createGroup()">
      <ion-icon :icon="checkmarkDone" />
    </ion-fab-button>
  </ion-fab>
</template>

<script setup lang="ts">
import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonText, IonTextarea, IonTitle, IonToolbar, modalController } from "@ionic/vue";
import { closeOutline, checkmarkDone } from "ionicons/icons";
import { translate } from "@/i18n";
import { useStore } from "vuex";
import { computed, ref } from "vue";
import { generateInternalId, hasError, showToast } from "@/utils";
import logger from "@/logger";
import { ChannelService } from "@/services/ChannelService";
import { DateTime } from "luxon";

const store = useStore();

const formData = ref({
  facilityGroupName: "",
  facilityGroupId: "",
  description: "",
}) as any;
const selectedConfigFacilityId = ref("new");
const facilityGroupId = ref("") as any;

const eComStore = computed(() => store.getters["user/getCurrentEComStore"])
const configFacilities = computed(() => store.getters["util/getConfigFacilities"])

function closeModal() {
  modalController.dismiss();
}

async function createGroup() {
  if (!formData.value.facilityGroupName?.trim()) {
    showToast(translate("Please fill in all the required fields"))
    return;
  }

  if (formData.value.facilityGroupId.length > 20) {
    showToast(translate("Internal ID cannot be more than 20 characters."))
    return
  }

  // In case the user does not lose focus from the facility name input
  // and click on create the button, we need to set the internal id manually
  if (!formData.value.facilityGroupId) {
    formData.value.facilityGroupId = generateInternalId(formData.value.facilityGroupName)
  }

  let resp = {} as any;
  try {
    // Creating a new inventory channel group.
    resp = await ChannelService.createFacilityGroup({ ...formData.value, facilityGroupTypeId : "CHANNEL_FAC_GROUP" });
    if(hasError(resp)) {
      throw resp.data;
    }

    // Creating a new config facility or associating an existing one with the created group.
    let selectedConfigFacility = {} as any;
    if(selectedConfigFacilityId.value === 'new') {
      selectedConfigFacility = {
        facilityName: `${formData.value.facilityGroupName} CONFIG FACILITY`,
        facilityTypeId: "CONFIGURATION",
        parentFacilityTypeId : "VIRTUAL_FACILITY",
      }

      resp = await ChannelService.createFacility(selectedConfigFacility);
      if(!hasError(resp)) {
        selectedConfigFacility = {
          ...selectedConfigFacility,
          facilityId: resp.data.facilityId
        }
      } else {
        throw resp.data;
      }
    } else {
      selectedConfigFacility = configFacilities.value.find((facility: any) => facility.facilityId === selectedConfigFacilityId.value)
    }

    // Associating the config facility with the product store.
    resp = await ChannelService.updateFacilityAssociationWithProductStore({productStoreId: eComStore.value.productStoreId, facilityId: selectedConfigFacility.facilityId})
    if(hasError(resp)) throw resp.data;

    // Associating the facility group with the product store.
    resp = await ChannelService.updateGroupAssociationWithProductStore({productStoreId: eComStore.value.productStoreId, facilityGroupId: formData.value.facilityGroupId})
    if(hasError(resp)) throw resp.data;

    // Associating the config facility with the group.
    resp = await ChannelService.updateFacilityAssociationWithGroup({facilityGroupId: formData.value.facilityGroupId, facilityId: selectedConfigFacility.facilityId})
    if(hasError(resp)) throw resp.data;

    showToast(translate("Group has been created successfully."));
    await store.dispatch("channel/fetchInventoryChannels");
    await store.dispatch("util/fetchConfigFacilities");
    modalController.dismiss();
  } catch (error) {
    logger.error(error)
    showToast(translate("Something went wrong."))
  }
  modalController.dismiss()
}

function setFacilityGroupId(event: any) {
  formData.value.facilityGroupId = generateInternalId(event.target.value)
}

function validateFacilityGroupId(event: any) {
  const value = event.target.value;
  facilityGroupId.value.$el.classList.remove('ion-valid');
  facilityGroupId.value.$el.classList.remove('ion-invalid');

  if (value === '') return;

  formData.value.facilityGroupId.length <= 20
    ? facilityGroupId.value.$el.classList.add('ion-valid')
    : facilityGroupId.value.$el.classList.add('ion-invalid');
}

function markFacilityGroupIdTouched() {
  facilityGroupId.value.$el.classList.add('ion-touched');
}
</script>