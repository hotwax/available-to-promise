import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import * as types from './mutation-types'
import RuleState from './RuleState'
import { RuleService } from '@/services/RuleService'
import { hasError } from '@/utils'
import logger from '@/logger'


const actions: ActionTree<RuleState, RootState> = {
  async fetchRuleGroup({ commit }, payload) {
    let ruleGroup = {} as any;

    try {
      const resp = await RuleService.fetchRuleGroup(payload)
      if(!hasError(resp) && resp.data.length) {
        ruleGroup = resp.data[0]
      } else {
        throw resp.data;
      }
    } catch(err: any) {
      logger.error("No rule group found");
    }
    
    commit(types.RULE_GROUP_UPDATED, ruleGroup);
    return ruleGroup
  },

  async fetchRules({ commit, dispatch }, payload) {
    const rules = [] as any;

    try {
      const ruleGroup = await dispatch('fetchRuleGroup', payload)

      if(!ruleGroup.ruleGroupId) {
        throw new Error("No rule founds")
      }
      const resp = await RuleService.fetchRules(ruleGroup.ruleGroupId)

      if(!hasError(resp)) {
        const responses = await Promise.allSettled(
          resp.data.map((rule: any) => RuleService.fetchRulesActionsAndConditions(rule.ruleId))
        )

        const hasFailedResponse = responses.some((response: any) => hasError(response.value))
        if (hasFailedResponse) {
          logger.error('Failed to fetch some rules')
        }

        responses.map((response: any) => {
          if(response.status === 'fulfilled') {
            rules.push(response.value)
          }
        })
      } else {
        throw resp.data
      }
    } catch(err: any) {
      logger.error(err);
    }

    commit(types.RULE_RULES_UPDATED, rules);
  },
}

export default actions;