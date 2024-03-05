<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>{{ $t("Threshold") }}</ion-title>
      </ion-toolbar>

      <ion-toolbar>
        <ion-segment>
          <ion-segment-button value="productAndFacility">
            <ion-label>{{ $t("Product and facility") }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="productAndChannel">
            <ion-label>{{ $t("Product and channel") }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main>
        <section>
          <RuleItem />
          <RuleItem />
        </section>
      </main>
    </ion-content>
  </ion-page>
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
import { arrowForwardOutline, downloadOutline, filterOutline, saveOutline, pricetagOutline, closeCircle, addCircleOutline, albumsOutline, warningOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { Actions, hasPermission } from '@/authorization'
import RuleItem from '@/components/RuleItem.vue'

export default defineComponent({
  name: 'SelectProduct',
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToolbar,
    RuleItem
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    return {
      Actions,
      arrowForwardOutline,
      downloadOutline,
      filterOutline,
      hasPermission,
      router,
      saveOutline,
      store,
      pricetagOutline,
      closeCircle,
      addCircleOutline,
      albumsOutline,
      warningOutline
    };
  },
});
</script>


<style scoped>

@media (min-width: 991px) {
  ion-header{
    display: flex;
  }

  main {
    display: flex;
    justify-content: center;
    align-items: start;
    gap: var(--spacer-2xl);
    max-width: 990px;
    margin: var(--spacer-base) auto 0;
  } 

  main > section {
    max-width: 50ch;
  } 

  aside {
    width: 0px;
    opacity: 0;
  }
}
</style>
