import { ActionTree } from 'vuex'
import RootState from '@/store/RootState'
import { UtilService } from '@/services/UtilService'
import { hasError } from '@/utils'
import logger from '@/logger'
import UtilState from './UtilState'
import * as types from './mutation-types'


const actions: ActionTree<UtilState, RootState> = {
  async fetchProductFeatures ({ commit, state }) {
    // const features = JSON.parse(JSON.stringify())
    const featuresByType = {} as any

    try {
      const resp = await UtilService.fetchProductFeatures()

      if(!hasError(resp)) {
        const features = resp.data
        
        features.map((feature: any) => {
          if(featuresByType[feature.featureTypeDescription]) featuresByType[feature.featureTypeDescription].push(feature)
          else featuresByType[feature.featureTypeDescription] = [feature]
        })

        commit(types.UTIL_FEATURES_BY_TYPE_UPDATED, featuresByType)
      } else {
        throw resp.data
      }
    } catch (err: any) {
      logger.error(err)
    }
  },

  async fetchProductTags ({ commit, state }) {
    const productTags = JSON.parse(JSON.stringify(state.tags))

    if(productTags.length) {
      return;
    }

    try {
      const resp = await UtilService.fetchProductTags()

      if(!hasError(resp)) {
        commit(types.UTIL_PRODUCT_TAGS_UPDATED, resp.data)
      } else {
        throw resp.data
      }
    } catch (err: any) {
      logger.error(err)
    }
  }
}

export default actions;