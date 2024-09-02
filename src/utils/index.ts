import { toastController } from '@ionic/vue';
import { DateTime } from 'luxon';
import logger from '@/logger';
import { translate } from '@hotwax/dxp-components';

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

const generateRuleConditions = (ruleId: string, conditionTypeEnumId: string, appliedFilters: any, selectedFac: any, areAllSelected: boolean) => {
  const conditions = [];

  if(areAllSelected) {
    conditions.push({
      "ruleId": ruleId,
      conditionTypeEnumId,
      "fieldName": conditionTypeEnumId === "ENTCT_ATP_FACILITIES" ? "facilityId" : "facilityGroupId",
      "operator": "in",
      "fieldValue": "ALL"
    })
  } else if(conditionTypeEnumId === "ENTCT_ATP_FACILITIES") {
    conditions.push({
      "ruleId": ruleId,
      conditionTypeEnumId,
      "fieldName": "facilityId",
      "operator": "in",
      "fieldValue": selectedFac.length ? selectedFac.join(",") : ""
    })
  } else {
    const includedFacilityGroupIds = selectedFac.included.map((group: any) => group.facilityGroupId)  
    if(includedFacilityGroupIds.length) {
      conditions.push({
        "ruleId": ruleId,
        "conditionTypeEnumId": "ENTCT_ATP_FAC_GROUPS",
        "fieldName": "facilityGroupId",
        "operator": "in",
        "fieldValue": includedFacilityGroupIds.join(",")
      })
    }
    
    const excludedFacilityGroupIds = selectedFac.excluded.map((group: any) => group.facilityGroupId)
    if(excludedFacilityGroupIds.length) {
      conditions.push({
        "ruleId": ruleId,
        "conditionTypeEnumId": "ENTCT_ATP_FAC_GROUPS",
        "fieldName": "facilityGroupId",
        "operator": "not-in",
        "fieldValue": excludedFacilityGroupIds.join(",")
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
          "operator": type === "included" ? "contains" : "not-contains",
          "fieldValue": value.join(",")
        })
      }
    })
  })

  return conditions;
}

const hasJobDataError = (job: any) => {
  let warning = '';
  let message = '';

  if (job?.serviceName === '_NA_') {
    warning = `${job.systemJobEnumId} :: This job does not have any service data configuration.`;
    message = 'This job does not have any service data configuration.';
  } else if (job?.runtimeData?._ERROR_MESSAGE_) {
    warning = `${job.systemJobEnumId}(${job.serviceName}) has runtimeData error :: ${job.runtimeData._ERROR_MESSAGE_}`;
    message = 'This job does not have any runtime data configuration.';
  }

  if(message) {
    logger.warn(warning);
    showToast(translate(message));
    return true;
  }
  return false;
}

export { doReorder, generateInternalId, generateRuleActions, generateRuleConditions, getDate, getDateAndTime, getTime, hasJobDataError, hasError, showToast, timeTillRun }