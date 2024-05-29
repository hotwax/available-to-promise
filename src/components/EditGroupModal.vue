<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal()">
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Edit channel group") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-list>
      <ion-item>
        <ion-input labelPlacement="floating" v-model="formData.facilityGroupName">
          <div slot="label">{{ translate("Name") }} <ion-text color="danger">*</ion-text></div>
        </ion-input>
      </ion-item>
      <ion-item>
        <ion-textarea :label="translate('Description')" labelPlacement="floating" v-model="formData.description" :maxlength="255" />
      </ion-item>
    </ion-list>
  </ion-content>

  <ion-fab vertical="bottom" horizontal="end" slot="fixed">
    <ion-fab-button :disabled="!isGroupUpdated()" @click="updateGroup()">
      <ion-icon :icon="saveOutline" />
    </ion-fab-button>
  </ion-fab>
</template>

<script setup lang="ts">
import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonList, IonText, IonTextarea, IonTitle, IonToolbar, modalController } from "@ionic/vue";
import { closeOutline, saveOutline } from "ionicons/icons";
import { translate } from "@/i18n";
import { defineProps, onMounted, ref } from "vue";
import logger from "@/logger";
import { hasError, showToast } from "@/utils";
import { ChannelService } from '@/services/ChannelService'
import store from "@/store";
import emitter from "@/event-bus";

const props = defineProps(["group"]);
const formData = ref({
  facilityGroupName: "",
  description: ""
})

onMounted(() => {
  formData.value.facilityGroupName = props.group.facilityGroupName
  formData.value.description = props.group.description
})

function isGroupUpdated() {
  return formData.value.facilityGroupName !== props.group.facilityGroupName || formData.value.description !== props.group.description
}

async function updateGroup() {
  if (!formData.value.facilityGroupName?.trim()) {
    showToast(translate("Please fill in all the required fields."))
    return;
  }

  emitter.emit("presentLoader");
  try {
    const resp = await ChannelService.updateGroup({...formData.value, facilityGroupId: props.group.facilityGroupId})

    if(!hasError(resp)) {
      store.dispatch("channel/updateGroup", { facilityGroupId: props.group.facilityGroupId, ...formData.value })
      showToast(translate("Group updated successfully."))
      modalController.dismiss();
    } else {
      throw resp.data;
    }
  } catch(err) {
    showToast(translate("Failed to update group."))
    logger.error(err);
  }
  emitter.emit("dismissLoader");
}

function closeModal() {
  modalController.dismiss();
}
</script>