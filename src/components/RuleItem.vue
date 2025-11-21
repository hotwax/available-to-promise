<template>
  <ion-card>
    <ion-accordion-group :value="isReorderActive">
      <ion-accordion value="false">
        <ion-card-header slot="header" @click="$event.stopImmediatePropagation()">
          <div>
            <ion-card-subtitle class="overline">{{ rule.ruleId }}</ion-card-subtitle>
            <ion-card-title>{{ rule.ruleName }}</ion-card-title>
            <ion-card-subtitle>{{ ruleIndex+1 }}/{{ total }}</ion-card-subtitle>
          </div>
          <ion-item v-if="isReorderActive" lines="none">
            <ion-reorder slot="end"></ion-reorder>
          </ion-item>
        </ion-card-header>
        <div slot="content">
          <ion-item lines="full" v-if="selectedPage.path === '/threshold'">
            <ion-icon slot="start" :icon="globeOutline"/>
            <ion-label class="ion-text-wrap">{{ translate(selectedPage.name) }}</ion-label>
            <ion-chip slot="end" outline @click="editThreshold()">{{ rule.ruleActions?.length ? rule.ruleActions[0]?.fieldValue : '-' }}</ion-chip>
          </ion-item>
          <ion-item lines="full" v-else-if="selectedPage.path === '/safety-stock'">
            <ion-icon slot="start" :icon="pulseOutline"/>
            <ion-label class="ion-text-wrap">{{ translate(selectedPage.name) }}</ion-label>
            <ion-chip slot="end" outline @click="editSafetyStock()">{{ rule.ruleActions?.length ? rule.ruleActions[0].fieldValue : '-' }}</ion-chip>
          </ion-item>
          <ion-item lines="full" v-else-if="selectedPage.path === '/store-pickup'">
            <ion-icon slot="start" :icon="storefrontOutline"/>
            <ion-toggle :checked="props.rule.ruleActions[0].fieldValue === 'Y' ? true : false" @click.prevent="updateRulePickup($event)">{{ translate(selectedPage.name) }}</ion-toggle>
          </ion-item>
          <ion-item lines="full" v-else-if="selectedPage.path === '/shipping'">
            <ion-icon slot="start" :icon="sendOutline"/>
            <ion-toggle :checked="props.rule.ruleActions[0].fieldValue === 'Y' ? true : false" @click.prevent="updateRuleShipping($event)">{{ translate(selectedPage.name) }}</ion-toggle>
          </ion-item>

          <template v-if="selectedPage.path === '/threshold' || selectedSegment === 'RG_PICKUP_CHANNEL' || selectedSegment === 'RG_SHIPPING_CHANNEL'">
            <ion-item-divider color="light">
              <ion-label>{{ translate("Channels") }}</ion-label>
            </ion-item-divider>

            <ion-item v-if="isRuleConditionAvailable('ENTCT_ATP_FACILITIES')" lines="full">
              <ion-icon slot="start" :icon="checkmarkDoneCircleOutline"/>
              <ion-label class="ion-text-wrap">{{ getRuleConditions("ENTCT_ATP_FACILITIES") }}</ion-label>
            </ion-item>
          </template>
          
          <template v-else>
            <ion-item-divider color="light">
              <ion-label>{{ translate("Facilities") }}</ion-label>
            </ion-item-divider>
            
            <ion-item v-if="isRuleConditionAvailable('ENTCT_ATP_FAC_GROUPS', 'facilityGroupId', 'in')">
              <ion-icon slot="start" :icon="checkmarkDoneCircleOutline"/>
              <ion-label class="ion-text-wrap">{{ getRuleConditions("ENTCT_ATP_FAC_GROUPS", "facilityGroupId", "in") }}</ion-label>
            </ion-item>
            <ion-item lines="full" v-if="isRuleConditionAvailable('ENTCT_ATP_FAC_GROUPS', 'facilityGroupId', 'not-in')">
              <ion-icon slot="start" :icon="closeCircleOutline"/>
              <ion-label class="ion-text-wrap">{{ getRuleConditions("ENTCT_ATP_FAC_GROUPS", "facilityGroupId", "not-in") }}</ion-label>
            </ion-item>
          </template>

          <template v-if="areProductFiltersSelected()">
            <ion-item-divider color="light" v-if="isRuleConditionAvailable('ENTCT_ATP_FILTER', 'tags', 'contains') || isRuleConditionAvailable('ENTCT_ATP_FILTER', 'tags', 'not-contains')">
              <ion-label>{{ translate("Product tags") }}</ion-label>
            </ion-item-divider>

            <ion-item v-if="isRuleConditionAvailable('ENTCT_ATP_FILTER', 'tags', 'contains')" :lines="isRuleConditionAvailable('ENTCT_ATP_FILTER', 'tags', 'not-contains') ? '' : 'full'">
              <ion-icon slot="start" :icon="checkmarkDoneCircleOutline"/>
              <ion-label class="ion-text-wrap">{{ getRuleConditions("ENTCT_ATP_FILTER", "tags", "contains") }}</ion-label>
            </ion-item>
            <ion-item lines="full" v-if="isRuleConditionAvailable('ENTCT_ATP_FILTER', 'tags', 'not-contains')">
              <ion-icon slot="start" :icon="closeCircleOutline"/>
              <ion-label class="ion-text-wrap">{{ getRuleConditions("ENTCT_ATP_FILTER", "tags", "not-contains") }}</ion-label>
            </ion-item>

            <ion-item-divider color="light" v-if="isRuleConditionAvailable('ENTCT_ATP_FILTER', 'productFeatures', 'contains') || isRuleConditionAvailable('ENTCT_ATP_FILTER', 'productFeatures', 'not-contains')">
              <ion-label>{{ translate("Product features") }}</ion-label>
            </ion-item-divider>

            <ion-item v-if="isRuleConditionAvailable('ENTCT_ATP_FILTER', 'productFeatures', 'contains')" :lines="isRuleConditionAvailable('ENTCT_ATP_FILTER', 'productFeatures', 'not-contains') ? '' : 'full'">
              <ion-icon slot="start" :icon="checkmarkDoneCircleOutline"/>
              <ion-label class="ion-text-wrap">{{ getRuleConditions("ENTCT_ATP_FILTER", "productFeatures", "contains") }}</ion-label>
            </ion-item>
            <ion-item lines="full" v-if="isRuleConditionAvailable('ENTCT_ATP_FILTER', 'productFeatures', 'not-contains')">
              <ion-icon slot="start" :icon="closeCircleOutline"/>
              <ion-label class="ion-text-wrap">{{ getRuleConditions("ENTCT_ATP_FILTER", "productFeatures", "not-contains") }}</ion-label>
            </ion-item>
          </template>
          <template v-else>
            <ion-item-divider color="light">
              <ion-label>{{ translate("Products") }}</ion-label>
            </ion-item-divider>

            <ion-item lines="full">
              <ion-icon slot="start" :icon="shirtOutline"/>
              <ion-label class="ion-text-wrap">{{ translate("All products selected.") }}</ion-label>
            </ion-item>
          </template>

          <div class="actions">
            <ion-button @click="editRule()" fill="clear">{{ translate("Edit rule") }}</ion-button>
            <ion-button @click="archiveRule()" color="medium" fill="clear" slot="end">
              <ion-icon :icon="archiveOutline" slot="icon-only"/>
            </ion-button>
          </div>
        </div>
      </ion-accordion>
    </ion-accordion-group>
  </ion-card>
