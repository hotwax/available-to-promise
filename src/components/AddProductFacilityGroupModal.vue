<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal">
          <ion-icon slot="icon-only" :icon="arrowBackOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ type === "included" ? translate("Include facility groups") : translate("Exclude facility groups") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-list>
      <ion-item v-for="group in facilityGroups" :key="group.facilityGroupId"  @click="updateSelectedGroups(group)">
        <ion-label v-if="isAlreadyApplied(group.facilityGroupId)">{{ group.facilityGroupName }}</ion-label>
        <ion-checkbox v-if="!isAlreadyApplied(group.facilityGroupId)" :checked="isAlreadySelected(group.facilityGroupId)">
          {{ group.facilityGroupName }}
        </ion-checkbox>
        <ion-note v-else slot="end" color="danger">{{ type === 'included' ? translate("excluded") : translate("included") }}</ion-note>
      </ion-item>
    </ion-list>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="saveFacilityGroups()">
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-content>
</template>

<script setup lang="ts">
import { computed, defineProps, onMounted, ref } from "vue";
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { arrowBackOutline, saveOutline } from 'ionicons/icons';
import { useStore } from "vuex";
import { translate } from "@/i18n";

const selectedGroups = ref([]) as any;

const props = defineProps(["selectedFacilityGroups", "type"]);
const store = useStore();

const facilityGroups = computed(() => store.getters["util/getFacilityGroups"])

onMounted(() => {
  selectedGroups.value = JSON.parse(JSON.stringify(props.selectedFacilityGroups[props.type]))
})

function closeModal() {
  modalController.dismiss({ dismissed: true, selectedGroups: selectedGroups.value });
}

function isAlreadySelected(id: any) {
  return selectedGroups.value.some((group: any) => group.facilityGroupId === id)
}

function updateSelectedGroups(selectedGroup: any) {
  const currentGroup = selectedGroups.value.find((group: any) => group.facilityGroupId === selectedGroup.facilityGroupId)

  if(currentGroup?.facilityGroupId) {
    selectedGroups.value = selectedGroups.value.filter((group: any) => group.facilityGroupId !== selectedGroup.facilityGroupId)
  } else {
    selectedGroups.value.push(selectedGroup)
  }
}

function isAlreadyApplied(value: string) {
  const type = props.type === 'included' ? 'excluded' : 'included'
  return props.selectedFacilityGroups[type].some((group: any) => group.facilityGroupId === value)
}

function saveFacilityGroups() {
  modalController.dismiss({ dismissed: true, selectedGroups: selectedGroups.value })
}

</script>

<style scoped>
  ion-content {
    --padding-bottom: 80px;
  }
</style>