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
      throw new Error("No rule group found")
    }

    commit(types.RULE_GROUP_UPDATED, ruleGroup);
    return ruleGroup
  },

  async fetchRules({ commit, dispatch }, payload) {
    let rules = [] as any;

    try {
      const ruleGroup = await dispatch('fetchRuleGroup', payload)

      const resp = await RuleService.fetchRules(ruleGroup.groupId)

      if(!hasError(resp)) {
        rules = resp.data;
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