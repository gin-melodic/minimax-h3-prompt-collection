import { describe, expect, it } from "vitest";
import { embedUrl, identifyVideo } from "./metadata";

describe("identifyVideo", () => {
  it("parses YouTube watch URLs", () => expect(identifyVideo("https://www.youtube.com/watch?v=abc_123-XY")).toEqual({ provider: "youtube", videoId: "abc_123-XY" }));
  it("parses YouTube short URLs", () => expect(identifyVideo("https://youtu.be/abc123")).toEqual({ provider: "youtube", videoId: "abc123" }));
  it("parses Bilibili URLs", () => expect(identifyVideo("https://www.bilibili.com/video/BV1xx411c7mD/")).toEqual({ provider: "bilibili", videoId: "BV1xx411c7mD" }));
  it("marks unknown sites as external", () => expect(identifyVideo("https://example.com/video/1")).toEqual({ provider: "external", videoId: null }));
});

describe("embedUrl", () => {
  it("uses the privacy enhanced YouTube host", () => expect(embedUrl("youtube", "abc")).toBe("https://www.youtube-nocookie.com/embed/abc"));
  it("does not embed external providers", () => expect(embedUrl("external", null)).toBeNull());
});
