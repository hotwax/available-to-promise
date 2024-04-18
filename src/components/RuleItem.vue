<template>
  <ion-card>
    <ion-card-header>
      <div>
        <ion-card-subtitle class="overline">{{ rule.ruleId }}</ion-card-subtitle>
        <ion-card-title>{{ rule.ruleName }}</ion-card-title>
        <ion-card-subtitle>{{ ruleIndex+1 }}/{{ total }}</ion-card-subtitle>
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
      <ion-chip slot="end" outline @click="editThreshold()">{{ rule.ruleActions[0]?.fieldValue }}</ion-chip>
    </ion-item>
    <ion-item lines="full" v-else-if="selectedPage.path === '/safety-stock'">
      <ion-icon slot="start" :icon="pulseOutline"/>
      <ion-label class="ion-text-wrap">{{ translate(selectedPage.name) }}</ion-label>
      <ion-chip slot="end" outline @click="editSafetyStock()">5</ion-chip>
    </ion-item>
    <ion-item lines="full" v-else-if="selectedPage.path === '/store-pickup'">Fixed the positioning of the security group displayed for the loggedin user.
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
          <ion-button slot="end" fill="clear" color="medium" @click="openSelectConfigFacilitiesModal()" >
            <ion-icon :icon="optionsOutline" slot="icon-only" />
          </ion-button>
        </ion-item-divider>

        <template v-if="selectedPage.path === '/threshold'">
          <ion-item v-if="getRuleConditions('ENTCT_ATP_FACILITIES')" lines="none">
            <ion-icon slot="start" :icon="checkmarkDoneCircleOutline"/>
            <ion-label class="ion-text-wrap">{{ getRuleConditions("ENTCT_ATP_FACILITIES") }}</ion-label>
          </ion-item>
        </template>

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
        <ion-button slot="end" fill="clear" color="medium" @click="openUpdateProductFiltersModal('tags', 'tagsFacet', 'tags')">
          <ion-icon :icon="optionsOutline" slot="icon-only" />
        </ion-button>
      </ion-item-divider>

      <ion-item v-if="getRuleConditions('ENTCT_ATP_FILTER', 'tags', 'in')">
        <ion-icon slot="start" :icon="checkmarkDoneCircleOutline"/>
        <ion-label class="ion-text-wrap">{{ getRuleConditions("ENTCT_ATP_FILTER", "tags", "in") }}</ion-label>
      </ion-item>
      <ion-item lines="none" v-if="getRuleConditions('ENTCT_ATP_FILTER', 'tags', 'not-in')">
        <ion-icon slot="start" :icon="closeCircleOutline"/>
        <ion-label class="ion-text-wrap">{{ getRuleConditions("ENTCT_ATP_FILTER", "tags", "not-in") }}</ion-label>
      </ion-item>

      <template v-if="(selectedPage.path === '/threshold' || selectedPage.path === '/safety-stock')">
        <ion-item-divider color="light">
          <ion-label>{{ translate("Product features") }}</ion-label>
          <ion-button slot="end" fill="clear" color="medium"  @click="openUpdateProductFiltersModal('product features', 'productFeaturesFacet', 'productFeatures')">
            <ion-icon :icon="optionsOutline" slot="icon-only" />
          </ion-button>
        </ion-item-divider>

        <ion-item v-if="getRuleConditions('ENTCT_ATP_FILTER', 'productFeatures', 'in')">
          <ion-icon slot="start" :icon="checkmarkDoneCircleOutline"/>
          <ion-label class="ion-text-wrap">{{ getRuleConditions("ENTCT_ATP_FILTER", "productFeatures", "in") }}</ion-label>
        </ion-item>
        <ion-item lines="full" v-if="getRuleConditions('ENTCT_ATP_FILTER', 'productFeatures', 'not-in')">
          <ion-icon slot="start" :icon="closeCircleOutline"/>
          <ion-label class="ion-text-wrap">{{ getRuleConditions("ENTCT_ATP_FILTER", "productFeatures", "not-in") }}</ion-label>
        </ion-item>
      </template>

      <ion-item lines="none">
        <ion-button @click="editRuleName()" fill="clear">{{ translate("Edit name") }}</ion-button>
        <ion-button @click="archiveRule()" color="medium" fill="clear" slot="end">
          <ion-icon :icon="archiveOutline" slot="icon-only"/>
        </ion-button>
      </ion-item>
    </ion-list>
  </ion-card>
</template>

