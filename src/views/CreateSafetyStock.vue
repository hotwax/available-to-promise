<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/safety-stock" />
        <ion-title>{{ translate("New safety stock rule") }}</ion-title>
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
                <ion-input :label="translate('Safety stock')" />
              </ion-item>
            </div>
          </ion-card>
        </div>
      </section>

      <div class="section-header">
        <h1>{{ translate("Facilities") }}</h1>
      </div>

      <section>
        <ion-card>
          <ion-item lines="none">
            <ion-label>{{ translate("Included") }}</ion-label>
            <ion-button fill="clear">
              {{ translate("Add") }}
              <ion-icon :icon="addCircleOutline" slot="end" />
            </ion-button>
          </ion-item>
          <ion-card-content>
            <ion-chip outline>
              {{ "Facility group name" }}
              <ion-icon :icon="closeCircle"/>
            </ion-chip>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-item lines="none"> 
            <ion-label>{{ translate("Excluded") }}</ion-label>
            <ion-button fill="clear">
              {{ translate("Add") }}
              <ion-icon :icon="addCircleOutline" slot="end" />
            </ion-button>
          </ion-item>
          <ion-card-content>
            <ion-chip outline>
              {{ "Facility group name" }}
              <ion-icon :icon="closeCircle"/>
            </ion-chip>
          </ion-card-content>
        </ion-card>
      </section>

      <ProductFilterByItem />
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button>
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonChip, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { addCircleOutline, closeCircle, saveOutline } from 'ionicons/icons'
import { translate } from "@hotwax/dxp-components";
import ProductFilterByItem from '@/components/ProductFilterByItem.vue';
</script>