<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal"> 
          <ion-icon :icon="closeOutline" slot="icon-only" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Custom frequency") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <div v-if="customFrequencies.length">
      <ion-list>
        <ion-radio-group v-model="frequencyId">
          <ion-item :key="customFrequency.tempExprId" v-for="customFrequency in customFrequencies">
            <ion-radio :value="customFrequency.tempExprId">{{ customFrequency.description }}</ion-radio>
          </ion-item>
        </ion-radio-group>
      </ion-list>
    </div>
    <div class="empty-state" v-else>
      <p>{{ translate("No frequency found.")}}</p>
    </div>
  </ion-content>

  <ion-fab vertical="bottom" horizontal="end" slot="fixed">
    <ion-fab-button :disabled="!frequencyId" @click="setFrequency()">
      <ion-icon :icon="saveOutline" />
    </ion-fab-button>
  </ion-fab>
</template>

<script setup lang="ts">
import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonList, IonRadio, IonRadioGroup, IonTitle, IonToolbar, modalController } from "@ionic/vue";
import { onMounted, ref } from "vue";
import { closeOutline, saveOutline } from "ionicons/icons";
import { translate } from "@/i18n";
import { useStore } from "vuex";

const store = useStore();

const customFrequencies = ref([]) as any;
const frequencyId = ref("");

onMounted(() => {
  findFrequencies();
})

function closeModal() {
  modalController.dismiss({ dismissed: true });
}

async function findFrequencies() {
  customFrequencies.value = await store.dispatch("channel/findTemporalExpression");
}

async function setFrequency() {
  modalController.dismiss({ dismissed: true, frequencyId: frequencyId.value });
}
</script>