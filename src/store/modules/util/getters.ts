import { GetterTree } from "vuex";
import UtilState from "./UtilState";
import RootState from "@/store/RootState";

const getters: GetterTree<UtilState, RootState> = {
  getFacilityLocations(state) {
    return state.facilityLocations.list;
  },
  isScrollable: (state) => {
    return state.facilityLocations.list?.length > 0 && state.facilityLocations.list?.length < state.facilityLocations.total
  },
};

export default getters;