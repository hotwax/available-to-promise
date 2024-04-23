<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal()">
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Edit group") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-list>
      <ion-item>
        <ion-input :label="translate('Name')" labelPlacement="floating" v-model="formData.name"/>
      </ion-item>
      <ion-item>
        <ion-textarea :label="translate('Description')" labelPlacement="floating" v-model="formData.description" />
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
import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonList, IonTextarea, IonTitle, IonToolbar, modalController } from "@ionic/vue";
import { closeOutline, saveOutline } from "ionicons/icons";
import { translate } from "@/i18n";
import { defineProps, onMounted, ref } from "vue";
import logger from "@/logger";
import { hasError, showToast } from "@/utils";
import { ChannelService } from '@/services/ChannelService'
import store from "@/store";

const props = defineProps(["group"])
const formData = ref({
  name: "",
  description: ""
})

onMounted(() => {
  formData.value.name = props.group.facilityGroupName
  formData.value.description = props.group.description
})

function isGroupUpdated() {
  return formData.value.name !== props.group.facilityGroupName || formData.value.description !== props.group.description
}

async function updateGroup() {
  try {
    const resp = await ChannelService.updateGroup({
      facilityGroupId: props.group.facilityGroupId,
      facilityGroupName: formData.value.name,
      description: formData.value.description
    })

    if(!hasError(resp)) {
      store.dispatch("channel/updateGroup", { facilityGroupId: props.group.facilityGroupId, facilityGroupName: formData.value.name, description: formData.value.description })
      showToast(translate("Group updated successfully."))
      modalController.dismiss();
    } else {
      throw resp.data;
    }
  } catch(err) {
    showToast(translate("Failed to edit group."))
    logger.error(err);
  }
}

function closeModal() {
  modalController.dismiss();
}
</script>