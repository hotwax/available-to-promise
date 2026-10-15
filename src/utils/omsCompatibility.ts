import { commonUtil } from "@common/utils/commonUtil";

// OMS v3.1.0 replaced the OFBiz ATP import, which accepted the facility-safety-stock rule field,
// with the native DataManager import, which requires minimum-stock. From that version on, ATP
// rules are managed in the Order Routing app.
export const FIRST_INCOMPATIBLE_OMS_VERSION = "3.1.0";
// The platform release that first shipped OMS v3.1.0, used when the OMS component is not listed.
export const FIRST_INCOMPATIBLE_RELEASE = "v6.1.0";

// Order Routing serves the same rule screens under the same paths.
const ORDER_ROUTING_RULE_PATHS = ["/threshold", "/safety-stock", "/store-pickup", "/shipping", "/create-threshold", "/create-safety-stock", "/create-store-pickup", "/create-shipping"];
const ORDER_ROUTING_RULE_PATH_PREFIXES = ["/update-threshold/", "/update-safety-stock/", "/update-store-pickup/", "/update-shipping/"];

const findOmsComponentVersion = (maargInfo: any) => maargInfo?.components?.find((component: any) => component?.name === "oms")?.version;

// The OMS version reported by admin/maarg: the oms component version, else the platform release.
export function getOmsVersion(maargInfo: any): string {
  const omsVersion = findOmsComponentVersion(maargInfo);
  if(commonUtil.isValidVersion(omsVersion)) {
    return omsVersion;
  }

  const release = maargInfo?.instanceInfo?.componentRelease;

  return commonUtil.isValidVersion(release) ? release : "";
}

// isVersionGreaterOrEqual allows unparseable versions by default, so only compare valid ones.
// An OMS that reports no usable version (branch builds, or one older than admin/maarg) keeps the app.
export function isIncompatibleOms(maargInfo: any): boolean {
  const omsVersion = findOmsComponentVersion(maargInfo);
  if(commonUtil.isValidVersion(omsVersion)) {
    return commonUtil.isVersionGreaterOrEqual(FIRST_INCOMPATIBLE_OMS_VERSION, omsVersion);
  }

  const release = maargInfo?.instanceInfo?.componentRelease;
  if(commonUtil.isValidVersion(release)) {
    return commonUtil.isVersionGreaterOrEqual(FIRST_INCOMPATIBLE_RELEASE, release);
  }

  return false;
}

// Keeps the user on the same rule screen when Order Routing has it, otherwise opens its dashboard.
export function getOrderRoutingPath(path?: any): string {
  const requestedPath = typeof path === "string" ? path.split(/[?#]/)[0] : "";
  const isRuleScreen = ORDER_ROUTING_RULE_PATHS.includes(requestedPath) ||
    ORDER_ROUTING_RULE_PATH_PREFIXES.some((prefix) => requestedPath.startsWith(prefix) && requestedPath.length > prefix.length);

  return isRuleScreen ? requestedPath : "/";
}
