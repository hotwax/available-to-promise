<template>
  <ion-content class="ion-padding">
    {{ errorMessage }}  
  </ion-content>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
  IonContent,
} from '@ionic/vue';

export default defineComponent ({
  name: 'ErrorMessageModal',
  components: {
    IonContent,
  },
  props: ["errorMessage"]
})
</script>