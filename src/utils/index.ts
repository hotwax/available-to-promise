import { modalController, toastController } from '@ionic/vue';
import { DateTime } from "luxon";
import ErrorMessageModal from "@/components/ErrorMessageModal.vue";

// TODO Use separate files for specific utilities

// TODO Remove it when HC APIs are fully REST compliant
const hasError = (response: any) => {
    return typeof response.data != "object" || !!response.data._ERROR_MESSAGE_ || !!response.data._ERROR_MESSAGE_LIST_ || !!response.data.error;
}

const showToast = async (message: string, err?: any) => {
  const config = {
    message,
    duration: 3000,
    position: 'bottom'
  } as any
  if (err) {
    config.buttons = [
      {
        text: 'view',
        side: 'end',
        handler: async () => {
          const errorMessageModal = await modalController.create({
            component: ErrorMessageModal,
            componentProps: {
              errorMessage: err,
            },
            initialBreakpoint: 0.08,
            breakpoints: [0, 0.10, 0.5, 0.75]
          });
          return errorMessageModal.present();
        }
      }
    ]
  }
  const toast = await toastController.create(config)
  return toast.present();
}

const getFeature = (featureHierarchy: any, featureKey: string) => {
  let featureValue = ''
  if (featureHierarchy) {
    const feature = featureHierarchy.find((featureItem: any) => featureItem.startsWith(featureKey))
    const featureSplit = feature ? feature.split('/') : [];
    featureValue = featureSplit[2] ? featureSplit[2] : '';
  }
  return featureValue;
}

const handleDateTimeInput = (dateTimeValue: any) => {
  // TODO Handle it in a better way
  // Remove timezone and then convert to timestamp
  // Current date time picker picks browser timezone and there is no supprt to change it
  const dateTime = DateTime.fromISO(dateTimeValue, { setZone: true}).toFormat("yyyy-MM-dd'T'HH:mm:ss")
  return DateTime.fromISO(dateTime).toMillis()
}

const getResponseError = (resp: any) => {
  return resp.data.error || resp.data._ERROR_MESSAGE_ || resp.data._ERROR_MESSAGE_LIST_ || resp.data.errorMessage || resp.data.errorMessageList || "";
}

const getProductIdentificationValue = (productIdentifier: string, product: any) => {

  // handled this case as on page load initially the data is not available, so not to execute furthur code
  // untill product are not available
  if(!Object.keys(product).length) {
    return;
  }

  let value = product[productIdentifier]

  // considered that the goodIdentification will always have values in the format "productIdentifier/value" and there will be no entry like "productIdentifier/"
  const identification = product['goodIdentifications'].find((identification: string) => identification.startsWith(productIdentifier + "/"))

  if(identification) {
    const goodIdentification = identification.split('/')
    value = goodIdentification[1]
  }

  return value;
}

export { handleDateTimeInput, showToast, hasError, getFeature, getResponseError, getProductIdentificationValue }
