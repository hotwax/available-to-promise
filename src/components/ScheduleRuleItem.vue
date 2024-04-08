<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>{{ translate("Schedule") }}</ion-card-title>
      <ion-badge color="warning">{{ translate("Paused") }}</ion-badge>
    </ion-card-header>
  
    <ion-item>
      <ion-icon slot="start" :icon="timeOutline" />
      <ion-select :label="translate('Run time')" value="" interface="popover">
        <ion-select-option value="">{{ "Select" }}</ion-select-option>
      </ion-select>
    </ion-item>
  
    <ion-item lines="none">
      <ion-button fill="clear">{{ translate("Save changes") }}</ion-button>
      <ion-button color="medium" fill="clear" slot="end" @click="OpenScheduleActionsPopover($event)">
        <ion-icon :icon="ellipsisVerticalOutline" slot="icon-only"/>
      </ion-button>
    </ion-item>
  </ion-card>
</template>

<script setup lang="ts">
import { IonBadge, IonButton, IonCard, IonCardHeader, IonCardTitle, IonIcon, IonItem, IonSelect, IonSelectOption, popoverController } from '@ionic/vue';
import { translate } from '@hotwax/dxp-components';
import { ellipsisVerticalOutline, timeOutline } from 'ionicons/icons';
import ScheduleActionsPopover from "@/components/ScheduleActionsPopover.vue";

async function OpenScheduleActionsPopover(event: Event) {
  const popover = await popoverController.create({
    component: ScheduleActionsPopover,
    showBackdrop: false,
    event
  });

  return popover.present();
}
</script>

<style scoped>
ion-card-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>