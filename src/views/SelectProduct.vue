<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-menu-button slot="start" />
        <ion-title>{{ $t("Threshold management") }}</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="mobile-only">
            <ion-icon :icon="downloadOutline" />
          </ion-button>
          <ion-button fill="clear" class="mobile-only">
            <ion-icon :icon="filterOutline" />
          </ion-button>
          <ion-button
            class="desktop-only"
            @click="() => router.push('/select-product-csv-upload')"
            >{{ $t("Upload CSV") }}</ion-button
          >
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="find">
        <section class="search">
          <ion-searchbar :placeholder="$t('Search products')" />
        </section>

        <aside class="filters desktop-only">
          <ion-item>
            <ion-label>{{ $t("Only show selected products") }}</ion-label>
            <ion-toggle slot="end" />
          </ion-item>
        </aside>

        <main class="main">
          <section class="sort"></section>

          <section class="section-header">
            <div class="primary-info">
              <ion-item lines="none">
                <ion-label>
                  Parent Product
                  <p>5 {{ $t("variants") }}</p>
                </ion-label>
              </ion-item>
            </div>

            <div class="tags"></div>

            <div class="metadata desktop-only">
              <ion-item lines="none">
                <ion-label>{{ $t("Select all variants") }}</ion-label>
                <ion-toggle />
              </ion-item>
            </div>
          </section>

          <section class="section-grid">
            <div @click="onSelected(isToggle)" ref="parent">
              <ion-card  class="card-content" ref="cardRef">
                <ion-icon
                  class="selected"
                  :icon="checkmarkSharp"
                  ref="toggleIconRef"
                />
                <div>
                  <Image
                    src="https://cdn.shopify.com/s/files/1/0069/7384/9727/products/test-track.jpg?v=1626255137"
                  />

                  <ion-item lines="none">
                    <ion-label>
                      SKU
                      <p>Color: Blue</p>
                      <p>Size: XL</p>
                    </ion-label>
                  </ion-item>
                </div>
              </ion-card>
            </div>
          </section>
          <hr />
        </main>
      </div>

      <div class="action desktop-only">
        <ion-button>
          {{ $t("Select locations") }}
          <ion-icon :icon="arrowForwardOutline" />
        </ion-button>
      </div>

      <ion-fab
        vertical="bottom"
        horizontal="end"
        slot="fixed"
        class="mobile-only"
      >
        <ion-fab-button>
          <ion-icon :icon="arrowForwardOutline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import Image from "@/components/Image.vue";
