<template>
  <ion-content>
    <ion-list>
      <ion-list-header>{{ "rule name" }}</ion-list-header>
      <ion-item button>
        {{ translate("Edit rule") }}
      </ion-item>
      <ion-item button lines="none">
        {{ translate("Delete") }}
      </ion-item> 
    </ion-list>
  </ion-content>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { translate } from "@hotwax/dxp-components";
import {
  IonContent,
  IonItem,
  IonList,
  IonListHeader
} from "@ionic/vue";

export default defineComponent({
  name: "RuleActionsPopover",
  components: { 
    IonContent,
    IonItem,
    IonList,
    IonListHeader,
  },
  setup() {
    return {
      translate
    }
  }
});
</script> 