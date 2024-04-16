<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal">
          <ion-icon slot="icon-only" :icon="arrowBackOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Select", { label }) }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-searchbar :placeholder="translate('Search', { label })" v-model="queryString" @keyup.enter="search()"/>

    <ion-segment v-model="selectedSegment">
      <ion-segment-button value="included">
        <ion-label>{{ translate("Included") }}</ion-label>
      </ion-segment-button>
      <ion-segment-button value="excluded">
        <ion-label>{{ translate("Excluded") }}</ion-label>
      </ion-segment-button>
    </ion-segment>

    <ion-list>
      <ion-item v-for="option in facetOptions" :key="option.id"  @click="!isAlreadyApplied(option.id) ? updateSelectedValues(option.id): ''">
        <ion-label v-if="isAlreadyApplied(option.id)">{{ option.label }}</ion-label>
        <ion-checkbox v-if="!isAlreadyApplied(option.id)" :checked="isSelected(option.id)">
          {{ option.label }}
        </ion-checkbox>
        <ion-note v-else slot="end" color="danger">{{ selectedSegment === 'included' ? translate("excluded") : translate("included") }}</ion-note>
      </ion-item>
    </ion-list>

    <!-- Added padding for better visiblity of the checkboxes beside the FAB -->
    <ion-fab class="ion-padding" vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="saveFilters()">
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>

    <ion-infinite-scroll @ionInfinite="loadMoreTags($event)" threshold="100px" :disabled="!isScrollable">
      <ion-infinite-scroll-content loading-spinner="crescent" :loading-text="translate('Loading')"/>
    </ion-infinite-scroll>
  </ion-content>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { arrowBackOutline, saveOutline } from 'ionicons/icons';
import { useStore } from "vuex";
import { UtilService } from "@/services/UtilService";
import { RuleService } from "@/services/RuleService";
import { defineProps, ref } from "vue";
import { translate } from "@/i18n";
import { hasError, showToast } from "@/utils";
import logger from "@/logger";

const queryString = ref('');
const facetOptions = ref([]) as any;
const isScrollable = ref(true);
const selectedSegment = ref("included")
const includedFilters = ref([]) as any;
const excludedFilters = ref([]) as any;

const props = defineProps(["label", "facetToSelect", "searchfield", "rule"]);
const store = useStore();

onMounted(() => {
  const includedCondition = props.rule.ruleConditions.find((condition: any) => condition.conditionTypeEnumId === 'ENTCT_ATP_FILTER' && condition.fieldName === props.searchfield && condition.operator === 'in')
  console.log(includedCondition.fieldNameValue);
  
  if(includedCondition && includedCondition.fieldValue) includedFilters.value = includedCondition.fieldValue.split(",");

  const excludedCondition = props.rule.ruleConditions.find((condition: any) => condition.conditionTypeEnumId === 'ENTCT_ATP_FILTER' && condition.fieldName === props.searchfield && condition.operator === 'not-in')
  if(excludedCondition && excludedCondition.fieldValue) excludedFilters.value = excludedCondition.fieldValue.split(",");
})

function closeModal() {
  modalController.dismiss({ dismissed: true });
}

function search() {
  getTags();
}

async function getTags(vSize?: any, vIndex?: any) {
  const viewSize = vSize ? vSize : process.env.VUE_APP_VIEW_SIZE;
  const viewIndex = vIndex ? vIndex : 0;

  const payload = {
    facetToSelect: props.facetToSelect,
    docType: 'PRODUCT',
    coreName: 'enterpriseSearch',
    searchfield: props.searchfield,
    jsonQuery: '{"query":"*:*","filter":["docType:PRODUCT"]}',
    noConditionFind: 'N',
    limit: viewSize,
    q: queryString.value,
    term: queryString.value,
    offset: 0,
  }

  const resp = await UtilService.fetchFacets(payload);
  if(!hasError(resp)) {
    const results = resp.data.facetResponse.response
    facetOptions.value = viewIndex === 0 ? results : [...facetOptions.value , ...results];
    isScrollable.value = (facetOptions.value.length % process.env.VUE_APP_VIEW_SIZE) === 0;

  } else {
    facetOptions.value = [];
    isScrollable.value = false;
  }
}

async function loadMoreTags(event: any){
  getTags(
    undefined,
    Math.ceil(facetOptions.value.length / process.env.VUE_APP_VIEW_SIZE).toString() 
  ).then(() => {
    event.target.complete();
  })
}

function updateSelectedValues(value: string) {
  if(selectedSegment.value === 'included') {
    if(includedFilters.value.includes(value)) includedFilters.value.splice(includedFilters.value.indexOf(value), 1)
    else includedFilters.value.push(value)
  } 
  else {
    if(excludedFilters.value.includes(value)) excludedFilters.value.splice(excludedFilters.value.indexOf(value), 1)
    else excludedFilters.value.push(value) 
  }
}

function isAlreadyApplied(value: string) {
  if(selectedSegment.value === 'included') {
    return excludedFilters.value.includes(value);
  } else {
    return includedFilters.value.includes(value)
  }
}

function isSelected(value: string) {
  if(selectedSegment.value === 'included') return includedFilters.value.includes(value);
  else return excludedFilters.value.includes(value)
}

async function saveFilters() {
  const rule = JSON.parse(JSON.stringify(props.rule))

  if(includedFilters.value.length) {
    const condition = rule.ruleConditions.find((condition: any) => condition.conditionTypeEnumId === 'ENTCT_ATP_FILTER' && condition.fieldName === props.searchfield && condition.operator === 'in')
    if(condition) {
      condition.fieldValue = includedFilters.value.join(",")
    } else {
      rule.ruleConditions.push({ 
        "_entity": "ruleCondition",
        "ruleId": rule.ruleId,
        "conditionTypeEnumId": "ENTCT_ATP_FILTER",
        "fieldName": props.searchfield,
        "operator": selectedSegment.value === "included" ? "in" : "not-in",
        "fieldValue": includedFilters.value?.length > 1 ? includedFilters.value.join(",") : includedFilters.value[0],
        "multiValued": includedFilters.value?.length > 1 ? "Y" : "N"
      })
    }
  }

  if(excludedFilters.value.length) {
    const condition = rule.ruleConditions.find((condition: any) => condition.conditionTypeEnumId === 'ENTCT_ATP_FILTER' && condition.fieldName === props.searchfield && condition.operator === 'not-in')
    if(condition) {
      condition.fieldValue = excludedFilters.value.join(",")
    } else {
      rule.ruleConditions.push({ 
        "_entity": "ruleCondition",
        "ruleId": rule.ruleId,
        "conditionTypeEnumId": "ENTCT_ATP_FILTER",
        "fieldName": props.searchfield,
        "operator": selectedSegment.value === "included" ? "in" : "not-in",
        "fieldValue": excludedFilters.value?.length > 1 ? excludedFilters.value.join(",") : excludedFilters.value[0],
        "multiValued": excludedFilters.value?.length > 1 ? "Y" : "N"
      })
    }
  }

  try {
    await RuleService.updateRule(rule, rule.ruleId)
    await store.dispatch('rule/updateRuleData', { rule })
    showToast(translate("Product filters updated succesfully."))
    modalController.dismiss()
  } catch(err: any) {
    showToast(translate("Failed to update product filters."))
    logger.error(err);
  }
}
</script>