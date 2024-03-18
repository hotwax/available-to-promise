<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>{{ $t("Threshold") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main>
        <ScheduleRuleItem />

        <section>
          <RuleItem />
          <RuleItem />
        </section>
      </main>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="CreateThreshold()">
          <ion-icon :icon="addOutline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import RuleItem from '@/components/RuleItem.vue'
import ScheduleRuleItem from '@/components/ScheduleRuleItem.vue';
import { useRouter } from 'vue-router';

const router = useRouter()

function CreateThreshold() {
  router.replace({ path: '/create-threshold' })
}

</script>
