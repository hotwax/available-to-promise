<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/" />
        <ion-title>{{ $t("Upload CSV") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="upload-csv">
        <ion-item>
          <ion-label>{{ $t("Store list") }}</ion-label>
          <ion-input :placeholder="$t('Select CSV')" />
          <ion-button fill="outline">{{ $t("Upload") }}</ion-button>
        </ion-item>

        <ion-item lines="none">
          <ion-label class="ion-text-wrap">{{ $t("Select the column index for the following information in the uploaded CSV") }}</ion-label>
        </ion-item>
        <ion-item>
          <ion-label>{{ $t("Store ID column") }}</ion-label>
          <ion-select :placeholder="$t('Select')">
            <ion-select-option>1234</ion-select-option>
            <ion-select-option>5678</ion-select-option>
            <ion-select-option>9012</ion-select-option>
          </ion-select>
        </ion-item>
         <ion-item lines="none">
          <ion-label>{{ $t("Store group column (optional)") }}</ion-label>
          <ion-select :placeholder="$t('Select')">
            <ion-select-option>1234</ion-select-option>
            <ion-select-option>5678</ion-select-option>
            <ion-select-option>9012</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-button expand="block" size="large" color="medium">{{ $t("Save") }}</ion-button>

        <ion-item>
          <ion-label>50 {{ $t("stores selected") }}</ion-label>
          <ion-button slot="end" fill="outline" color="dark">
            <ion-icon slot="start" :icon="downloadOutline" />
            {{ $t("Download") }}
          </ion-button>
        </ion-item>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonBackButton,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { downloadOutline } from 'ionicons/icons';
export default defineComponent({
  name: 'SelectFacilityCSVUpload',
  components: {
    IonBackButton,
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonPage,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
  },
  setup() {
    return {
      downloadOutline,
    };
  },
});
</script>

<style scoped>
.upload-csv {
  max-width: 732px;
  margin: 0 auto;
}
</style>