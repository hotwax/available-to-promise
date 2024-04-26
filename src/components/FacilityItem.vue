<template>
  <ion-card v-if="selectedPage.path === '/store-pickup'">
    <ion-card-header>
      <ion-card-subtitle class="overline">{{ facility.facilityId }}</ion-card-subtitle>
      <ion-card-title>{{ facility.facilityName }}</ion-card-title>
    </ion-card-header>

    <ion-item lines="none">
      <ion-icon :icon="storefrontOutline" slot="start" />
      <ion-toggle>{{ translate("Store pickup") }}</ion-toggle>
    </ion-item>
  </ion-card>

  <ion-card v-else>
    <ion-card-header>
      <ion-card-subtitle class="overline">{{ facility.facilityId }}</ion-card-subtitle>
      <ion-card-title>{{ facility.facilityName }}</ion-card-title>
    </ion-card-header>

    <ion-item lines="none" v-if="facility.maximumOrderLimit === 0">
      <ion-label>{{ translate("orders in fulfillment queue", {orderCount: 0}) }}</ion-label>
      <ion-chip :outline="true" @click="changeOrderLimitPopover" color="danger" fill="outline">{{ facility.maximumOrderLimit }}</ion-chip>
    </ion-item>
    <ion-item lines="none" v-else-if="facility.maximumOrderLimit">
      <ion-text slot="start">{{ 0 }}</ion-text>
      <ion-progress-bar :value="0 / facility.maximumOrderLimit"></ion-progress-bar>
      <ion-chip slot="end" :outline="true" @click="changeOrderLimitPopover">{{facility.maximumOrderLimit}}</ion-chip>
    </ion-item>
    <ion-item lines="none" v-else>
      <ion-label>{{ translate("orders allocated today", {orderCount: 0}) }}</ion-label>
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

const router = useRouter();
const store = useStore();

const selectedPage = ref({
  path: '',
  name: ''
}) as any

const props = defineProps(["facility"]);
const facilities = computed(() => store.getters["util/getFacilities"]);

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
  console.log(result);
  
  if(result.data != undefined && result.data !== props.facility.maximumOrderLimit){
    await updateFacility(result.data)
  }
}

async function updateFacility(maximumOrderLimit: number | string) {
  let resp;

  try {
    resp = await UtilService.updateFacility({
      ...props.facility,
      maximumOrderLimit
    })

    if(!hasError(resp)) {
      const updatedFacilities = JSON.parse(JSON.stringify(facilities.value))
      const currentFacility = updatedFacilities.find((facility: any) => facility.facilityId === props.facility.facilityId)
      currentFacility.maximumOrderLimit = maximumOrderLimit;

      showToast(translate('Order fulfillment capacity updated successfully'))
      await store.dispatch('util/updateFacilities', { facilities: updatedFacilities })
    } else {
      throw resp.data
    }
  } catch(err) {
    showToast(translate('Failed to update facility'))
    logger.error('Failed to update facility', err)
  }
}
</script>