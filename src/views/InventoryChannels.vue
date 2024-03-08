<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
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
          <ion-card>
            <ion-card-header>
              <div>
                <ion-card-subtitle class="overline">{{ "Group ID" }}</ion-card-subtitle>
                <ion-card-title>{{ "Group name" }}</ion-card-title>
              </div>

              <ion-button fill="clear" color="medium">
                <ion-icon :icon="copyOutline" slot="icon-only" />
              </ion-button>
            </ion-card-header>

            <ion-list>
              <ion-item lines="full">
                <ion-icon slot="start" :icon="globeOutline"/>
                <ion-label>
                  {{ "<threshold facility name>" }}
                  <p>{{ "<facilityId>" }}</p>
                </ion-label>
                <ion-chip slot="end" outline>4</ion-chip>
              </ion-item>

              <ion-item lines="full">
                <ion-icon slot="start" :icon="storefrontOutline"/>
                <ion-label>
                  {{ "<retail type facilityid count>" }}
                </ion-label>
                <ion-chip slot="end" outline>15</ion-chip>
              </ion-item>

              <ion-item lines="full">
                <ion-icon slot="start" :icon="businessOutline"/>
                <ion-label>
                  {{ "<warehouse type facilityId count>" }}
                </ion-label>
                <ion-chip slot="end" outline>1</ion-chip>
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
                <ion-button fill="clear">{{ translate("View details") }}</ion-button>
                  <ion-button color="medium" fill="clear" slot="end">
                  <ion-icon :icon="ellipsisVerticalOutline" slot="icon-only"/>
                </ion-button>
              </ion-item>
            </ion-list>
          </ion-card>
        </section>
      </main>
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button>
        <ion-icon :icon="addOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script lang="ts">
import {
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { addOutline, albumsOutline, businessOutline, copyOutline, ellipsisVerticalOutline, globeOutline, storefrontOutline, timeOutline, timerOutline } from 'ionicons/icons';
import { translate } from '@hotwax/dxp-components';

export default defineComponent({
  name: 'Inventory channels',
  components: {
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonChip,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonPage,
    IonSegment,
    IonSegmentButton,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar
  },
  data() {
    return {
      selectedSegment: 'channels'
    }
  },
  setup() {
    return {
      addOutline,
      albumsOutline,
      businessOutline,
      copyOutline,
      ellipsisVerticalOutline,
      globeOutline,
      storefrontOutline,
      timeOutline,
      timerOutline,
      translate
    };
  },
});
</script>

<style scoped>
ion-card-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>