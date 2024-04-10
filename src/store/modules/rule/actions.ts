import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import * as types from './mutation-types'
import RuleState from './RuleState'
import { RuleService } from '@/services/RuleService'
import { hasError } from '@/utils'
import logger from '@/logger'


const actions: ActionTree<RuleState, RootState> = {
  async fetchRuleGroup({ commit }, ruleGroupId) {
    try {
      const resp = await RuleService.fetchRuleGroup(ruleGroupId)

      if(!hasError(resp)) {
        console.log(resp);
        
      } else {
        throw resp.data;
      }
    } catch(err: any) {
      logger.error(err);
    }
  },
}

export default actions;