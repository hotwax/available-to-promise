<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-back-button slot="start" default-href="/store-pickup" />
        <ion-title>{{ translate("New store pickup rule") }}</ion-title>
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
                <ion-icon slot="start" :icon="storefrontOutline"/>
                <ion-toggle>{{ translate("Store pickup") }}</ion-toggle>
              </ion-item>
            </div>
          </ion-card>
        </div>
      </section>

      <div class="section-header">
        <ion-segment v-model="selectedSegment">
          <ion-segment-button value="facility">
            <ion-label>{{ translate("Facility") }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="channel">
            <ion-label>{{ translate("Channel") }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>

      <section v-if="selectedSegment === 'facility'">
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

      <section v-else>
        <ion-card >
          <ion-card-header>
            <div>
              <ion-card-title>{{ "Facility Name" }}</ion-card-title>
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
import { IonBackButton, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCheckbox, IonChip, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonPage, IonSegment, IonSegmentButton, IonTitle, IonToggle, IonToolbar } from '@ionic/vue';
import { addCircleOutline, closeCircle, saveOutline, storefrontOutline } from 'ionicons/icons'
import { translate } from "@hotwax/dxp-components";
import { ref } from 'vue';

const selectedSegment = ref("facility")
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