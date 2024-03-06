<template>
  <ion-card>
    <ion-card-header>
      <div>
        <ion-card-subtitle class="overline">{{ "Rule ID" }}</ion-card-subtitle>
        <ion-card-title>{{ "Rule name" }}</ion-card-title>
        <ion-card-subtitle>{{ "1/4" }}</ion-card-subtitle>
      </div>
      <div>
        <ion-button fill="clear" color="medium" class="ion-no-padding">
          <ion-icon :icon="chevronUpOutline" slot="icon-only" />
        </ion-button>
        <ion-button fill="clear" color="medium" class="ion-no-padding">
          <ion-icon :icon="chevronDownOutline" slot="icon-only" />
        </ion-button>
      </div>
    </ion-card-header>

    <ion-item lines="full" v-if="selectedPage.path === '/threshold'">
      <ion-icon slot="start" :icon="globeOutline"/>
      <ion-label class="ion-text-wrap">{{ translate(selectedPage.name) }}</ion-label>
      <ion-chip slot="end" outline @click="editThreshold()">5</ion-chip>
    </ion-item>
    <ion-item lines="full" v-else-if="selectedPage.path === '/safety-stock'">
      <ion-icon slot="start" :icon="pulseOutline"/>
      <ion-label class="ion-text-wrap">{{ translate(selectedPage.name) }}</ion-label>
      <ion-chip slot="end" outline @click="editSafetyStock()">5</ion-chip>
    </ion-item>
    <ion-item lines="full" v-else-if="selectedPage.path === '/store-pickup'">
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

      <ion-item>
        <ion-icon slot="start" :icon="checkmarkDoneCircleOutline"/>
        <ion-label class="ion-text-wrap">{{ "<Group name, Group name>" }}</ion-label>
      </ion-item>
      <ion-item lines="none">
        <ion-icon slot="start" :icon="closeCircleOutline"/>
        <ion-label class="ion-text-wrap">{{ "<Group name, Group name>" }}</ion-label>
      </ion-item>

      <ion-item-divider color="light">
        <ion-label>{{ translate("Product tags") }}</ion-label>
        <ion-button slot="end" fill="clear" color="medium">
          <ion-icon :icon="optionsOutline" slot="icon-only" />
        </ion-button>
      </ion-item-divider>

      <ion-item>
        <ion-icon slot="start" :icon="checkmarkDoneCircleOutline"/>
        <ion-label class="ion-text-wrap">{{ "<Group name, Group name>" }}</ion-label>
      </ion-item>
      <ion-item lines="none">
        <ion-icon slot="start" :icon="closeCircleOutline"/>
        <ion-label class="ion-text-wrap">{{ "<Group name, Group name>" }}</ion-label>
      </ion-item>

      <ion-item-divider color="light">
        <ion-label>{{ translate("Product features") }}</ion-label>
        <ion-button slot="end" fill="clear" color="medium">
          <ion-icon :icon="optionsOutline" slot="icon-only" />
        </ion-button>
      </ion-item-divider>

      <ion-item>
        <ion-icon slot="start" :icon="checkmarkDoneCircleOutline"/>
        <ion-label class="ion-text-wrap">{{ "<Group name, Group name>" }}</ion-label>
      </ion-item>
      <ion-item lines="full">
        <ion-icon slot="start" :icon="closeCircleOutline"/>
        <ion-label class="ion-text-wrap">{{ "<Group name, Group name>" }}</ion-label>
        </ion-item>

        <ion-item lines="none">
          <ion-button fill="clear">{{ translate("Run now") }}</ion-button>
          <ion-button color="medium" fill="clear" slot="end" @click="openRuleActionsPopover($event)">
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
  IonChip,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonToggle,
  alertController,
  popoverController
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { checkmarkDoneCircleOutline, chevronDownOutline, chevronUpOutline, closeCircleOutline, ellipsisVerticalOutline, globeOutline, optionsOutline, pulseOutline, sendOutline, storefrontOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { translate } from '@hotwax/dxp-components';
import RuleActionsPopover from "@/components/RuleActionsPopover.vue";

export default defineComponent({
  name: 'RuleItem',
  components: {
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonChip,
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
  methods: {
    async openRuleActionsPopover(event: Event) {
      const popover = await popoverController.create({
        component: RuleActionsPopover,
        showBackdrop: false,
        event
      });

      return popover.present();
    },
    async editThreshold() {
      const alert = await alertController.create({
        header: translate("Edit threshold"),
        inputs: [{
          name: "threshold",
          placeholder: translate("Threshold"),
          type: "number",
          min: 0
        }],
        buttons: [{
          text: translate('Cancel'),
          role: "cancel"
        },
        {
          text: translate('Update'),
        }]
      })

      await alert.present()
    },
    async editSafetyStock() {
      const alert = await alertController.create({
        header: translate("Edit safety stock"),
        inputs: [{
          name: "safety-stock",
          placeholder: translate("Safety stock"),
          type: "number",
          min: 0
        }],
        buttons: [{
          text: translate('Cancel'),
          role: "cancel"
        },
        {
          text: translate('Update'),
        }]
      })

      await alert.present()
    }
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