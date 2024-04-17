import { toastController } from '@ionic/vue';
import { DateTime } from 'luxon';

// TODO Use separate files for specific utilities

// TODO Remove it when HC APIs are fully REST compliant
const hasError = (response: any) => {
    return typeof response.data != "object" || !!response.data._ERROR_MESSAGE_ || !!response.data._ERROR_MESSAGE_LIST_ || !!response.data.error;
}

const showToast = async (message: string) => {
  const toast = await toastController
    .create({
      message,
      duration: 3000,
      position: "bottom",
    })
  return toast.present();
}

function getDateAndTime(time: any) {
  return time ? DateTime.fromMillis(time).toLocaleString(DateTime.DATETIME_MED) : "-";
}

export { getDateAndTime, hasError, showToast }