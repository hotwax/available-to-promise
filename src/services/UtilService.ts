import api, {client} from '@/api';

const fetchProductFeatures = async (): Promise <any>  => {
  return api({
    url: "products/features",
    method: "get",
    cache: true
  });
}

const fetchProductTags = async (): Promise <any>  => {
  return api({
    url: "products/10000/tags",
    method: "get",
    cache: true
  });
}

export const UtilService = {
  fetchProductFeatures,
  fetchProductTags
}