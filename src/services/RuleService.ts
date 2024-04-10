import api, {client} from '@/api';

const fetchRuleGroup = async (payload: any): Promise <any>  => {
  return api({
    url: `ruleGroups/${payload.ruleGroupId}`,
    method: "GET"
  });
}

export const RuleService = {
  fetchRuleGroup
}