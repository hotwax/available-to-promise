import { GetterTree } from 'vuex'
import JobState from './JobState'
import RootState from '../../RootState'

const getters: GetterTree <JobState, RootState> = {
    getJobStatus: (state) => (id: string): any  => {
      return state.cached[id] ? (state.cached[id].status === "SERVICE_DRAFT" ? state.cached[id].status : state.cached[id].frequency) : 'SERVICE_DRAFT';
    },
    getPendingJobs (state){
      return state.pending.list;
    },
    getTemporalExpr: (state) => (id: string): any  => {
      return state.temporalExp[id];
    },
    getJob: (state) => (id: string): any => {
      return state.cached[id]
    },
    getEnumDescription: (state) => (id: string): any => {
      return state.enumIds[id]?.description;
    },
    getEnumName: (state) => (id: string): any => {
      return state.enumIds[id] ? state.enumIds[id]?.enumName : '';
    },
    isPendingJobsScrollable: (state) => {
      return state.pending.list?.length > 0 && state.pending.list?.length < state.pending.total
    },
    isRunningJobsScrollable: (state) => {
      return state.running.list?.length > 0 && state.running.list?.length < state.running.total
    },
    getRunningJobs (state){
      return state.running.list;
    },
    isHistoryJobsScrollable: (state) => {
      return state.history.list?.length > 0 && state.history.list?.length < state.history.total
    },
    getJobHistory (state){
      return state.history.list;
    },
    getJobs: (state) => {
      return state.cached;
    },
    getTagsIncluded: (state) => (id: string): any => {
      const thresholdRule = state.thresholdRules[id];

      if (!thresholdRule) return "";
      const tagsIncluded = thresholdRule.json.filter.find((filter: any) => filter.startsWith("tags:"))
      if (!tagsIncluded) return ""
      return tagsIncluded.substring(tagsIncluded.indexOf(":") + 1)
    },
    getTagsExcluded: (state) => (id: string): any => {
      const thresholdRule = state.thresholdRules[id];
      if (!thresholdRule) return "";
      const tagsExcluded = thresholdRule.json.filter.find((filter: any) => filter.startsWith("-tags:"))
      if (!tagsExcluded) return ""
      return tagsExcluded.substring(tagsExcluded.indexOf(":") + 1)
    },
  }

  export default getters;