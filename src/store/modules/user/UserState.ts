export default interface UserState {
  token: string;
  current: object | null;
  instanceUrl: string;
  currentProductStore: object;
  omsRedirectionInfo: {
    url: string;
    token: string;
  }
  pwaState: any;
  permissions: any;
}