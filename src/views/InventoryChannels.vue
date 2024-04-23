<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ translate("Inventory channels") }}</ion-title>
      </ion-toolbar>

      <ion-toolbar>
        <ion-segment v-model="selectedSegment">
          <ion-segment-button value="channels">
            <ion-label>{{ translate("Channels") }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="publish">
            <ion-label>{{ translate("Publish") }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main>
        <section v-if="selectedSegment === 'channels'">
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
                {{ "<threshold facility name>" }}
                <p>{{ "<facilityId>" }}</p>
              </ion-label>
              <ion-button slot="end" fill="clear" color="medium" @click="openLinkThresholdFacilitiesToGroupModal()">
                <ion-icon :icon="optionsOutline" slot="icon-only" />
              </ion-button>
            </ion-item>

            <ion-list>
              <ion-item-divider color="light">
                <ion-label>{{ translate("Facilities") }}</ion-label>
                <ion-button slot="end" fill="clear" color="medium" @click="openLinkFacilitiesToGroupModal()">
                  <ion-icon :icon="optionsOutline" slot="icon-only" />
                </ion-button>
              </ion-item-divider>

              <ion-item>
                <ion-icon slot="start" :icon="storefrontOutline"/>
                <ion-label>{{ "15 retail facilities" }}</ion-label>
              </ion-item>

              <ion-item lines="full">
                <ion-icon slot="start" :icon="businessOutline"/>
                <ion-label>{{ "1 warehouse" }}</ion-label>
              </ion-item>
  
              <ion-item lines="none">
                <ion-button fill="clear">{{ translate("View details") }}</ion-button>
                <ion-button color="medium" fill="clear" slot="end">
                  <ion-icon :icon="ellipsisVerticalOutline" slot="icon-only"/>
                </ion-button>
              </ion-item>
            </ion-list>
          </ion-card>
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

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="openCreateGroupModal()">
        <ion-icon :icon="addOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBadge, IonButton, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonItemDivider, IonLabel, IonList, IonMenuButton, IonPage, IonSegment, IonSegmentButton, IonSelect, IonSelectOption, IonTitle, IonToolbar, modalController, popoverController } from '@ionic/vue';
import { computed, onMounted, ref } from 'vue';
import { addOutline, albumsOutline, businessOutline, ellipsisVerticalOutline, globeOutline, optionsOutline, storefrontOutline, timeOutline, timerOutline } from 'ionicons/icons';
import { translate } from '@/i18n';
import ShopActionsPopover from '@/components/ShopActionsPopover.vue'
import CreateGroupModal from '@/components/CreateGroupModal.vue'
import LinkFacilitiesToGroupModal from '@/components/LinkFacilitiesToGroupModal.vue'
import LinkThresholdFacilitiesToGroupModal from '@/components/LinkThresholdFacilitiesToGroupModal.vue'
import { useStore } from 'vuex';

const store = useStore();

const selectedSegment = ref("channels")

const inventoryChannels = computed(() => store.getters["channel/getInventoryChannels"])
const configFacilities = computed(() => store.getters["util/fetchConfigFacilities"])

onMounted(async () => {
  await store.dispatch("channel/fetchInventoryChannels");
  await store.dispatch("util/fetchConfigFacilities");
  await store.dispatch("util/fetchFacilities");
})


async function openShopActionsPopover(event: Event) {
  const popover = await popoverController.create({
    component: ShopActionsPopover,
    showBackdrop: false,
    event
  });

  return popover.present();
}

async function openCreateGroupModal() {
  const popover = await modalController.create({
    component: CreateGroupModal
  });

  return popover.present();
}

async function openLinkFacilitiesToGroupModal() {
  const popover = await modalController.create({
    component: LinkFacilitiesToGroupModal
  });

  return popover.present();
}

async function openLinkThresholdFacilitiesToGroupModal() {
  const popover = await modalController.create({
    component: LinkThresholdFacilitiesToGroupModal
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