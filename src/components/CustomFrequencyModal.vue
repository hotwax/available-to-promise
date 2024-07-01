<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal"> 
          <ion-icon :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate("Custom frequency") }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <!-- Empty state -->
    <div class="empty-state" v-if="customFrequencies.length === 0">
      <p>{{ translate("No frequency found")}}</p>
    </div>

    <!-- Frequencies -->
    <div v-else>
      <ion-list>
        <ion-radio-group v-model="frequencyId">
          <ion-item :key="customFrequency.tempExprId" v-for="customFrequency in customFrequencies">
            <ion-radio :value="customFrequency.tempExprId">{{ customFrequency.description }}</ion-radio>
          </ion-item>
        </ion-radio-group>
      </ion-list>
    </div>
    
    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button :disabled="!frequencyId" @click="setFrequency">
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-content>
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