</template>

<script setup lang="ts">
import { IonAccordion, IonAccordionGroup, IonButton, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonIcon, IonItem, IonItemDivider, IonLabel, IonReorder, IonToggle, alertController } from '@ionic/vue';
import { computed, defineProps, onMounted, ref } from 'vue';
import { archiveOutline, checkmarkDoneCircleOutline, closeCircleOutline, globeOutline, pulseOutline, sendOutline, shirtOutline, storefrontOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { translate } from '@hotwax/dxp-components';
import { RuleService } from '@/services/RuleService';
import { useStore } from 'vuex';
import { showToast } from '@/utils';
import logger from '@/logger';
import emitter from '@/event-bus';

const router = useRouter();
const store = useStore();

const props = defineProps(["rule", "ruleIndex"])
const total = computed(() => store.getters["rule/getTotalRulesCount"])
const configFacilities = computed(() => store.getters["util/getConfigFacilities"])
const facilityGroups = computed(() => store.getters["util/getFacilityGroups"])
const isReorderActive = computed(() => store.getters["rule/isReorderActive"]);
const selectedSegment = computed(() => store.getters["util/getSelectedSegment"])

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
      value: props.rule.ruleActions?.length ? props.rule.ruleActions[0].fieldValue : 0,
      min: 0,
      attributes: {
        // Added check to not allow mainly .(period) and other special characters to be entered in the alert input
        onkeydown: ($event: any) => {
          if(/[`!@#$%^&*()_+\-=\\|,.<>?~^e]/.test($event.key) && event.key !== 'Backspace') $event.preventDefault();
        }
      }
    }],
    buttons: [{
      text: translate('Cancel'),
      role: "cancel"
    },
    {
      text: translate('Update'),
      handler: async(data) => {
        if(!data.threshold || data.threshold < 0) {
          showToast(translate("Threshold should be greater than or equal to 0."));
          return false;
        }

        if(data.threshold === props.rule.ruleActions[0].fieldValue) return;

        emitter.emit("presentLoader");

        const rule = JSON.parse(JSON.stringify(props.rule))

        if(!rule.ruleActions?.length) {
          rule.ruleActions = [{
            "ruleId": props.rule.ruleId,
            "actionTypeEnumId": "ATP_SAFETY_STOCK",
            "fieldName": "facility-safety-stock",
            "fieldValue": data.threshold
          }]
        } else {
          rule.ruleActions[0].fieldValue = data.threshold
        }

        try {
          await RuleService.updateRule(rule, props.rule.ruleId)
          await store.dispatch('rule/updateRuleData', { rule })
          showToast(translate("Threshold updated successfully."))
          alertController.dismiss()
        } catch(err: any) {
          showToast(translate("Failed to update threshold."))
          logger.error(err);
        }
        emitter.emit("dismissLoader");
      }
    }]
  })

  await alert.present()
}

async function editSafetyStock() {
  const alert = await alertController.create({
    header: translate("Edit safety stock"),
    inputs: [{
      name: "safetyStock",
      placeholder: translate("Safety stock"),
      type: "number",
      value: props.rule.ruleActions?.length ? props.rule.ruleActions[0].fieldValue : 0,
      min: 0,
      attributes: {
        // Added check to not allow mainly .(period) and other special characters to be entered in the alert input
        onkeydown: ($event: any) => {
          if(/[`!@#$%^&*()_+\-=\\|,.<>?~e]/.test($event.key) && event.key !== 'Backspace') $event.preventDefault();
        }
      }
    }],
    buttons: [{
      text: translate('Cancel'),
      role: "cancel"
    },
    {
      text: translate('Update'),
      handler: async (data: any) => {
        if(!data.safetyStock || data.safetyStock < 0) {
          showToast(translate("Safety stock should be greater than or equal to 0."));
          return false;
        }

        if(data.safetyStock === props.rule.ruleActions[0].fieldValue) return;

        emitter.emit("presentLoader");

        const rule = JSON.parse(JSON.stringify(props.rule))

        if(!rule.ruleActions?.length) {
          rule.ruleActions = [{
            "ruleId": props.rule.ruleId,
            "actionTypeEnumId": "ATP_SAFETY_STOCK",
            "fieldName": "facility-safety-stock",
            "fieldValue": data.safetyStock
          }]
        } else {
          rule.ruleActions[0].fieldValue = data.safetyStock
        }

        try {
          await RuleService.updateRule(rule, props.rule.ruleId)
          await store.dispatch('rule/updateRuleData', { rule })
          showToast(translate("Safety stock updated successfully."))
          alertController.dismiss()
        } catch(err: any) {
          showToast(translate("Failed to update safety stock."))
          logger.error(err);
        }
        emitter.emit("dismissLoader");
      }
    }]
  })

  await alert.present()
}

