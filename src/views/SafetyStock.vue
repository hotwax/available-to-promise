<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ $t("Safety stock") }}</ion-title>
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
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="createRule()">
        <ion-icon :icon="addOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import RuleItem from '@/components/RuleItem.vue';
import { useRouter } from "vue-router";
import ScheduleRuleItem from '@/components/ScheduleRuleItem.vue';

const router = useRouter()

function createRule() {
  router.replace({ path: '/create-safety-stock' })
}
</script>