import {
  IonButton,
  IonButtons,
  IonCard,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonMenuButton,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToggle,
  IonToolbar,
  createAnimation,
} from "@ionic/vue";
import { defineComponent, ref, onMounted } from "vue";
import {
  arrowForwardOutline,
  downloadOutline,
  filterOutline,
  checkmarkSharp,
} from "ionicons/icons";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "SelectProduct",
  components: {
    IonButton,
    IonButtons,
    IonCard,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonMenuButton,
    IonPage,
    IonSearchbar,
    IonTitle,
    IonToggle,
    IonToolbar,
    Image,
  },
  setup() {
    const router = useRouter();

    const parent = ref();
    const iconRef = ref();
    const cardRef = ref();
    const toggleIconRef = ref();
    const isToggle = ref(true);
    let toggleAnimation: any;
    let removeAnimation: any;

    const icon = createAnimation()
      .addElement(iconRef.value)
      .keyframes([
        { offset: 0, transform: "scale(1) rotate(0)" },
        { offset: 0.5, transform: "scale(1.2) rotate(45deg)" },
        { offset: 1, transform: "scale(1) rotate(45deg)" },
      ]);

      console.log(icon)

      const card = createAnimation()
      .addElement(cardRef.value)
      .keyframes([
        { offset: 0, transform: "scale(1))", opacity: "1" },
        { offset: 0.5, transform: "scale(1.2)", opacity: "0.3" },
        { offset: 1, transform: "scale(1)", opacity: "1" },
      ]);

      console.log(card)

    onMounted(() => {
      // toggleAnimation = createAnimation()
      //   .addElement(parent.value)
      //   .afterRemoveClass("selected");
      // removeAnimation = createAnimation()
      //   .addElement(parent.value)
      //   .afterAddClass("selected");
      toggleAnimation = createAnimation()
        .addElement(parent.value)
        .afterRemoveClass("card-content");
      removeAnimation = createAnimation()
        .addElement(parent.value)
        .afterAddClass("card-content");
    });

    const onSelected = (selected: boolean) => {

      if (selected) {

      const parent = createAnimation()
      .duration(3000)
      .iterations(Infinity)
      .addAnimation([icon, card])
      .addAnimation([toggleAnimation]);

        console.log(parent)

      parent && parent.play();

    } else {
      const parent = createAnimation()
      .duration(2000)
      .iterations(Infinity)
      .addAnimation([icon, card])
      .addAnimation([removeAnimation]);

      console.log(parent)

      parent && parent.play();
    }
     isToggle.value = !selected;
    }

    // const toggleIconRef = ref();
    // const isToggle = ref(true);
    
    // let toggleAnimation: any;
    // let removeAnimation: any;
    // onMounted(() => {
    //   toggleAnimation = createAnimation()
    //     .addElement(toggleIconRef.value.$el)
    //     .afterRemoveClass("selected");
    //   removeAnimation = createAnimation()
    //     .addElement(toggleIconRef.value.$el)
    //     .afterAddClass("selected");
    //   toggleAnimation = createAnimation()
    //     .addElement(cardRef.value.$el)
    //     .afterRemoveClass("card-content");
    //   removeAnimation = createAnimation()
    //     .addElement(cardRef.value.$el)
    //     .afterAddClass("card-content");
    // });
    // const onSelected = (selected: boolean) => {
    //   if (selected) {
    //     const animate = createAnimation()
    //       .addElement(parentRef.value)
    //       .duration(2000)
    //       .keyframes([
    //         {
    //           offset: 0,
    //           transform: "scale(1))",
    //           opacity: "1",
    //         },
    //         {
    //           offset: 0.5,
    //           transform: "scale(1.1)",
    //           opacity: "0.5",
    //         },
    //         {
    //           offset: 1,
    //           transform: "scale(1)",
    //           opacity: "1",
    //         },
    //       ])
    //       .addAnimation([toggleAnimation]);

    //     animate && animate.play();
    //   } else {
    //     const animate = createAnimation()
    //       .addElement(parentRef.value)
    //       .duration(2000)
    //       .keyframes([
    //         { offset: 0, transform: "scale(1))", opacity: "0.5" },
    //         { offset: 0.5, transform: "scale(0.9)", opacity: "0.5" },
    //         { offset: 1, transform: "scale(1)", opacity: "1" },
    //       ])
    //       .addAnimation([removeAnimation]);
    //     animate && animate.play();
    //   }
    //   isToggle.value = !selected;
    // };

    return {
      arrowForwardOutline,
      downloadOutline,
      filterOutline,
      onSelected,
      parent,
      iconRef,
      cardRef,
      toggleIconRef,
      checkmarkSharp,
      isToggle,
      router,
    };
  },
});
</script>

<style scoped>
.filters {
  border-right: 1px solid var(--ion-color-medium);
}

.section-grid {
  grid-template-columns: repeat(auto-fill, 200px);
}

ion-card {
  cursor: pointer;
  position: relative;
}

ion-card > ion-icon {
  width: 100%;
  height: 100%;
  position: absolute;
  /* backdrop-filter: contrast(0.5);
  color: white; */
}

.selected {
  display: none;
}

.card-content {
  /* opacity: 0.3; */
  box-shadow: rgb(0 0 0 / 14%) 2px 2px 2px 0px, rgb(0 0 0 / 14%) 2px 2px 2px 0px,
    rgb(0 0 0 / 12%) 2px 1px 5px 2px, rgb(0 0 0 / 12%) 2px 1px 5px 2px;
}

ion-item::part(native) {
  background: none;
}

@media (min-width: 991px) {
  .action {
    /* desktop-only class is setting display to unset and below properties were not getting applied that is why display is set block here */
    display: block;
    /* TODO use spacer variable */
    margin: 250px 0;
    text-align: center;
  }
}
</style>
