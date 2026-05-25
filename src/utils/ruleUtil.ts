import { commonUtil, logger, translate } from '@common';

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

const generateRuleActions = (ruleId: string, actionTypeEnumId: string, actionValue: any, isConditionExists: boolean, ruleActions: any) => {
  if (isConditionExists) {
    const ruleAction = ruleActions.find((action: any) => action.actionTypeEnumId === actionTypeEnumId)
    if (ruleAction) {
      if (actionTypeEnumId === "ATP_THRESHOLD" || actionTypeEnumId === "ATP_SAFETY_STOCK") {
        ruleAction.fieldValue = actionValue ? actionValue : 0;
      } else {
        ruleAction.fieldValue = actionValue ? "Y" : "N"
      }
      return [ruleAction];
    }
  }

  let condition;
  if (actionTypeEnumId === "ATP_THRESHOLD" || actionTypeEnumId === "ATP_SAFETY_STOCK") {
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

const generateRuleConditions = (ruleId: string, conditionTypeEnumId: string, appliedFilters: any, selectedFac: any, areAllSelected: boolean, appliedFiltersOperator?: any) => {
  const conditions = [];

  if (areAllSelected) {
    conditions.push({
      "ruleId": ruleId,
      conditionTypeEnumId,
      "fieldName": conditionTypeEnumId === "ENTCT_ATP_FACILITIES" ? "facilityId" : "facilityGroupId",
      "operator": "in",
      "fieldValue": "ALL"
    })
  } else if (conditionTypeEnumId === "ENTCT_ATP_FACILITIES") {
    conditions.push({
      "ruleId": ruleId,
      conditionTypeEnumId,
      "fieldName": "facilityId",
      "operator": "in",
      "fieldValue": selectedFac.length ? selectedFac.join(",") : ""
    })
  } else {
    const includedFacilityGroupIds = selectedFac.included.map((group: any) => group.facilityGroupId)
    if (includedFacilityGroupIds.length) {
      conditions.push({
        "ruleId": ruleId,
        "conditionTypeEnumId": "ENTCT_ATP_FAC_GROUPS",
        "fieldName": "facilityGroupId",
        "operator": "in",
        "fieldValue": includedFacilityGroupIds.join(",")
      })
    }

    const excludedFacilityGroupIds = selectedFac.excluded.map((group: any) => group.facilityGroupId)
    if (excludedFacilityGroupIds.length) {
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
      if (value.length) {
        conditions.push({
          "ruleId": ruleId,
          "conditionTypeEnumId": "ENTCT_ATP_FILTER",
          "fieldName": filter,
          "operator": type === "included" ? "contains" : "not-contains",
          "joinOperator": appliedFiltersOperator?.[type]?.[filter] || "",
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

  if (message) {
    logger.warn(warning);
    commonUtil.showToast(translate(message));
    return true;
  }
  return false;
}

export const ruleUtil = {
  doReorder,
  findRulesDiff,
  generateRuleActions,
  generateRuleConditions,
  hasJobDataError
}
