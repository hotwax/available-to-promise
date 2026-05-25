import { defineStore } from 'pinia'
import { api, logger, commonUtil } from '@common'
import { useProductStore } from '@/store/productStore'

export interface RuleState {
  rules: {
    list: any[];
    total: number;
  };
  ruleGroup: any;
  isReorderActive: boolean;
  archivedRules: any[];
}

export const useRuleStore = defineStore('rule', {
  state: (): RuleState => ({
    rules: {
      list: [],
      total: 0
    },
    ruleGroup: {},
    isReorderActive: false,
    archivedRules: []
  }),
  getters: {
    getRules: (state) => state.rules.list,
    getTotalRulesCount: (state) => state.rules.total,
    getRuleGroup: (state) => state.ruleGroup,
    isReorderActiveState: (state) => state.isReorderActive,
    getArchivedRules: (state) => state.archivedRules
  },
  actions: {
    async fetchRuleGroup(payload: any) {
      const productStore = useProductStore()
      let ruleGroup = {} as any;
      try {
        const resp = await api({
          url: "available-to-promise/ruleGroups",
          method: "GET",
          params: { ...payload, productStoreId: productStore.currentProductStore.productStoreId, statusId: "ATP_RG_ACTIVE" }
        }) as any;
        if (resp && !commonUtil.hasError(resp) && resp.data.length) {
          ruleGroup = resp.data[0]
          const scheduleResp = await api({
            url: `available-to-promise/ruleGroups/${ruleGroup.ruleGroupId}/schedule`,
            method: "GET"
          }) as any;
          if (scheduleResp && !commonUtil.hasError(scheduleResp) && scheduleResp.data?.schedule) {
            ruleGroup.schedule = scheduleResp.data.schedule
          }
        } else {
          throw resp.data;
        }
      } catch (err: any) {
        logger.error("No rule group found");
      }
      this.ruleGroup = ruleGroup;
      return ruleGroup
    },
    async fetchRules(payload: any) {
      let rules = [] as any;
      let archivedRules = [] as any;
      let ruleGroupId = payload.ruleGroupId;

      try {
        if (!ruleGroupId) {
          const ruleGroup = await this.fetchRuleGroup(payload)
          ruleGroupId = ruleGroup.ruleGroupId
        }

        if (!ruleGroupId) {
          throw new Error("No rule founds")
        }

        const resp = await api({
          url: "available-to-promise/decisionRules",
          method: "GET",
          params: {
            ruleGroupId,
            "statusId": ["ATP_RULE_ACTIVE", "ATP_RULE_ARCHIVED"],
            "statusId_op": "in",
            "orderByField": "sequenceNum"
          }
        }) as any;

        if (!commonUtil.hasError(resp)) {
          rules = resp.data.filter((rule: any) => rule.statusId === "ATP_RULE_ACTIVE")
          archivedRules = resp.data.filter((rule: any) => rule.statusId === "ATP_RULE_ARCHIVED")
        } else {
          throw resp.data
        }
      } catch (err: any) {
        logger.error(err);
      }

      this.rules = { list: rules, total: rules.length };
      this.archivedRules = archivedRules;
    },
    updateRuleData(payload: any) {
      const rules = JSON.parse(JSON.stringify(this.rules.list))
      const index = rules.findIndex((rule: any) => rule.ruleId === payload.rule.ruleId);
      if (index !== -1) {
        rules.splice(index, 1, payload.rule);
      }
      this.rules = { list: rules, total: this.rules.total };
    },
    updateRuleGroup(payload: any) {
      this.ruleGroup = payload;
    },
    updateRules(payload: any) {
      this.rules = { list: payload.rules, total: payload.rules.length };
    },
    clearRuleState() {
      this.rules = {
        list: [],
        total: 0
      };
      this.ruleGroup = {};
      this.isReorderActive = false;
      this.archivedRules = [];
    },
    updateIsReorderActive(payload: boolean) {
      this.isReorderActive = payload;
    },
    async createRule(payload: any) {
      try {
        const resp = await api({
          url: "available-to-promise/decisionRules",
          method: "POST",
          data: payload
        }) as any;
        
        if(resp && !commonUtil.hasError(resp)) {
          return resp.data;
        } else {
          throw resp.data
        }
      } catch(err: any) {
        logger.error(err)
        return Promise.reject("Failed to create rule");
      }
    },
    async createRuleGroup(payload: any) {
      try {
        const resp = await api({
          url: "available-to-promise/ruleGroups",
          method: "POST",
          data: payload
        }) as any;
    
        if(resp && !commonUtil.hasError(resp)) {
          return resp.data;
        } else {
          throw resp.data
        }
      } catch(err: any) {
        logger.error(err)
        return Promise.reject("Failed to create rule group");
      }
    },
    async deleteCondition(payload: any) {
      return await api({
        url: `available-to-promise/decisionRules/${payload.ruleId}/conditions`,
        method: "delete",
        data: payload
      });
    },
    async fetchRuleGroupHistory(payload: any) {
      return await api({
        url: `admin/serviceJobs/${payload.jobName}/runs`,
        method: "GET",
        params: payload
      });
    },
    async fetchRulesDirect(payload: any) {
      return await api({
        url: "available-to-promise/decisionRules",
        method: "GET",
        params: payload
      });
    },
    async runNow(ruleGroupId: any) {
      return await api({
        url: `available-to-promise/ruleGroups/${ruleGroupId}/runNow`,
        method: "POST"
      });
    },
    async scheduleRuleGroup(payload: any) {
      return await api({
        url: `available-to-promise/ruleGroups/${payload.ruleGroupId}/schedule`,
        method: "POST",
        data: payload
      });
    },
    async updateRuleApi(payload: any, ruleId: string) {
      try {
        const resp = await api({
          url: `available-to-promise/decisionRules/${ruleId}`,
          method: "POST",
          data: payload
        }) as any;
        
        if(resp && !commonUtil.hasError(resp)) {
          return resp;
        } else {
          throw resp.data
        }
      } catch(err: any) {
        return Promise.reject(err ? err : "Failed to update rule");
      }
    }
  }
})
