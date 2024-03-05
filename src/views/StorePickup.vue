<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>{{ $t("Store pickup") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <h1>This is store pickup</h1>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { defineComponent } from 'vue';
import { arrowForwardOutline, downloadOutline, filterOutline, saveOutline, pricetagOutline, closeCircle, addCircleOutline, albumsOutline, warningOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { Actions, hasPermission } from '@/authorization'

export default defineComponent({
  name: 'StorePickup',
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
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