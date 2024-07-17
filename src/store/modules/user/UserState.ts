export default interface UserState {
  token: string;
  current: object | null;
  instanceUrl: string;
  currentEComStore: object;
  omsRedirectionInfo: {
    url: string;
    token: string;
  }
  pwaState: any;
}