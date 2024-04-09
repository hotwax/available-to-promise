import { GetterTree } from 'vuex'
import UtilState from './UtilState'
import RootState from '@/store/RootState'

const getters: GetterTree<UtilState, RootState> = {
  getProductFeaturesByType(state) {
    return state.featuresByType
  },
  getProductTags(state) {
    return state.tags
  }
}
export default getters;