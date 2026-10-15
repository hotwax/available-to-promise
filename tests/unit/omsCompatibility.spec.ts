// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { getOmsVersion, getOrderRoutingPath, isIncompatibleOms } from "@/utils/omsCompatibility";

const maargInfo = (omsVersion?: string, componentRelease?: string) => ({
  instanceInfo: componentRelease === undefined ? {} : { componentRelease },
  components: omsVersion === undefined ? [{ name: "maarg-util", version: "4.5.0" }] : [{ name: "maarg-util", version: "4.5.0" }, { name: "oms", version: omsVersion }]
});

describe("isIncompatibleOms", () => {
  it("keeps the app on OMS versions before 3.1.0", () => {
    expect(isIncompatibleOms(maargInfo("3.0.1", "v6.0.0"))).toBe(false);
    expect(isIncompatibleOms(maargInfo("2.4.0"))).toBe(false);
    expect(isIncompatibleOms(maargInfo("3.0.0-RC1"))).toBe(false);
  });

  it("blocks OMS 3.1.0 and later", () => {
    expect(isIncompatibleOms(maargInfo("3.1.0"))).toBe(true);
    expect(isIncompatibleOms(maargInfo("3.5.0", "v6.5.0-RC1"))).toBe(true);
    expect(isIncompatibleOms(maargInfo("v4.0.0"))).toBe(true);
  });

  it("prefers the oms component version over the platform release", () => {
    expect(isIncompatibleOms(maargInfo("3.0.1", "v6.5.0"))).toBe(false);
    expect(isIncompatibleOms(maargInfo("3.1.0", "v6.0.0"))).toBe(true);
  });

  it("falls back to the platform release when the oms component is not listed", () => {
    expect(isIncompatibleOms(maargInfo(undefined, "v6.0.0"))).toBe(false);
    expect(isIncompatibleOms(maargInfo(undefined, "v6.1.0"))).toBe(true);
    expect(isIncompatibleOms(maargInfo(undefined, "v6.5.0-RC1"))).toBe(true);
  });

  it("keeps the app when no usable version is reported", () => {
    expect(isIncompatibleOms(maargInfo("main", "UpcomingRelease"))).toBe(false);
    expect(isIncompatibleOms(maargInfo(undefined, "UpcomingRelease"))).toBe(false);
    expect(isIncompatibleOms({})).toBe(false);
    expect(isIncompatibleOms(undefined)).toBe(false);
  });
});

describe("getOmsVersion", () => {
  it("reports the version the decision used", () => {
    expect(getOmsVersion(maargInfo("3.5.0", "v6.5.0"))).toBe("3.5.0");
    expect(getOmsVersion(maargInfo("main", "v6.4.0"))).toBe("v6.4.0");
    expect(getOmsVersion(maargInfo(undefined, "UpcomingRelease"))).toBe("");
  });
});

describe("getOrderRoutingPath", () => {
  it("keeps rule screens that Order Routing also serves", () => {
    expect(getOrderRoutingPath("/safety-stock")).toBe("/safety-stock");
    expect(getOrderRoutingPath("/update-threshold/R100")).toBe("/update-threshold/R100");
    expect(getOrderRoutingPath("/create-shipping?productStoreId=STORE")).toBe("/create-shipping");
  });

  it("opens the Order Routing dashboard for anything else", () => {
    expect(getOrderRoutingPath("/inventory-channels")).toBe("/");
    expect(getOrderRoutingPath("/settings")).toBe("/");
    expect(getOrderRoutingPath("/update-threshold/")).toBe("/");
    expect(getOrderRoutingPath(undefined)).toBe("/");
    expect(getOrderRoutingPath(["/threshold"])).toBe("/");
  });
});
