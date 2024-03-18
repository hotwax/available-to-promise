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

      <div class="section-header">
        <h1>{{ translate("Products by tags") }}</h1>
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
              {{ "Tag name" }}
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
              {{ "Tag name" }}
              <ion-icon :icon="closeCircle"/>
            </ion-chip>
          </ion-card-content>
        </ion-card>
      </section>

      <div class="section-header">
        <h1>{{ translate("Products by feature") }}</h1>
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
              {{ "Feature name" }}
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
              {{ "Feature name" }}
              <ion-icon :icon="closeCircle"/>
            </ion-chip>
          </ion-card-content>
        </ion-card>
      </section>
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button>
        <ion-icon :icon="saveOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCheckbox, IonChip, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { addCircleOutline, closeCircle, saveOutline } from 'ionicons/icons'
import { translate } from "@hotwax/dxp-components";
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