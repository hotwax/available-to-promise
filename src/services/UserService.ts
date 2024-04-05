import api, {client} from '@/api';
import store from "@/store";
import { hasError } from "@/utils";

const login = async (username: string, password: string): Promise <any> => {
  let token = ""
  try {
    const resp = await api({
      url: "login", 
      method: "post",
      data: {
        username,
        password
      }
    }) as any;

    if(!hasError(resp) && resp.data.token) {
      token = resp.data.token
    } else {
      throw "Sorry, login failed. Please try again";
    }
  } catch(err) {
    return Promise.reject("Sorry, login failed. Please try again");
  }
  return Promise.resolve(token)
}

const getUserProfile = async (token: any): Promise<any> => {
  const baseURL = store.getters["user/getBaseUrl"];
  try {
    const resp = await client({
      url: "user/profile",
      method: "GET",
      baseURL,
      headers: {
        "api_key": token,
        "Content-Type": "application/json"
      }
    });
    if(hasError(resp)) throw "Error getting user profile";
    return Promise.resolve(resp.data)
  } catch(error: any) {
    return Promise.reject(error)
  }
}

const getAvailableTimeZones = async (): Promise <any>  => {
  return api({
    url: "user/getAvailableTimeZones",
    method: "get",
    cache: true
  });
}

const setUserTimeZone = async (payload: any): Promise <any>  => {
  return api({
    url: "setUserTimeZone",
    method: "post",
    data: payload
  });
}

const getEComStores = async (token: any): Promise<any> => {
  try {
    const baseURL = store.getters["user/getBaseUrl"];
    const resp = await client({
      url: "user/productStore",
      method: "GET",
      baseURL,
      headers: {
        "api_key": token,
        "Content-Type": "application/json"
      }
    });
    // Disallow login if the user is not associated with any product store
    if (hasError(resp) || resp.data.length === 0) {
      throw resp.data;
    } else {
      return Promise.resolve(resp.data);
    }
  } catch(error: any) {
    return Promise.reject(error)
  }
}

export const UserService = {
  getAvailableTimeZones,
  getEComStores,
  getUserProfile,
  login,
  setUserTimeZone
}