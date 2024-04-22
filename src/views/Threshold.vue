<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ translate("Threshold") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main v-if="ruleGroup.ruleGroupId">
        <ScheduleRuleItem />

        <section>
          <RuleItem v-for="(rule, ruleIndex) in rules" :rule="rule" :ruleIndex="ruleIndex" :key="rule.ruleId" />
        </section>
      </main>

      <div class="empty-state" v-else>
       <p>{{ translate("No threshold rules found") }}</p>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="CreateThreshold()">
          <ion-icon :icon="addOutline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { addOutline } from 'ionicons/icons';
import RuleItem from '@/components/RuleItem.vue'
import ScheduleRuleItem from '@/components/ScheduleRuleItem.vue';
import { useRouter } from 'vue-router';
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { translate } from '@/i18n';

const store = useStore();
const router = useRouter()

const rules = computed(() => store.getters["rule/getRules"]);
const ruleGroup = computed(() => store.getters["rule/getRuleGroup"]);

onMounted(async() => {
  await store.dispatch('rule/fetchRules', { groupTypeEnumId: 'RG_THRESHOLD' })
  await store.dispatch("util/fetchConfigFacilities");
  await store.dispatch("util/fetchFacilityGroups");
})

function CreateThreshold() {
  router.replace({ path: '/create-threshold' })
}
</script>
