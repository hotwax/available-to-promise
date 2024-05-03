<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal"> 
          <ion-icon :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Select time zone") }}</ion-title>
    </ion-toolbar>
    <ion-toolbar>
      <ion-searchbar @ionFocus="selectSearchBarText($event)" :placeholder="translate('Search time zones')"  v-model="queryString" v-on:keyup.enter="queryString = $event.target.value; findTimeZone()" />
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <div class="empty-state" v-if="isLoading">
      <ion-item lines="none">
        <ion-spinner name="crescent" slot="start" />
        {{ translate("Fetching time zones") }}
      </ion-item>
    </div>
    <div class="empty-state" v-else-if="!filteredTimeZones.length">
      <p>{{ translate("No time zone found") }}</p>
    </div>

    <!-- Timezones -->
    <div v-else>
      <ion-list>
        <ion-radio-group value="rd" v-model="timeZoneId">
          <ion-item :key="timeZone.id" v-for="timeZone in filteredTimeZones">
            <ion-label>{{ timeZone.label }} ({{ timeZone.id }})</ion-label>
            <ion-radio :value="timeZone.id" slot="start" />
          </ion-item>
        </ion-radio-group>
      </ion-list>
    </div>
    
    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button :disabled="!timeZoneId" @click="setUserTimeZone">
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-content>
</template>

<script setup lang="ts">
import { 
  IonButtons,
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonItem,
  IonIcon,
  IonLabel,
  IonRadioGroup,
  IonRadio,
  IonList,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToolbar,
  modalController,
} from "@ionic/vue";
import { onBeforeMount, ref } from "vue";
import { saveOutline } from "ionicons/icons";
import { useStore } from "@/store";
import { UserService } from "@/services/UserService";
import { hasError } from "@/utils"
import { DateTime } from "luxon";
import { translate } from '@hotwax/dxp-components';

const store = useStore();
let queryString = ref("")
let filteredTimeZones = ref([])
let timeZones = ref([])
let timeZoneId = ref("")
let isLoading = ref(true)

onBeforeMount(() => {
  getAvailableTimeZones();
})

function closeModal() {
  modalController.dismiss({ dismissed: true });
}

function escapeRegExp(text: string) {
  //TODO Handle it in a better way
  // Currently when the user types special character as it part of Regex expressions it breaks the code
  // so removed the characters for now
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

function findTimeZone() { 
  const regularExp = new RegExp(`${escapeRegExp(queryString.value)}`, "i");
  filteredTimeZones.value = timeZones.value.filter((timeZone: any) => {
    return regularExp.test(timeZone.id) || regularExp.test(timeZone.label);
  });
}

function getAvailableTimeZones() {
  UserService.getAvailableTimeZones().then((resp: any) => {
    if (resp.status === 200 && !hasError(resp)) {
      timeZones.value = resp.data.timeZones.filter((timeZone: any) => {
        return DateTime.local().setZone(timeZone.id).isValid;
      });
      findTimeZone();
    }
    isLoading.value = false;
  })
}

function selectSearchBarText(event: any) {
  event.target.getInputElement().then((element: any) => {
    element.select();
  })
}

async function setUserTimeZone() {
  return store.dispatch("user/setUserTimeZone", {
    "tzId": timeZoneId.value
  }).then(() => {
    closeModal()
  })
}
</script>
