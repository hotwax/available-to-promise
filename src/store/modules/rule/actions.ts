import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import * as types from './mutation-types'
import RuleState from './RuleState'
import { RuleService } from '@/services/RuleService'
import { hasError } from '@/utils'
import logger from '@/logger'
import store from '@/store'


const actions: ActionTree<RuleState, RootState> = {
  async fetchRuleGroup({ commit }, payload) {
    const productStore = await store.getters['user/getCurrentEComStore']
    let ruleGroup = {} as any;
    let resp;

    try {
      resp = await RuleService.fetchRuleGroup({ ...payload, productStoreId: productStore.productStoreId, statusId: "ATP_RG_ACTIVE" })

      if(!hasError(resp) && resp.data.length) {
        ruleGroup = resp.data[0]

        resp = await RuleService.fetchRuleScheduleInformation(ruleGroup.ruleGroupId)
        if(!hasError(resp) && resp.data?.schedule) {
          ruleGroup.schedule = resp.data.schedule
        }
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
    let rules = [] as any;
    let archivedRules = [] as any;
    let ruleGroupId = payload.ruleGroupId;

    try {
      if(!ruleGroupId) {
        const ruleGroup = await dispatch('fetchRuleGroup', payload)
        ruleGroupId = ruleGroup.ruleGroupId
      }

      if(!ruleGroupId) {
        throw new Error("No rule founds")
        return;
      }

      const resp = await RuleService.fetchRules({ 
        ruleGroupId,
        "statusId": ["ATP_RULE_ACTIVE", "ATP_RULE_ARCHIVED"],
        "statusId_op": "in",
        "orderByField": "sequenceNum"
      })

      if(!hasError(resp)) {
        rules = resp.data.filter((rule: any) => rule.statusId === "ATP_RULE_ACTIVE")
        archivedRules = resp.data.filter((rule: any) => rule.statusId === "ATP_RULE_ARCHIVED")
      } else {
        throw resp.data
      }
    } catch(err: any) {
      logger.error(err);
    }

    commit(types.RULE_RULES_UPDATED, { list: rules, total: rules.length});
    commit(types.RULE_ARCHIVED_RULES_UPDATED, archivedRules);
  },

  updateRuleData({ commit, state }, payload) {
    const rules = JSON.parse(JSON.stringify(state.rules.list))

    const index = rules.findIndex((rule: any) => rule.ruleId === payload.rule.ruleId);
    // If index is found, replace the object
    if (index !== -1) {
      rules.splice(index, 1, payload.rule);
    }
    commit(types.RULE_RULES_UPDATED, { list: rules, total: state.rules.total});
  },

  updateRuleGroup({ commit }, payload) {
    commit(types.RULE_GROUP_UPDATED, payload);
  },

  updateRules({commit}, payload) {
    commit(types.RULE_RULES_UPDATED, { list: payload.rules, total: payload.rules.length});
  },

  archiveRule({ commit, state }, { rule }) {
    const rules = JSON.parse(JSON.stringify(state.rules.list))

    const index = rules.findIndex((currRule: any) => currRule.ruleId === rule.ruleId);
    if (index !== -1) {
      rules.splice(index, 1);
    }
    commit(types.RULE_RULES_UPDATED, { list: rules, total: state.rules.total - 1 });
  },

  async clearRuleState({ commit }) {
    commit(types.RULE_CLEARED)
  },

  async updateIsReorderActive({ commit }, payload) {
    commit(types.RULE_REORDER_ACTIVE_UPDATED, payload)
  },
}

export default actions;