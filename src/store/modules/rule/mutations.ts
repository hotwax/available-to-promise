import { MutationTree } from 'vuex'
import RuleState from './RuleState';
import * as types from './mutation-types'

const mutations: MutationTree <RuleState> = {
  [types.RULE_RULES_UPDATED] (state, payload) {
    state.rules.list = payload.list;
    state.rules.total = payload.total;
  },
  [types.RULE_GROUP_UPDATED] (state, payload) {
    state.ruleGroup = payload;
  },
  [types.RULE_IS_REORDER_ACTIVE_UPDATED] (state, payload) {
    state.isReorderActive = payload;
  },
  [types.RULE_CLEARED](state) {
    state.rules = {
      list: [],
      total: ''
    },
    state.ruleGroup = {},
    state.isReorderActive= false
  },
}
export default mutations;