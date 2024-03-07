<template>
  <ion-card>
    <ion-card-header>
      <div>
        <ion-card-subtitle class="overline">{{ "Facility ID" }}</ion-card-subtitle>
        <ion-card-title>{{ "Facility Name" }}</ion-card-title>
      </div>
    </ion-card-header>

    <ion-item lines="full" v-if="selectedPage.path === '/store-pickup'">
      <ion-icon slot="start" :icon="storefrontOutline"/>
      <ion-toggle>{{ translate(selectedPage.name) }}</ion-toggle>
    </ion-item>
    <ion-item lines="full" v-else-if="selectedPage.path === '/shipping'">
      <ion-icon slot="start" :icon="sendOutline"/>
      <ion-toggle>{{ translate(selectedPage.name) }}</ion-toggle>
    </ion-item>

    <ion-list>
      <ion-item-divider color="light">
        <ion-label>{{ translate("Facility groups") }}</ion-label>
        <ion-button slot="end" fill="clear" color="medium">
          <ion-icon :icon="optionsOutline" slot="icon-only" />
        </ion-button>
      </ion-item-divider>

      <ion-item lines="none">
        <ion-icon slot="start" :icon="checkmarkDoneCircleOutline"/>
        <ion-label class="ion-text-wrap">{{ "<Config facility ID>, <configFacilityID>" }}</ion-label>
      </ion-item>

      <ion-item-divider color="light">
        <ion-label>{{ translate("Product tags") }}</ion-label>
        <ion-button slot="end" fill="clear" color="medium">
          <ion-icon :icon="optionsOutline" slot="icon-only" />
        </ion-button>
      </ion-item-divider>

      <ion-item>
        <ion-icon slot="start" :icon="checkmarkDoneCircleOutline"/>
        <ion-label class="ion-text-wrap">{{ "<Product Tag, Product Tag>" }}</ion-label>
      </ion-item>
      <ion-item lines="none">
        <ion-icon slot="start" :icon="closeCircleOutline"/>
        <ion-label class="ion-text-wrap">{{ "<Product Tag, Product Tag>" }}</ion-label>
      </ion-item>

      <ion-item-divider color="light">
        <ion-label>{{ translate("Product features") }}</ion-label>
        <ion-button slot="end" fill="clear" color="medium">
          <ion-icon :icon="optionsOutline" slot="icon-only" />
        </ion-button>
      </ion-item-divider>

        <ion-item lines="none">
          <ion-button fill="clear">{{ translate("Run now") }}</ion-button>
          <ion-button color="medium" fill="clear" slot="end">
            <ion-icon :icon="ellipsisVerticalOutline" slot="icon-only"/>
          </ion-button>
      </ion-item>
    </ion-list>
  </ion-card>
</template>

<script lang="ts">
import {
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonToggle
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { checkmarkDoneCircleOutline, chevronDownOutline, chevronUpOutline, closeCircleOutline, ellipsisVerticalOutline, globeOutline, optionsOutline, pulseOutline, sendOutline, storefrontOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { translate } from '@hotwax/dxp-components';

export default defineComponent({
  name: 'FacilityItem',
  components: {
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonIcon,
    IonItem,
    IonItemDivider,
    IonLabel,
    IonList,
    IonToggle
  },
  data() {
    return {
      selectedPage: {
        path: '',
        name: ''
      } as any
    }
  },
  mounted() {
    this.selectedPage.path = this.router.currentRoute.value.path
    this.selectedPage.name = this.router.currentRoute.value.name
  },
  setup() {
    const router = useRouter();

    return {
      checkmarkDoneCircleOutline,
      chevronDownOutline,
      chevronUpOutline,
      closeCircleOutline,
      ellipsisVerticalOutline,
      globeOutline,
      optionsOutline,
      pulseOutline,
      router,
      sendOutline,
      storefrontOutline,
      translate
    };
  },
});
</script>

<style scoped>
ion-card {
  min-width: 375px;
}
ion-card-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>