<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title slot="start">{{ translate("Inventory channels") }}</ion-title>

        <ion-segment :value="selectedSegment" @ionChange="updateSegment($event)" slot="end">
          <ion-segment-button value="channels">
            <ion-label>{{ translate("Channels") }}</ion-label>
          </ion-segment-button>
          <!-- Todo: add functionality to the Publish segment -->
          <ion-segment-button value="publish" disabled>
            <ion-label>{{ translate("Publish") }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main>
        <section v-if="selectedSegment === 'channels'">
          <template v-if="inventoryChannels.length">
            <ion-card v-for="channel in inventoryChannels" :key="channel.facilityGroupId">
              <ion-card-header>
                <div>
                  <ion-card-subtitle class="overline">{{ channel.facilityGroupId }}</ion-card-subtitle>
                  <ion-card-title>{{ channel.facilityGroupName }}</ion-card-title>
                  <ion-card-subtitle>{{ channel.description }}</ion-card-subtitle>
                </div>
              </ion-card-header>
  
              <ion-item lines="full">
                <ion-icon slot="start" :icon="globeOutline"/>
                <ion-label>
                  {{ channel.selectedConfigFacility?.facilityName }}
                  <p>{{ channel.selectedConfigFacility?.facilityId }}</p>
                </ion-label>
                <ion-button slot="end" fill="clear" color="medium" @click="openLinkThresholdFacilitiesToGroupModal(channel)">
                  <ion-icon :icon="optionsOutline" slot="icon-only" />
                </ion-button>
              </ion-item>
  
              <ion-list>
                <ion-item-divider color="light">
                  <ion-label>{{ translate("Facilities") }}</ion-label>
                  <ion-button slot="end" fill="clear" color="medium" @click="openLinkFacilitiesToGroupModal(channel)">
                    <ion-icon :icon="optionsOutline" slot="icon-only" />
                  </ion-button>
                </ion-item-divider>
  
                <ion-item>
                  <ion-icon slot="start" :icon="storefrontOutline"/>
                  <ion-label>{{ translate("retail facilities", { count: getFacilityCount(channel, "STORE") })}}</ion-label>
                </ion-item>
  
                <ion-item lines="full">
                  <ion-icon slot="start" :icon="businessOutline"/>
                  <ion-label>{{ translate("warehouse", { count: getFacilityCount(channel, "WAREHOUSE") })}}</ion-label>
                </ion-item>
    
                <div class="actions">
                  <ion-button fill="clear" @click="openEditGroupModal(channel)">{{ translate("Edit group") }}</ion-button>
                  <!-- Functionality is not defined for this button hence commented it for now. -->
                  <!-- <ion-button color="medium" fill="clear" slot="end">
                    <ion-icon :icon="ellipsisVerticalOutline" slot="icon-only"/>
                  </ion-button> -->
                </div>
              </ion-list>
            </ion-card>
          </template>

          <div class="empty-state" v-else>
            <p>{{ translate("No inventory channel found.") }}</p>
          </div>
        </section>
 
        <section v-else-if="selectedSegment === 'publish'">
          <ion-card>
            <ion-card-header>
              <div>
                <ion-card-subtitle class="overline">{{ "SHOP CONFIG ID" }}</ion-card-subtitle>
                <ion-card-title>{{ "Shop name" }}</ion-card-title>
              </div>
              <ion-badge color="dark">{{ "in 2 minutes" }}</ion-badge>
            </ion-card-header>

            <ion-list>
              <ion-item lines="full">
                <ion-icon slot="start" :icon="timeOutline"/>
                <ion-select :label="translate('Run time')" :placeholder="translate('Select')" interface="popover">
                  <ion-select-option value="">A</ion-select-option>
                </ion-select>
              </ion-item>

              <ion-item lines="full">
                <ion-icon slot="start" :icon="timerOutline"/>
                <ion-select :label="translate('Frequency')" value="" :placeholder="translate('Select')" interface="popover">
                  <ion-select-option value="">{{ "Every 5 minute" }}</ion-select-option>
                </ion-select>
              </ion-item>

              <ion-item lines="full">
                <ion-icon slot="start" :icon="albumsOutline"/>
                <ion-select :label="translate('Inventory group')" value="" :placeholder="translate('Select')" interface="popover">
                  <ion-select-option value="">{{ "Group name" }}</ion-select-option>
                </ion-select>
              </ion-item>
  
              <ion-item lines="none">
                <ion-button fill="clear">{{ translate("Save changes") }}</ion-button>
                <ion-button color="medium" fill="clear" slot="end" @click="openShopActionsPopover($event)">
                  <ion-icon :icon="ellipsisVerticalOutline" slot="icon-only"/>
                </ion-button>
              </ion-item>
            </ion-list>
          </ion-card>
        </section>
      </main>
    </ion-content>

    <ion-fab v-if="selectedSegment === 'channels'" vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="openCreateGroupModal()">
        <ion-icon :icon="addOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBadge, IonButton, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonItemDivider, IonLabel, IonList, IonMenuButton, IonPage, IonSegment, IonSegmentButton, IonSelect, IonSelectOption, IonTitle, IonToolbar, modalController, onIonViewDidEnter, onIonViewWillLeave, popoverController } from '@ionic/vue';
import { computed } from 'vue';
import { addOutline, albumsOutline, businessOutline, ellipsisVerticalOutline, globeOutline, optionsOutline, storefrontOutline, timeOutline, timerOutline } from 'ionicons/icons';
import { translate } from '@/i18n';
import ShopActionsPopover from '@/components/ShopActionsPopover.vue'
import CreateGroupModal from '@/components/CreateGroupModal.vue'
import LinkFacilitiesToGroupModal from '@/components/LinkFacilitiesToGroupModal.vue'
import LinkThresholdFacilitiesToGroupModal from '@/components/LinkThresholdFacilitiesToGroupModal.vue'
import { useStore } from 'vuex';
import EditGroupModal from '@/components/EditGroupModal.vue';
import emitter from '@/event-bus';

const store = useStore();

const inventoryChannels = computed(() => store.getters["channel/getInventoryChannels"])
const selectedSegment = computed(() => store.getters["util/getSelectedSegment"])

onIonViewDidEnter(async() => {
  fetchInventoryChannels()
  emitter.on("productStoreOrConfigChanged", fetchInventoryChannels);
})

onIonViewWillLeave(() => {
  emitter.off("productStoreOrConfigChanged", fetchInventoryChannels);
})

async function fetchInventoryChannels() {
  emitter.emit("presentLoader");
  if(!selectedSegment.value || (selectedSegment.value !== 'channels' && selectedSegment.value !== 'publish')) store.dispatch("util/updateSelectedSegment", "channels");
  await Promise.allSettled([store.dispatch("channel/fetchInventoryChannels"), store.dispatch("util/fetchConfigFacilities")]);
  emitter.emit("dismissLoader");
}

async function openShopActionsPopover(event: Event) {
  const popover = await popoverController.create({
    component: ShopActionsPopover,
    showBackdrop: false,
    event
  });

  return popover.present();
}

async function openEditGroupModal(group: any) {
  const modal = await modalController.create({
    component: EditGroupModal,
    componentProps: { group }
  })

  modal.present()
}

async function openCreateGroupModal() {
  const popover = await modalController.create({
    component: CreateGroupModal
  });

  return popover.present();
}

async function openLinkFacilitiesToGroupModal(group: any) {
  const popover = await modalController.create({
    component: LinkFacilitiesToGroupModal,
    componentProps: { group, selectedFacilities: group.selectedFacilities }
  });

  return popover.present();
}

async function openLinkThresholdFacilitiesToGroupModal(group: any) {
  const popover = await modalController.create({
    component: LinkThresholdFacilitiesToGroupModal,
    componentProps: { group, selectedConfigFacilityId: group.selectedConfigFacility }
  });

  return popover.present();
}

function getFacilityCount(channel: any, facilityTypeId: string) {
  if(!channel.selectedFacilities?.length) return 0;

  if(facilityTypeId === 'STORE') {
    return channel.selectedFacilities.filter((facility: any) => facility.facilityTypeId === "RETAIL_STORE" || facility.facilityTypeId === "OUTLET_STORE").length;
  } else {
    return channel.selectedFacilities.filter((facility: any) => facility.facilityTypeId === "WAREHOUSE" || facility.facilityTypeId === "OUTLET_WAREHOUSE").length;
  }
}

function updateSegment(event: any) {
  store.dispatch("util/updateSelectedSegment", event.detail.value);
}

</script>

<style scoped>
ion-card-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.actions {
  display: flex;
  justify-content: space-between;
}
</style>