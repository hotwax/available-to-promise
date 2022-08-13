import api from '@/api';

const fetchProducts = async (query: any): Promise <any>  => {
  return api({
   // TODO: We can replace this with any API
    url: "searchProducts", 
    method: "post",
    data: query,
    cache: true
  });
}

const getProducts = async (payload: any): Promise<any> => {
  return api({
    url: "/solr-query",
    method: "POST",
    data: payload
  })
}

const updateSearchPreference = async (payload: any): Promise<any> => {
  return api({
    url: "service/updateSearchPreference",
    method: "post",
    data: payload
  });
}

const createSearchPreference = async (payload: any): Promise<any> => {
  return api({
    url: "service/createSearchPreference",
    method: "post",
    data: payload
  });
}

const fetchFacets = async (payload: any): Promise<any> => {
  return api({
    url: "/AutoCompleteSolrFacet",
    method: "get",
    params: payload
  });
}

export const ProductService = {
  fetchFacets,
  createSearchPreference,
  fetchProducts,
  getProducts,
  updateSearchPreference
}