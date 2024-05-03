<template>
  <ion-page>
    <ion-content>
      <div class="flex">
        <form class="login-container" @keyup.enter="login(form)" @submit.prevent>
          <Logo />

          <ion-item lines="full">
            <ion-input :label="translate('OMS')" label-placement="fixed" name="instanceUrl" v-model="instanceUrl" id="instanceUrl" type="text" required />
          </ion-item>
          <ion-item lines="full">
            <ion-input :label="translate('Username')" label-placement="fixed" name="username" v-model="username" id="username" type="text" required />
          </ion-item>
          <ion-item lines="none">
            <ion-input :label="translate('Password')" label-placement="fixed" name="password" v-model="password" id="password" type="password" required />
          </ion-item>

          <div class="ion-padding">
            <ion-button type="submit" color="primary" fill="outline" expand="block" @click="login(form)">{{ translate("Login") }}</ion-button>
          </div>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonPage
} from "@ionic/vue";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import store from "@/store";
import Logo from "@/components/Logo.vue";
import { translate } from '@hotwax/dxp-components';

const username = ref("")
const password = ref("")
const instanceUrl = ref("")
const router = useRouter();

const currentInstanceUrlSaved = computed(() => store.getters["user/getInstanceUrl"])

onMounted(() => {
  instanceUrl.value = currentInstanceUrlSaved.value;
})

function login() {
  store.dispatch("user/setUserInstanceUrl", instanceUrl.value.trim())
  store.dispatch("user/login", { username: username.value.trim(), password: password.value }).then((data: any) => {
    if (data.token) {
      username.value = ""
      password.value = ""
      router.push("/")
    }
  }).catch(err => err)
}
</script>

<style scoped>
.login-container {
  width: 375px;
}

.flex {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
