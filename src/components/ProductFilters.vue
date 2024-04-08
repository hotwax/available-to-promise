<template>
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
</template>

<script setup lang="ts">
import { IonButton, IonCard, IonCardContent, IonChip, IonIcon, IonItem, IonLabel } from '@ionic/vue';
import { addCircleOutline, closeCircle } from 'ionicons/icons'
import { translate } from '@/i18n';
</script>