function getRuleConditions(conditionTypeEnumId: string, fieldName?: string, operator? : string) {
  if(!props.rule.ruleConditions) return;

  if(fieldName && operator) {
    const condition = props.rule.ruleConditions.find((condition: any) => condition.conditionTypeEnumId === conditionTypeEnumId && condition.fieldName === fieldName && condition.operator === operator)
    if(condition && conditionTypeEnumId === 'ENTCT_ATP_FAC_GROUPS') {
      if(condition.fieldValue === "ALL") return translate("All facility groups selected");

      let facilityGroupIds = condition?.fieldValue.split(",")
        facilityGroupIds = facilityGroupIds.map((id: string) => {
          let group = facilityGroups.value.find((group: any) => group.facilityGroupId === id)
          return group?.facilityGroupName ? group.facilityGroupName : id
        })
        return facilityGroupIds.join(", ")
    } else {
      return condition?.fieldValue?.split(",").join(", ")
    }
  } else {
    const condition = props.rule.ruleConditions.find((condition: any) => condition.conditionTypeEnumId === conditionTypeEnumId)

    if(condition && condition.fieldValue) {
      if(condition.fieldValue === "ALL") return translate("All channels selected");

      let facilities = condition?.fieldValue.split(",")
      facilities = facilities.map((id: string) => {
        let facility = configFacilities.value.find((facility: any) => facility.facilityId === id)
        return facility?.facilityName ? facility.facilityName : id
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
          emitter.emit("presentLoader");
          const rule = JSON.parse(JSON.stringify(props.rule))
          rule.statusId = "ATP_RULE_ARCHIVED"

          try {
            await RuleService.updateRule(rule, props.rule.ruleId)
            await store.dispatch('rule/fetchRules', { ruleGroupId: props.rule.ruleGroupId })
            showToast(translate("Rule archived successfully."))
            alertController.dismiss()
          } catch(err: any) {
            showToast(translate("Failed to update threhold."))
            logger.error(err);
          }
          emitter.emit("dismissLoader");
        }
      }]
    });
  return alert.present();
}

