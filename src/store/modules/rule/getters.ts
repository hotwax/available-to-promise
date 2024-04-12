import { GetterTree } from 'vuex'
import RootState from '@/store/RootState'
import RuleState from './RuleState';

const getters: GetterTree <RuleState, RootState> = {
  getRules (state) {
    return state.rules;
  },
  getRuleGroup (state) {
    return state.ruleGroup
  }
}
export default getters;