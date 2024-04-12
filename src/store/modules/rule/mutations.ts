import { MutationTree } from 'vuex'
import RuleState from './RuleState';
import * as types from './mutation-types'

const mutations: MutationTree <RuleState> = {
  [types.RULE_RULES_UPDATED] (state, payload) {
    state.rules = payload;
  },
  [types.RULE_GROUP_UPDATED] (state, payload) {
    state.ruleGroup = payload;
  },
}
export default mutations;