function isRuleConditionAvailable(conditionTypeEnumId: string, fieldName?: string, operator? : string) {
  if(fieldName) return props.rule.ruleConditions?.find((condition: any) => condition.conditionTypeEnumId === conditionTypeEnumId && condition.fieldName === fieldName && condition.operator === operator)?.fieldValue
  else return props.rule.ruleConditions?.find((condition: any) => condition.conditionTypeEnumId === conditionTypeEnumId)?.fieldValue
}

function areProductFiltersSelected() {
  return props.rule.ruleConditions.some((condition: any) => condition.conditionTypeEnumId === "ENTCT_ATP_FILTER" && condition.fieldValue);
}

async function updateRulePickup(event: any) {
  event.stopImmediatePropagation();
  const isChecked = !event.target.checked;
  
  emitter.emit("presentLoader");
  try {
    const rule = JSON.parse(JSON.stringify(props.rule))
    rule.ruleActions.map((action: any) => {
      if(action.actionTypeEnumId === "ATP_ALLOW_PICKUP") action.fieldValue = isChecked ? "Y" : "N"
    })

    await RuleService.updateRule(rule, props.rule.ruleId)
    showToast(translate("Rule pickup updated successfully."))
    await store.dispatch('rule/updateRuleData', { rule })
    event.target.checked = isChecked
  } catch(err) {
    logger.error(err)
    showToast(translate("Failed to update rule pickup."))
  }
  emitter.emit("dismissLoader");
}

async function updateRuleShipping(event: any) {
  event.stopImmediatePropagation();
  const isChecked = !event.target.checked;

  emitter.emit("presentLoader");
  try {
    const rule = JSON.parse(JSON.stringify(props.rule))
    rule.ruleActions.map((action: any) => {
      if(action.actionTypeEnumId === "ATP_ALLOW_BROKERING") action.fieldValue = isChecked ? "Y" : "N"
    })

    await RuleService.updateRule(rule, props.rule.ruleId)
    showToast(translate("Rule shipping updated successfully."))
    await store.dispatch('rule/updateRuleData', { rule })
    event.target.checked = isChecked
  } catch(err) {
    logger.error(err)
    showToast(translate("Failed to update rule brokering."))
  }
  emitter.emit("dismissLoader");
}

function editRule() {
  let path = ""
  if(selectedPage.value.path === "/threshold") {
    path = `update-threshold/${props.rule.ruleId}`
  } else if(selectedPage.value.path === "/safety-stock") {
    path = `update-safety-stock/${props.rule.ruleId}`
  } else if(selectedPage.value.path === "/store-pickup") {
    path = `update-store-pickup/${props.rule.ruleId}`
  } else if(selectedPage.value.path === "/shipping") {
    path = `update-shipping/${props.rule.ruleId}`
  }

  if(selectedSegment.value) {
    router.push({ path, query: { groupTypeEnumId: selectedSegment.value } });
  } else {
    router.push(path)
  }
}
</script>

<style scoped>
ion-card-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

ion-card-header div {
  word-break: break-word;
}
ion-card-header ion-item {
  flex: 0 0 auto;
}

.actions {
  display: flex;
  justify-content: space-between;
}
</style>