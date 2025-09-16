import api from '@/api';
import logger from '@/logger';
import { hasError } from '@/utils';

const fetchRuleGroup = async (payload: any): Promise <any>  => {
  return api({
    url: "available-to-promise/ruleGroups",
    method: "GET",
    params: payload
  });
}

const fetchRules = async (payload: any): Promise <any>  => {
  return api({
    url: "available-to-promise/decisionRules",
    method: "GET",
    params: payload
  });
}

const createRuleGroup = async (payload: any): Promise <any>  => {
  let ruleGroup = {}
  try {
    const resp = await api({
      url: "available-to-promise/ruleGroups",
      method: "POST",
      data: payload
    }) as any;

    if(!hasError(resp)) {
      ruleGroup = resp.data;
    } else {
      throw resp.data
    }
  } catch(err: any) {
    logger.error(err)
    return Promise.reject("Failed to create rule group");
  }
  return Promise.resolve(ruleGroup);
}

const createRule = async (payload: any): Promise <any>  => {
  let rule = {}
  try {
    const resp = await api({
      url: "available-to-promise/decisionRules",
      method: "POST",
      data: payload
    }) as any;
    
    if(!hasError(resp)) {
      rule = resp.data;
    } else {
      throw resp.data
    }
  } catch(err: any) {
    logger.error(err)
    return Promise.reject("Failed to create rule");
  }
  return Promise.resolve(rule);
}

const updateRule = async (payload: any, ruleId: string): Promise <any>  => {
  try {
    const resp = await api({
      url: `available-to-promise/decisionRules/${ruleId}`,
      method: "POST",
      data: payload
    }) as any;
    
    if(!hasError(resp)) {
      return Promise.resolve(resp)
    } else {
      throw resp.data
    }
  } catch(err: any) {
    return Promise.reject(err ? err : "Failed to update rule");
  }
}

const fetchRuleScheduleInformation = async (ruleGroupId: string): Promise<any> => {
  return api({
    url: `available-to-promise/ruleGroups/${ruleGroupId}/schedule`,
    method: "GET"
  });
}

const scheduleRuleGroup = async (payload: any): Promise<any> => {
  return api({
    url: `available-to-promise/ruleGroups/${payload.ruleGroupId}/schedule`,
    method: "POST",
    data: payload
  });
}

const fetchRuleGroupHistory = async (payload: any): Promise<any> => {
  return api({
    url: `admin/serviceJobs/${payload.jobName}/runs`,
    method: "GET",
    params: payload
  });
}

const runNow = async (ruleGroupId: any): Promise<any> => {
  return api({
    url: `available-to-promise/ruleGroups/${ruleGroupId}/runNow`,
    method: "POST"
  });
}

const deleteCondition = async (payload: any): Promise<any> => {
  return api({
    url: `available-to-promise/decisionRules/${payload.ruleId}/conditions`,
    method: "delete",
    data: payload
  });
}

export const RuleService = {
  createRule,
  createRuleGroup,
  deleteCondition,
  fetchRuleGroup,
  fetchRuleGroupHistory,
  fetchRules,
  fetchRuleScheduleInformation,
  runNow,
  scheduleRuleGroup,
  updateRule
}