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

const getTime = (time: any) => {
  return time ? DateTime.fromMillis(time).toLocaleString(DateTime.TIME_SIMPLE) : "-";
}

function getDate(runTime: any) {
  return DateTime.fromMillis(runTime).toLocaleString(DateTime.DATE_MED);
}

function timeTillRun(endTime: any) {
  const timeDiff = DateTime.fromMillis(endTime).diff(DateTime.local());
  return DateTime.local().plus(timeDiff).toRelative();
}

const generateInternalId = (name: string) => {
  return name.trim().toUpperCase().split(' ').join('_');
}

const doReorder = (event: CustomEvent, rules: any) => {
  const previousSeq = JSON.parse(JSON.stringify(rules))

  // returns the updated sequence after reordering
  const updatedSeq = event.detail.complete(JSON.parse(JSON.stringify(rules)));

  let diffSeq = findRulesDiff(previousSeq, updatedSeq)

  const updatedSeqenceNum = previousSeq.map((rejectionReason: any) => rejectionReason.sequenceNum)
  Object.keys(diffSeq).map((key: any) => {
    diffSeq[key].sequenceNum = updatedSeqenceNum[key]
  })

  diffSeq = Object.keys(diffSeq).map((key) => diffSeq[key])
  return updatedSeq
}

const findRulesDiff = (previousSeq: any, updatedSeq: any) => {
  const diffSeq: any = Object.keys(previousSeq).reduce((diff, key) => {
    if (updatedSeq[key].ruleId === previousSeq[key].ruleId && updatedSeq[key].sequenceNum === previousSeq[key].sequenceNum) return diff
    return {
      ...diff,
      [key]: updatedSeq[key]
    }
  }, {})
  return diffSeq;
}

export { doReorder, generateInternalId, getDate, getDateAndTime, getTime, hasError, showToast, timeTillRun }