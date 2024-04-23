export default interface UserState {
    permissions: any;
    pwaState: any;
    token: string;
    current: object | null;
    instanceUrl: string;
    currentEComStore: object;
}