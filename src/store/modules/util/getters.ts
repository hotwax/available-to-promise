import { GetterTree } from "vuex";
import UtilState from "./UtilState";
import RootState from "@/store/RootState";

const getters: GetterTree<UtilState, RootState> = {
  getFacilityLocations(state) {
    return state.facilityLocations;
  }
};

export default getters;