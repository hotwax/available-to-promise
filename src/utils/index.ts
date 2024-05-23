import { toastController } from '@ionic/vue';
import { DateTime } from 'luxon';

// TODO Use separate files for specific utilities

// TODO Remove it when HC APIs are fully REST compliant
const hasError = (response: any) => {
    return typeof response.data != "object" || !!response.data._ERROR_MESSAGE_ || !!response.data._ERROR_MESSAGE_LIST_ || !!response.data.error;
}

const showToast = async (message: string) => {
  const toast = await toastController
    .create({
      message,
      duration: 3000,
      position: "bottom",
    })
  return toast.present();
}

function getDateAndTime(time: any) {
  return time ? DateTime.fromMillis(time).toLocaleString(DateTime.DATETIME_MED) : "-";
}

const getTime = (time: any) => {
  return time ? DateTime.fromMillis(time).toLocaleString(DateTime.TIME_SIMPLE) : "-";
}

function getDate(runTime: any) {
  return DateTime.fromMillis(runTime).toLocaleString(DateTime.DATE_MED);
}

function timeTillRun(endTime: any) {
  const timeDiff = DateTime.fromMillis(endTime).diff(DateTime.local());
  return DateTime.local().plus(timeDiff).toRelative();
}

const generateInternalId = (name: string) => {
  return name.trim().toUpperCase().split(' ').join('_');
}

const doReorder = (event: CustomEvent, rules: any) => {
  const previousSeq = JSON.parse(JSON.stringify(rules))

  // returns the updated sequence after reordering
  const updatedSeq = event.detail.complete(JSON.parse(JSON.stringify(rules)));

  let diffSeq = findRulesDiff(previousSeq, updatedSeq)

  const updatedSeqenceNum = previousSeq.map((rule: any) => rule.sequenceNum)
  Object.keys(diffSeq).map((key: any) => {
    diffSeq[key].sequenceNum = updatedSeqenceNum[key]
  })

  diffSeq = Object.keys(diffSeq).map((key) => diffSeq[key])
  return updatedSeq
}

const findRulesDiff = (previousSeq: any, updatedSeq: any) => {
  const diffSeq: any = Object.keys(previousSeq).reduce((diff, key) => {
    if (updatedSeq[key].ruleId === previousSeq[key].ruleId && updatedSeq[key].sequenceNum === previousSeq[key].sequenceNum) return diff
    return {
      ...diff,
      [key]: updatedSeq[key]
    }
  }, {})
  return diffSeq;
}

const generateRuleActions = (ruleId: string, actionTypeEnumId: string, actionValue: any, isConditionExists: boolean, ruleActions: any) => {
  if(isConditionExists) {
    const ruleAction = ruleActions.find((action: any) => action.actionTypeEnumId === actionTypeEnumId)
    if(ruleAction) {
      if(actionTypeEnumId === "ATP_THRESHOLD" || actionTypeEnumId === "ATP_SAFETY_STOCK") {
        ruleAction.fieldValue = actionValue ? actionValue : 0;
      } else {
        ruleAction.fieldValue = actionValue ? "Y" : "N"
      }
      return [ruleAction];
    }
  }

  let condition;
  if(actionTypeEnumId === "ATP_THRESHOLD" || actionTypeEnumId === "ATP_SAFETY_STOCK") {
    condition = [{
      ruleId,
      actionTypeEnumId,
      "fieldName": "facility-safety-stock",
      "fieldValue": actionValue ? actionValue : 0
    }]
  } else {
    condition = [{
      ruleId,
      actionTypeEnumId,
      "fieldName": actionTypeEnumId === "ATP_ALLOW_PICKUP" ? "allow-pickup" : "allow-brokering",
      "fieldValue": actionValue ? "Y" : "N"
    }]
  }
  return condition
}

const generateRuleConditions = (ruleId: string, conditionTypeEnumId: string, appliedFilters: any, selectedFac: any) => {
  const conditions = [];

  if(conditionTypeEnumId === "ENTCT_ATP_FACILITIES") {
    console.log('entered');
    
    conditions.push({
      "ruleId": ruleId,
      conditionTypeEnumId,
      "fieldName": "facilities",
      "operator": "in",
      "fieldValue": selectedFac.length ? selectedFac.join(",") : "",
      "multiValued": "Y"
    })
  } else {
    const includedFacilityGroupIds = selectedFac.included.map((group: any) => group.facilityGroupId)  
    console.log(includedFacilityGroupIds);
    
    if(includedFacilityGroupIds.length) {
      conditions.push({
        "ruleId": ruleId,
        "conditionTypeEnumId": "ENTCT_ATP_FAC_GROUPS",
        "fieldName": "facilityGroups",
        "operator": "in",
        "fieldValue": includedFacilityGroupIds.join(","),
        "multiValued": "Y"
      })
    }
    
    const excludedFacilityGroupIds = selectedFac.excluded.map((group: any) => group.facilityGroupId)
    console.log(excludedFacilityGroupIds);
    if(excludedFacilityGroupIds.length) {
      conditions.push({
        "ruleId": ruleId,
        "conditionTypeEnumId": "ENTCT_ATP_FAC_GROUPS",
        "fieldName": "facilityGroups",
        "operator": "not-in",
        "fieldValue": excludedFacilityGroupIds.join(","),
        "multiValued": "Y"
      })
    }
  }

  Object.entries(appliedFilters).map(([type, filters]: any) => {
    Object.entries(filters as any).map(([filter, value]: any) => {
      if(value.length) {
        conditions.push({
          "ruleId": ruleId,
          "conditionTypeEnumId": "ENTCT_ATP_FILTER",
          "fieldName": filter,
          "operator": type === "included" ? "in" : "not-in",
          "fieldValue": value.join(","),
          "multiValued": "Y"
        })
      }
    })
  })

  return conditions;
}


export { doReorder, generateInternalId, generateRuleActions, generateRuleConditions, getDate, getDateAndTime, getTime, hasError, showToast, timeTillRun }