import { GetterTree } from 'vuex'
import JobState from './JobState'
import RootState from '../../RootState'
import parser from 'boolean-parser'

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
    getTagsAndOperator: (state, getters) => (id: string, type: string): any => {
      const tagString = getters.getTags(id, type);
      if(tagString){
        let tags = parser.removeOuterBrackets(tagString.trim());
        const operator = tagString.indexOf(' AND ') > 0 ? 'AND' : 'OR'
        //Need to parse as it is returned in json format
        tags = tags.split(` ${operator} `).map((tag: any) => JSON.parse(tag))
        return { tags, operator }
      } 
      return {};
    },
    getTags: (state) => (id: string, type: string): any => {
      const thresholdRule = state.thresholdRules[id];
      if (!thresholdRule) return "";
      const tags = thresholdRule.json.filter.find((filter: any) => filter.startsWith(type === 'included' ? 'tags:' : '-tags:')) 
      return tags ? tags.substring(tags.indexOf(":") + 1) : "";
    },
    getProductQuery: (state) => (id: string): any => {
      return state.thresholdRules[id];
    }
  }

  export default getters;