export default interface UserState {
    permissions: any;
    token: string;
    current: object | null;
    instanceUrl: string;
    currentEComStore: object;
}