<script setup lang="ts">
import { IonButton, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonIcon, IonItem, IonItemDivider, IonLabel, IonList, IonToggle, alertController, modalController } from '@ionic/vue';
import { computed, defineProps, onMounted, ref } from 'vue';
import { archiveOutline, checkmarkDoneCircleOutline, chevronDownOutline, chevronUpOutline, closeCircleOutline, globeOutline, optionsOutline, pulseOutline, sendOutline, storefrontOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { translate } from '@/i18n';
import { RuleService } from '@/services/RuleService';
import { useStore } from 'vuex';
import { showToast } from '@/utils';
import logger from '@/logger';
import SelectConfigFacilitiesModal from '@/components/SelectConfigFacilitiesModal.vue';
import UpdateProductFiltersModal from '@/components/UpdateProductFiltersModal.vue';

const router = useRouter();
const store = useStore();

const props = defineProps(["selectedSegment", "rule", "ruleIndex"])
const total = computed(() => store.getters["rule/getTotalRulesCount"])
const configFacilities = computed(() => store.getters["util/getConfigFacilities"])

const selectedPage = ref({
  path: '',
  name: ''
}) as any;

onMounted(() => {
  selectedPage.value.path = router.currentRoute.value.path
  selectedPage.value.name = router.currentRoute.value.name
})

async function editThreshold() {
  const alert = await alertController.create({
    header: translate("Edit threshold"),
    inputs: [{
      name: "threshold",
      placeholder: translate("Threshold"),
      type: "number",
      value: props.rule.ruleActions[0].fieldValue,
      min: 0
    }],
    buttons: [{
      text: translate('Cancel'),
      role: "cancel"
    },
    {
      text: translate('Update'),
      handler: async(data) => {
        if(data.threshold) {
          const rule = JSON.parse(JSON.stringify(props.rule))
          rule.ruleActions[0].fieldValue = data.threshold

          try {
            await RuleService.updateRule(rule, props.rule.ruleId)
            await store.dispatch('rule/updateRuleData', { rule })
            showToast(translate("Threshold updated successfully."))
            alertController.dismiss()
          } catch(err: any) {
            showToast(translate("Failed to update threhold."))
            logger.error(err);
          }
        }
      }
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

async function editRuleName() {
  const alert = await alertController.create({
    header: translate("Edit name"),
    inputs: [{
      name: "safetyStock",
      placeholder: translate("Name"),
      type: "text",
      value: props.rule.ruleName
    }],
    buttons: [{
      text: translate('Cancel'),
      role: "cancel"
    },
    {
      text: translate('Update'),
      handler: async(data) => {
        if(data.safetyStock) {
          const rule = JSON.parse(JSON.stringify(props.rule))
          rule.ruleName = data.safetyStock

          try {
            await RuleService.updateRule(rule, props.rule.ruleId)
            showToast(translate("Rule name updated successfully."))
            await store.dispatch('rule/updateRuleData', { rule })
            alertController.dismiss()
          } catch(err: any) {
            logger.error(err)
            showToast(translate("Failed to update rule name."))
          }
        }
      }
    }]
  })

  await alert.present()
}

function getRuleConditions(conditionTypeEnumId: string, fieldName?: string, operator? : string) {
  if(fieldName && operator) {
    const condition = props.rule.ruleConditions.find((condition: any) => condition.conditionTypeEnumId === conditionTypeEnumId && condition.fieldName === fieldName && condition.operator === operator)
    return condition?.fieldValue?.split(",").join(", ")
  } else {
    const condition = props.rule.ruleConditions.find((condition: any) => condition.conditionTypeEnumId === conditionTypeEnumId)

    if(condition && condition.fieldValue) {
      let facilities = condition?.fieldValue.split(",")
      facilities = facilities.map((id: string) => {
        let facility = configFacilities.value.find((facility: any) => facility.facilityId === id)
        return facility ? facility.facilityName : null
      })
      return facilities.join(", ")
    }
  }
}

async function archiveRule() {
  const alert = await alertController
    .create({
      header: translate('Archive rule'),
      message: translate('Are you sure you want to archive this rule?'),
      buttons: [{
        text: translate('No'),
        role: 'cancel'
      }, {
        text: translate('Yes'),
        handler: async () => {
          const rule = JSON.parse(JSON.stringify(props.rule))
          rule.statusId = "ATP_RULE_ARCHIVED"

          try {
            await RuleService.updateRule(rule, props.rule.ruleId)
            await store.dispatch('rule/archiveRule', { rule })
            showToast(translate("Rule archived successfully."))
            alertController.dismiss()
          } catch(err: any) {
            showToast(translate("Failed to update threhold."))
            logger.error(err);
          }
        }
      }]
    });
  return alert.present();
}

function getSelectedFacilities() {
  const condition = props.rule.ruleConditions.find((condition: any) => condition.conditionTypeEnumId === "ENTCT_ATP_FACILITIES")
  return (condition && condition.fieldValue) ? condition.fieldValue.split(",") : []
}

async function openSelectConfigFacilitiesModal() {
  const modal = await modalController.create({
    component: SelectConfigFacilitiesModal,
    componentProps: {
      selectedFacilities: getSelectedFacilities(),
      rule: props.rule
    },
  })

  modal.present()
}

async function openUpdateProductFiltersModal(label: string, facetToSelect: string, searchfield: string) {
  const modal = await modalController.create({
    component: UpdateProductFiltersModal,
    componentProps: {
      label,
      facetToSelect,
      searchfield,
      rule: props.rule
    },
  })

  modal.present()
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