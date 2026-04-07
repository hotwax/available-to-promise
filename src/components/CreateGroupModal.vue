<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal()">
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Create channel group") }}</ion-title>
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
        <ion-textarea :label="translate('Description')" v-model="formData.description" labelPlacement="floating" :maxlength="255" />
      </ion-item>
      <ion-item>
        <ion-label>{{ translate("Product store") }}</ion-label>
        <ion-label slot="end">{{ eComStore.storeName ? eComStore.storeName : eComStore.productStoreId }}</ion-label>
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
import { emitter, logger, translate } from '@common';
import { useChannelStore } from "@/store/channel";
import { useProductStore } from "@/store/productStore";
import { computed, ref } from "vue";
import { commonUtil } from "@common";

const channelStore = useChannelStore();
const productStore = useProductStore();

const formData = ref({
  facilityGroupName: "",
  facilityGroupId: "",
  description: "",
}) as any;
const selectedConfigFacilityId = ref("new");
const facilityGroupId = ref("") as any;

const eComStore = computed(() => productStore.getCurrentEComStore)
const configFacilities = computed(() => productStore.getConfigFacilities)

function closeModal() {
  modalController.dismiss();
}

async function createGroup() {
  if (!formData.value.facilityGroupName?.trim()) {
    commonUtil.showToast(translate("Please fill in all the required fields."))
    return;
  }

  // In case the user does not lose focus from the facility name input
  // and click on create the button, we need to set the internal id manually
  if (!formData.value.facilityGroupId) {
    formData.value.facilityGroupId = commonUtil.generateInternalId(formData.value.facilityGroupName)
  }

  if (formData.value.facilityGroupId.length > 20) {
    commonUtil.showToast(translate("Internal ID cannot be more than 20 characters."))
    return
  }

  emitter.emit("presentLoader");

  let resp = {} as any;
  try {
    // Creating a new inventory channel group.
    resp = await channelStore.createFacilityGroup({ ...formData.value, facilityGroupTypeId : "CHANNEL_FAC_GROUP" });
    if(resp && commonUtil.hasError(resp)) {
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

      resp = await channelStore.createFacility(selectedConfigFacility) as any;
      if(resp && !commonUtil.hasError(resp)) {
        selectedConfigFacility = {
          ...selectedConfigFacility,
          facilityId: resp.data.facilityId
        }

        // Associating the config facility with the product store.
        resp = await channelStore.updateFacilityAssociationWithProductStore({productStoreId: eComStore.value.productStoreId, facilityId: selectedConfigFacility.facilityId})
        if(resp && commonUtil.hasError(resp)) throw resp.data;
      } else {
        throw resp ? resp.data : "Failed to create facility";
      }
    } else {
      selectedConfigFacility = configFacilities.value.find((facility: any) => facility.facilityId === selectedConfigFacilityId.value)
    }

    // Associating the facility group with the product store.
    resp = await channelStore.updateGroupAssociationWithProductStore({productStoreId: eComStore.value.productStoreId, facilityGroupId: formData.value.facilityGroupId})
    if(resp && commonUtil.hasError(resp)) throw resp.data;

    // Associating the config facility with the group.
    resp = await channelStore.updateFacilityAssociationWithGroup({facilityGroupId: formData.value.facilityGroupId, facilityId: selectedConfigFacility.facilityId})
    if(resp && commonUtil.hasError(resp)) throw resp.data;

    commonUtil.showToast(translate("Group has been created successfully."));
    await channelStore.fetchInventoryChannels();
    await productStore.fetchConfigFacilities();
    modalController.dismiss();
  } catch (error: any) {
    logger.error(error)
    commonUtil.showToast(error.response?.data?.errors ? error.response.data.errors : translate("Failed to create channel group."))
  }
  modalController.dismiss()
  emitter.emit("dismissLoader");
}

function setFacilityGroupId(event: any) {
  formData.value.facilityGroupId = commonUtil.generateInternalId(event.target.value)
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