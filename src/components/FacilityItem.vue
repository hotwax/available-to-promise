<template>
  <ion-card v-if="selectedPage.path === '/store-pickup'">
    <ion-card-header>
      <ion-card-subtitle class="overline">{{ facility.facilityId }}</ion-card-subtitle>
      <ion-card-title>{{ facility.facilityName }}</ion-card-title>
    </ion-card-header>

    <ion-item lines="none" v-for="group in pickupGroups" :key="group.facilityGroupId">
      <ion-icon :icon="storefrontOutline" slot="start" />
      <ion-toggle :checked="isPickupAllowed(group)" @click.prevent="updatePickupAllowed($event, group)">{{ group.facilityGroupName ? group.facilityGroupName : group.facilityGroupId }}</ion-toggle>
    </ion-item>
  </ion-card>

  <ion-card v-else>
    <ion-card-header>
      <ion-card-subtitle class="overline">{{ facility.facilityId }}</ion-card-subtitle>
      <ion-card-title>{{ facility.facilityName }}</ion-card-title>
    </ion-card-header>

    <ion-item lines="none" v-if="facility.maximumOrderLimit === 0">
      <ion-label>{{ translate("orders in fulfillment queue", {orderCount: facility.orderCount}) }}</ion-label>
      <ion-chip :outline="true" @click="changeOrderLimitPopover" color="danger" fill="outline">{{ facility.maximumOrderLimit }}</ion-chip>
    </ion-item>
    <ion-item lines="none" v-else-if="facility.maximumOrderLimit">
      <ion-text slot="start">{{ facility.orderCount }}</ion-text>
      <ion-progress-bar :value="facility.orderCount / facility.maximumOrderLimit"></ion-progress-bar>
      <ion-chip slot="end" :outline="true" @click="changeOrderLimitPopover">{{facility.maximumOrderLimit}}</ion-chip>
    </ion-item>
    <ion-item lines="none" v-else>
      <ion-label>{{ translate("orders allocated today", {orderCount: facility.orderCount}) }}</ion-label>
      <ion-chip :outline="true" @click="changeOrderLimitPopover">{{ translate("Unlimited") }}</ion-chip>
    </ion-item>      
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonIcon, IonItem, IonLabel, IonProgressBar, IonText, IonToggle, popoverController } from '@ionic/vue';
import { computed, defineProps, onMounted, ref } from 'vue';
import { storefrontOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { translate } from '@/i18n';
import OrderLimitPopover from '@/components/OrderLimitPopover.vue';
import { UtilService } from '@/services/UtilService';
import { hasError, showToast } from '@/utils';
import logger from '@/logger';
import { useStore } from 'vuex';
import emitter from '@/event-bus';
import { DateTime } from 'luxon';

const router = useRouter();
const store = useStore();

const selectedPage = ref({
  path: '',
  name: ''
}) as any

const props = defineProps(["facility"]);
const facilities = computed(() => store.getters["util/getFacilities"]);
const pickupGroups = computed(() => store.getters["util/getPickupGroups"]);
const pickupGroupFacilities = computed(() => store.getters["util/getPickupGroupFacilities"]);

onMounted(() => {
    selectedPage.value.path = router.currentRoute.value.path
    selectedPage.value.name = router.currentRoute.value.name
})

async function changeOrderLimitPopover(ev: Event) {
  const popover = await popoverController.create({
    component: OrderLimitPopover,
    event: ev,
    showBackdrop: false,
    componentProps: {fulfillmentOrderLimit: props.facility.maximumOrderLimit}
  });
  popover.present();

  const result = await popover.onDidDismiss();
  // Note: here result.data returns 0 in some cases that's why it is compared with 'undefined'.
  if(result.data != undefined && result.data !== props.facility.maximumOrderLimit){
    await updateFacility(result.data)
  }
}

async function updateFacility(maximumOrderLimit: number | string) {
  let resp;

  emitter.emit("presentLoader");
  
  try {
    resp = await UtilService.updateFacility({
      ...props.facility,
      maximumOrderLimit
    })

    if(!hasError(resp)) {
      const updatedFacilities = JSON.parse(JSON.stringify(facilities.value))
      const currentFacility = updatedFacilities.find((facility: any) => facility.facilityId === props.facility.facilityId)
      currentFacility.maximumOrderLimit = maximumOrderLimit;

      showToast(translate("Order fulfillment capacity updated successfully"))
      await store.dispatch("util/updateFacilities", { facilities: updatedFacilities })
    } else {
      throw resp.data
    }
  } catch(err) {
    showToast(translate("Failed to update facility"))
    logger.error("Failed to update facility", err)
  }
  emitter.emit("dismissLoader");
}

function isPickupAllowed(group: any) {
  const facilities = pickupGroupFacilities.value[group.facilityGroupId]
  return facilities.find((facility: any) => facility.facilityId === props.facility.facilityId);
}

async function updatePickupAllowed(event: Event, group: any) {
  event.stopImmediatePropagation();

  let payload = {} as any;
  const isPickupActive = isPickupAllowed(group);

  if(isPickupAllowed(group)) {
    const facilities = pickupGroupFacilities.value[group.facilityGroupId]
    payload = facilities.find((facility: any) => facility.facilityId === props.facility.facilityId)
    payload = {
      ...payload,
      thruDate: DateTime.now().toMillis()
    }
  } else {
    payload = {
      facilityId: props.facility.facilityId,
      facilityGroupId: group.facilityGroupId,
      fromDate: DateTime.now().toMillis()
    }
  }

  try {
    const resp = await UtilService.updateFacilityAssociationWithPickupGroup(payload)
    if(!hasError(resp)) {
      const facilitiesByPickupGroup = JSON.parse(JSON.stringify(pickupGroupFacilities.value));
      if(isPickupActive) {
        facilitiesByPickupGroup[group.facilityGroupId] = facilitiesByPickupGroup[group.facilityGroupId].filter((record: any) => record.facilityId !== props.facility.facilityId);
      } else {
        facilitiesByPickupGroup[group.facilityGroupId].push(payload)
      }
      store.dispatch("util/updatePickupGroupFacilities", facilitiesByPickupGroup);
      showToast(translate("Facility association updated successfully with pickup group."))
    } else {
      throw resp.data;
    }
  } catch(error: any) {
    logger.error(error);
    showToast(translate("Failed to update facility association with pickup group."));
  }
  
}
</script>