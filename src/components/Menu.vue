<template>
  <ion-menu side="start" menu-id="first" content-id="main" type="overlay" :disabled="!isUserAuthenticated">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ $t("Menu") }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-menu-toggle auto-hide="false" v-for="(page, index) in getValidMenuItems(appPages)" :key="index">
          <ion-item 
            button
            router-direction="root"
            :router-link="page.url"
            class="hydrated"
            :class="{ selected: selectedIndex === index}">
            <ion-icon slot="start" :ios="page.iosIcon" :md="page.mdIcon"></ion-icon>
            <ion-label>{{ page.title }}</ion-label>
          </ion-item>
        </ion-menu-toggle>
      </ion-list>
    </ion-content>
  </ion-menu>
</template>
  
<script lang="ts">
  import {
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuToggle,
    IonTitle,
    IonToolbar,
  } from "@ionic/vue";
  import { defineComponent, computed } from "vue";
  import { mapGetters } from "vuex";
  import { useStore } from "@/store";
  import { useRouter } from "vue-router";
  import { optionsOutline, settingsOutline, pulseOutline } from 'ionicons/icons';
  
  export default defineComponent({
    name: "Menu",
    components: {
      IonContent,
      IonHeader,
      IonIcon,
      IonItem,
      IonLabel,
      IonList,
      IonMenu,
      IonMenuToggle,
      IonTitle,
      IonToolbar
    },
    computed: {
      ...mapGetters({
        isUserAuthenticated: 'user/isUserAuthenticated',
        instanceUrl: 'user/getInstanceUrl',
      })
    },
    methods: {
      getValidMenuItems(appPages: any) {
        return appPages.filter((appPage: any) => (!appPage.meta || !appPage.meta.permissionId));
      }
    },
    setup() {
      const store = useStore();
      const router = useRouter();
      const appPages = [
        {
          title: "Settings",
          url: "/settings",
          iosIcon: settingsOutline,
          mdIcon: settingsOutline
        }
      ];

      const selectedIndex = computed(() => {
        const path = router.currentRoute.value.path;
        return appPages.findIndex((screen) => screen.url === path);
      });

      return {
        appPages,
        router,
        pulseOutline,
        optionsOutline,
        settingsOutline,
        selectedIndex,
        store,
      };
    },
  });
  </script>
  
  <style scoped>
  ion-menu.md ion-item.selected ion-icon {
    color: var(--ion-color-secondary);
  }
  ion-menu.ios ion-item.selected ion-icon {
    color: var(--ion-color-secondary);
  }
  ion-item.selected {
    --color: var(--ion-color-secondary);
  }
  </style>
  

