<template>
  <ion-card>
    <ion-card-header>
      <div>
        <ion-card-subtitle class="overline">{{ rule.ruleId }}</ion-card-subtitle>
        <ion-card-title>{{ rule.ruleName }}</ion-card-title>
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
      <ion-chip slot="end" outline @click="editThreshold()">{{ rule.ruleActions[0].fieldValue }}</ion-chip>
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
      <template v-if="selectedSegment === 'productAndChannel'">
        <ion-item-divider color="light">
          <ion-label>{{ translate("Channels") }}</ion-label>
          <ion-button slot="end" fill="clear" color="medium">
            <ion-icon :icon="optionsOutline" slot="icon-only" />
          </ion-button>
        </ion-item-divider>
        
        <ion-item lines="none">
          <ion-icon slot="start" :icon="checkmarkDoneCircleOutline"/>
          <ion-label class="ion-text-wrap">{{ "<Config facility Id>, <Config facility Id>" }}</ion-label>
        </ion-item>
      </template>

      <template v-else>
        <ion-item-divider color="light">
          <ion-label>{{ translate("Facility groups") }}</ion-label>
          <ion-button slot="end" fill="clear" color="medium">
            <ion-icon :icon="optionsOutline" slot="icon-only" />
          </ion-button>
        </ion-item-divider>

        <ion-item v-if="selectedPage.path === '/threshold'" lines="none">
          <ion-icon slot="start" :icon="checkmarkDoneCircleOutline"/>
          <ion-label class="ion-text-wrap">{{ "<Config facility Name, Config facility Name>" }}</ion-label>
        </ion-item>
  
        <template v-else>
          <ion-item>
            <ion-icon slot="start" :icon="checkmarkDoneCircleOutline"/>
            <ion-label class="ion-text-wrap">{{ "<Group name, Group name>" }}</ion-label>
          </ion-item>
    
          <ion-item lines="none">
            <ion-icon slot="start" :icon="checkmarkDoneCircleOutline"/>
            <ion-label class="ion-text-wrap">{{ "<Group name, Group name>" }}</ion-label>
          </ion-item>
        </template>
      </template>

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

      <template v-if="selectedPage.path === '/threshold' || selectedPage.path === '/safety-stock'">
        <ion-item-divider color="light">
          <ion-label>{{ translate("Product features") }}</ion-label>
          <ion-button slot="end" fill="clear" color="medium">
            <ion-icon :icon="optionsOutline" slot="icon-only" />
          </ion-button>
        </ion-item-divider>
  
        <ion-item>
          <ion-icon slot="start" :icon="checkmarkDoneCircleOutline"/>
          <ion-label class="ion-text-wrap">{{ "<Product Features, Product Features>" }}</ion-label>
        </ion-item>
        <ion-item lines="full">
          <ion-icon slot="start" :icon="closeCircleOutline"/>
          <ion-label class="ion-text-wrap">{{ "<Product Features, Product Features>" }}</ion-label>
        </ion-item>
      </template>

      <ion-item lines="none">
        <ion-button fill="clear">{{ translate("Edit name") }}</ion-button>
        <ion-button color="medium" fill="clear" slot="end">
          <ion-icon :icon="archiveOutline" slot="icon-only"/>
        </ion-button>
      </ion-item>
    </ion-list>
  </ion-card>
</template>

<script setup lang="ts">
import { IonButton, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonIcon, IonItem, IonItemDivider, IonLabel, IonList, IonToggle, alertController, popoverController } from '@ionic/vue';
import { defineProps, onMounted, ref } from 'vue';
import { archiveOutline, checkmarkDoneCircleOutline, chevronDownOutline, chevronUpOutline, closeCircleOutline, globeOutline, optionsOutline, pulseOutline, sendOutline, storefrontOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { translate } from '@/i18n';

const router = useRouter();

const props = defineProps(["selectedSegment", "rule"])

const selectedPage = ref({
  path: '',
  name: ''
}) as any;

onMounted(() => {
  selectedPage.value.path = router.currentRoute.value.path
  selectedPage.value.name = router.currentRoute.value.name
  console.log(props.rule);
  
})

async function editThreshold() {
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
}

async function editSafetyStock() {
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
</script>

<style scoped>
ion-card-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>