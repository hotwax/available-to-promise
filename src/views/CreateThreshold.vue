<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/threshold" />
        <ion-title>{{ translate("New threshold rule") }}</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <section>
        <div class="rule-config">
          <ion-card>
            <ion-card-header>
              <ion-card-title>{{ translate("Rule Configuration") }}</ion-card-title>
            </ion-card-header>

            <div class="rule-inputs ion-padding">
              <ion-item>
                <ion-input :label="translate('Name')" />
              </ion-item>
              <ion-item>
                <ion-input :label="translate('Threshold')" />
              </ion-item>
            </div>
          </ion-card>
        </div>
      </section>
      <div class="section-header">
        <h1>{{ translate("Channels") }}</h1>
      </div>

      <section> 
        <ion-card >
          <ion-card-header>
            <div>
              <ion-card-title>{{ "Facitlity Name" }}</ion-card-title>
              <ion-card-subtitle>{{ "Facility ID" }}</ion-card-subtitle>
            </div>
            <ion-checkbox />
          </ion-card-header>
        </ion-card>
      </section>

      <ProductFilters />
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button>
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCheckbox, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { saveOutline } from 'ionicons/icons'
import { translate } from "@hotwax/dxp-components";
import ProductFilters from '@/components/ProductFilters.vue';
</script>

<style scoped>
ion-card-header {
  display: flex;
  flex-direction: row ;
  justify-content: space-between;
  align-items: center;
}

ion-card-header > ion-checkbox {
  flex-shrink: 0;
}
</style>