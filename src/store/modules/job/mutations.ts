import { MutationTree } from 'vuex'
import JobState from './JobState'
import * as types from './mutation-types'
import logger from "@/logger";

const mutations: MutationTree <JobState> = {
    [types.JOB_PENDING_UPDATED] (state, payload) {
        state.pending.list = payload.jobs;
        state.pending.total = payload.total;
    },
    [types.JOB_RUNNING_UPDATED] (state, payload) {
        state.running.list = payload.jobs;
        state.running.total = payload.total;
    },
    [types.JOB_HISTORY_UPDATED] (state, payload) {
        state.history.list = payload.jobs;
        state.history.total = payload.total;
    },
    [types.JOB_TEMPORAL_EXPRESSION_UPDATED] (state, temporalExpressions) {
        if(temporalExpressions){
            temporalExpressions.forEach((temporalExpression: any) => {
              state.temporalExp[temporalExpression.tempExprId] = temporalExpression;
            })
        }
    },
    [types.JOB_THRESHOLD_RULES_UPDATED] (state, thresholdRules) {
        if(thresholdRules){
            state.thresholdRules = thresholdRules.reduce((thresholdRules: any, thresholdRule: any) => {
                // Try catch to handle when parsing fails
                try {
                    thresholdRules[thresholdRule.searchPrefId] = JSON.parse(thresholdRule.searchPrefValue);
                } catch(err) {
                    logger.error(err);
                }
              return thresholdRules;
            }, state.thresholdRules)
        }
    },
    [types.JOB_DESCRIPTION_UPDATED] (state, enums) {
        if (enums) {
            enums.forEach((enumInfo: any) => {
              state.enumIds[enumInfo.enumId] = enumInfo
            });
        }
    },
    [types.JOB_THRESHOLD_RULE_REMOVED] (state, id) {
        if(id) {
            delete state.thresholdRules[id]
        }
    },
    [types.JOB_CURRENT_UPDATED] (state, payload){
        state.current = payload
    },
}
export default mutations;