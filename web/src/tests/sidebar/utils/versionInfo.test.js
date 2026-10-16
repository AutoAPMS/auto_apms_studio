import { describe, expect, it } from "vitest";
import {
  remoteToHttpsUrl,
  resolveVersionInfo,
} from "../../../../versionInfo.js";

describe("remoteToHttpsUrl", () => {
  it("converts SSH remotes", () => {
    expect(
      remoteToHttpsUrl("git@github.com:AutoAPMS/auto_apms_studio.git")
    ).toBe("https://github.com/AutoAPMS/auto_apms_studio");
    expect(remoteToHttpsUrl("ssh://git@example.com:2222/group/repo.git")).toBe(
      "https://example.com/group/repo"
    );
  });

  it("strips credentials and .git suffix from HTTPS remotes", () => {
    expect(remoteToHttpsUrl("https://user:token@github.com/a/b.git")).toBe(
      "https://github.com/a/b"
    );
  });

  it("returns null for unsupported input", () => {
    expect(remoteToHttpsUrl("")).toBeNull();
    expect(remoteToHttpsUrl("/local/path/repo")).toBeNull();
  });
});

describe("resolveVersionInfo", () => {
  const githubEnv = {
    GITHUB_ACTIONS: "true",
    GITHUB_SHA: "0123456789abcdef0123456789abcdef01234567",
    GITHUB_SERVER_URL: "https://github.com",
    GITHUB_REPOSITORY: "AutoAPMS/auto_apms_studio",
  };

  it("links to the tag when building a tag on GitHub Actions", () => {
    const info = resolveVersionInfo({
      ...githubEnv,
      GITHUB_REF_TYPE: "tag",
      GITHUB_REF_NAME: "v9.9.9",
    });
    expect(info.tag).toBe("v9.9.9");
    expect(info.label.startsWith("v9.9.9")).toBe(true);
    expect(info.url).toBe(
      "https://github.com/AutoAPMS/auto_apms_studio/tree/v9.9.9"
    );
  });

  it("links to the commit when there is no tag", () => {
    const info = resolveVersionInfo({
      ...githubEnv,
      AUTO_APMS_STUDIO_GIT_TAG: "",
      GITHUB_REF_TYPE: "branch",
    });
    expect(info.sha).toBe(githubEnv.GITHUB_SHA);
    expect(info.label.startsWith("0123456")).toBe(true);
    expect(info.url).toBe(
      `https://github.com/AutoAPMS/auto_apms_studio/tree/${githubEnv.GITHUB_SHA}`
    );
  });
});
