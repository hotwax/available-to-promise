<template>
  <ion-card>
    <ion-card-header>
      <div>
        <ion-card-subtitle class="overline">{{ "Rule ID" }}</ion-card-subtitle>
        <ion-card-title>{{ "Rule name" }}</ion-card-title>
        <ion-card-subtitle>{{ "1/4" }}</ion-card-subtitle>
      </div>
      <div>
        <ion-button fill="clear" color="medium">
          <ion-icon :icon="chevronUpOutline" slot="icon-only" />
        </ion-button>
        <ion-button fill="clear" color="medium">
          <ion-icon :icon="chevronDownOutline" slot="icon-only" />
        </ion-button>
      </div>
    </ion-card-header>
    <ion-item lines="full">
      <ion-icon slot="start" :icon="globeOutline"/>
      <ion-label class="ion-text-wrap">{{ "Threshold" }}</ion-label>
      <ion-chip slot="end" outline>5</ion-chip>
    </ion-item>
    <ion-list>
      <ion-item-divider color="light">
        <ion-label>
          {{ "Facility groups" }}
        </ion-label>
      </ion-item-divider>
      <ion-item>
        <ion-icon slot="start" :icon="checkmarkDoneCircleOutline"/>
        <ion-label class="ion-text-wrap">{{ "<Group name, Group name>" }}</ion-label>
      </ion-item>
      <ion-item lines="none">
        <ion-icon slot="start" :icon="closeCircleOutline"/>
        <ion-label class="ion-text-wrap">{{ "<Group name, Group name>" }}</ion-label>
      </ion-item>
      <ion-item-divider color="light">
        <ion-label>
          {{ "Product tags" }}
        </ion-label>
      </ion-item-divider>
      <ion-item>
        <ion-icon slot="start" :icon="checkmarkDoneCircleOutline"/>
        <ion-label class="ion-text-wrap">{{ "<Group name, Group name>" }}</ion-label>
      </ion-item>
      <ion-item lines="none">
        <ion-icon slot="start" :icon="closeCircleOutline"/>
        <ion-label class="ion-text-wrap">{{ "<Group name, Group name>" }}</ion-label>
      </ion-item>
      <ion-item-divider color="light">
        <ion-label>
          {{ "Product features" }}
        </ion-label>
      </ion-item-divider>
      <ion-item>
        <ion-icon slot="start" :icon="checkmarkDoneCircleOutline"/>
        <ion-label class="ion-text-wrap">{{ "<Group name, Group name>" }}</ion-label>
      </ion-item>
      <ion-item lines="full">
        <ion-icon slot="start" :icon="closeCircleOutline"/>
        <ion-label class="ion-text-wrap">{{ "<Group name, Group name>" }}</ion-label>
        </ion-item>
        <ion-item lines="none">
          <ion-button fill="clear">{{ "Run now" }}</ion-button>
          <ion-button fill="clear" slot="end">
          <ion-icon :icon="ellipsisVerticalOutline" slot="icon-only"/>
        </ion-button>
      </ion-item>
    </ion-list>
  </ion-card>
</template>

<script lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { checkmarkDoneCircleOutline, chevronDownOutline, chevronUpOutline, closeCircleOutline, ellipsisVerticalOutline, globeOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { Actions, hasPermission } from '@/authorization'

export default defineComponent({
  name: 'RuleItem',
  components: {
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    return {
      Actions,
      checkmarkDoneCircleOutline,
      chevronDownOutline,
      chevronUpOutline,
      closeCircleOutline,
      ellipsisVerticalOutline,
      globeOutline,
      hasPermission,
      router,
      store,
    };
  },
});
</script>

<style scoped>
ion-card {
  min-width: 375px;
}
ion-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0px;
}
</style>