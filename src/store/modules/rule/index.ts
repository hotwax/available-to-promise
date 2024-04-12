import actions from './actions'
import getters from './getters'
import mutations from './mutations'
import { Module } from 'vuex'
import RootState from '@/store/RootState'
import RuleState from './RuleState'

const userModule: Module<RuleState, RootState> = {
  namespaced: true,
  state: {
    rules: [],
    ruleGroup: {}
  },
  getters,
  actions,
  mutations,
}

export default userModule;