<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal">
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Archived Rules") }}</ion-title>
    </ion-toolbar>
  </ion-header>
  
  <ion-content>
    <ion-list>
      <ion-item v-for="rule in rules" :key="rule.ruleId">
        <ion-label>{{ rule.ruleName }}</ion-label>
        <ion-note slot="end" v-if="rule.isArchived">{{ translate("Unarchived") }}</ion-note>
        <ion-button slot="end" v-else fill="outline" color="medium" @click="unarchiveRule(rule)">{{ translate("Unarchive") }}</ion-button>
      </ion-item>
    </ion-list>
    <p class="empty-state" v-if="!rules.length">
      {{ translate("No archived rules") }}
    </p>
  </ion-content>

  <ion-fab vertical="bottom" horizontal="end" slot="fixed">
    <ion-fab-button :disabled="!rulesToUnarchive?.length" @click="save()">
      <ion-icon :icon="saveOutline" />
    </ion-fab-button>
  </ion-fab>
</template>

<script setup lang="ts">
import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonNote, IonTitle, IonToolbar, modalController } from '@ionic/vue';
import { translate } from '@hotwax/dxp-components';
import { defineProps, onMounted, ref } from 'vue';
import { closeOutline, saveOutline } from "ionicons/icons";

const props = defineProps(["archivedRules"])

const rulesToUnarchive = ref([]) as any;
const rules = ref([]) as any;

onMounted(() => {
  rules.value = JSON.parse(JSON.stringify(props.archivedRules))
})

function closeModal() {
  modalController.dismiss();
}

function unarchiveRule(currentRule: any) {
  rulesToUnarchive.value.push(currentRule);
  currentRule.isArchived = true;
}

function save() {
  modalController.dismiss({ dismissed: true, rulesToUnarchive: rulesToUnarchive.value });
}
</script>

<style scoped>
ion-content {
  --padding-bottom: 80px;
}
</style>