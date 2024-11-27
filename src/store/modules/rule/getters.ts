import { GetterTree } from 'vuex'
import RootState from '@/store/RootState'
import RuleState from './RuleState';

const getters: GetterTree <RuleState, RootState> = {
  getRules (state) {
    return state.rules.list;
  },
  getTotalRulesCount (state) {
    return state.rules.total;
  },
  getRuleGroup (state) {
    return state.ruleGroup
  },
  isReorderActive (state) {
    return state.isReorderActive
  },
  getArchivedRules (state) {
    return state.archivedRules
  }
}
export default getters;