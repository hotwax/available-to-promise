import api from '@/api';

const fetchRuleGroup = async (payload: any): Promise <any>  => {
  return api({
    url: `ruleGroups`,
    method: "GET",
    data: payload
  });
}

const fetchRules = async (ruleGroupId: any): Promise <any>  => {
  return api({
    url: `ruleGroups/${ruleGroupId}/rules`,
    method: "GET"
  });
}

export const RuleService = {
  fetchRuleGroup,
  fetchRules
}