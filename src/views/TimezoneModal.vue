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
      <ion-searchbar @ionFocus="selectSearchBarText($event)" :placeholder="translate('Search time zones')"  v-model="queryString" v-on:keyup.enter="queryString = $event.target.value; findTimeZone()" @keydown="preventSpecialCharacters($event)"/>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-radio-group  value="rd" v-model="timeZoneId">
      <ion-list v-if="showBrowserTimeZone">
          <ion-list-header>{{ translate("Browser time zone") }}</ion-list-header>
          <ion-item>
            <ion-radio label-placement="end" justify="start" :value="browserTimeZone.id">
              <ion-label>
                {{ browserTimeZone.label }} ({{ browserTimeZone.id }})
                <p v-if="showDateTime">{{ getCurrentTime(browserTimeZone.id, dateTimeFormat) }}</p>
              </ion-label>
            </ion-radio>
          </ion-item>
      </ion-list>
      <ion-list>
        <ion-list-header v-if="showBrowserTimeZone">{{ translate("Select a different time zone") }}</ion-list-header>
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
          <ion-item :key="timeZone.id" v-for="timeZone in filteredTimeZones">
            <ion-radio :value="timeZone.id" label-placement="end" justify="start">
              <ion-label>
                {{ timeZone.label }} ({{ timeZone.id }})
                <p v-if="showDateTime">{{ getCurrentTime(timeZone.id, dateTimeFormat) }}</p>
              </ion-label>
            </ion-radio>
          </ion-item>
        </div>
      </ion-list>
    </ion-radio-group>
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
  IonRadioGroup,
  IonRadio,
  IonLabel,
  IonList,
  IonListHeader,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToolbar,
  modalController,
} from "@ionic/vue";
import { onBeforeMount, ref ,computed,defineProps } from "vue";
import { closeOutline, saveOutline } from "ionicons/icons";
import { useStore } from "@/store";
import { getCurrentTime } from "@/utils";
import { translate,useUserStore } from '@hotwax/dxp-components';

const store = useStore();
const userStore=useUserStore()
let queryString = ref("")
let filteredTimeZones = ref<any[]>([])
let timeZones = computed(() => userStore.getTimeZones)
let timeZoneId = ref("")
let isLoading = ref(true)
const userProfile = computed(() => store.getters["user/getUserProfile"])
const browserTimeZone = ref({
  label: '',
  id: Intl.DateTimeFormat().resolvedOptions().timeZone
})

const props = defineProps({
  showBrowserTimeZone: {
    type: Boolean,
    default: true
  },
  showDateTime: {
    type: Boolean,
    default: true
  },
  dateTimeFormat: {
    type: String,
    default: 't ZZZZ'
  }
});

onBeforeMount(async() => {
  isLoading.value = true;
  await userStore.getAvailableTimeZones();
  if(userProfile.value && userProfile.value.timeZone) {
    userStore.currentTimeZoneId = userProfile.value.timeZone
    timeZoneId.value = userProfile.value.timeZone
  }

  if(props.showBrowserTimeZone) {
    browserTimeZone.value.label = timeZones.value.find((timeZone: any) => timeZone.id.toLowerCase().match(browserTimeZone.value.id.toLowerCase()))?.label
  }
  findTimeZone();
  isLoading.value = false;
})

function closeModal() {
  modalController.dismiss({ dismissed: true });
}

function findTimeZone() { 
  const searchedString = queryString.value.toLowerCase();
  filteredTimeZones.value = timeZones.value.filter((timeZone: any) => timeZone.id.toLowerCase().match(searchedString) || timeZone.label.toLowerCase().match(searchedString));

  if(props.showBrowserTimeZone) {
    filteredTimeZones.value = filteredTimeZones.value.filter((timeZone: any) => !timeZone.id.toLowerCase().match(browserTimeZone.value.id.toLowerCase()));
  }
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

function preventSpecialCharacters($event: any) {
  // Searching special characters fails the API, hence, they must be omitted
  if(/[`!@#$%^&*()_+\-=\\|,.<>?~]/.test($event.key)) $event.preventDefault();
}
</script>
