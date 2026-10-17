import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const DEFAULT_REPO_URL = "https://github.com/AutoAPMS/auto_apms_studio";
const SOURCE_DIR = dirname(fileURLToPath(import.meta.url));

/**
 * Run a git command inside the source directory.
 *
 * @param {string[]} args git arguments
 * @returns {string|null} trimmed stdout or null if the command failed
 */
function git(args) {
  try {
    return execFileSync("git", ["-C", SOURCE_DIR, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

/**
 * Convert a git remote URL (SSH or HTTPS) into a browsable HTTPS URL.
 *
 * @param {string} remoteUrl e.g. git@github.com:AutoAPMS/auto_apms_studio.git
 * @returns {string|null} e.g. https://github.com/AutoAPMS/auto_apms_studio
 */
export function remoteToHttpsUrl(remoteUrl) {
  if (!remoteUrl) return null;
  const url = remoteUrl.trim().replace(/\.git$/, "");
  const scp = url.match(/^[\w.-]+@([^:/]+):(.+)$/);
  if (scp) return `https://${scp[1]}/${scp[2]}`;
  const std = url.match(
    /^(?:ssh|git|https?):\/\/(?:[^@/]+@)?([^/:]+)(?::\d+)?\/(.+)$/
  );
  if (std) return `https://${std[1]}/${std[2]}`;
  return null;
}

/**
 * Determine the remote whose URL is used for links and against which the
 * pushed state is checked: the upstream of the current branch, else origin.
 */
function resolveRemote() {
  const upstream = git([
    "rev-parse",
    "--abbrev-ref",
    "--symbolic-full-name",
    "@{u}",
  ]);
  if (upstream && upstream.includes("/")) return upstream.split("/")[0];
  const remotes = (git(["remote"]) || "").split("\n").filter(Boolean);
  if (remotes.includes("origin")) return "origin";
  return remotes[0] || null;
}

/**
 * Collect version information of the frontend source at build time.
 *
 * Sources in order of precedence:
 * 1. Explicit environment variables (e.g. passed as Docker build args, where
 *    no .git directory is available): AUTO_APMS_STUDIO_GIT_SHA,
 *    AUTO_APMS_STUDIO_GIT_TAG and AUTO_APMS_STUDIO_REPO_URL.
 * 2. GitHub Actions environment (commit is pushed by definition). The
 *    triggering ref is only used if no commit is given explicitly.
 * 3. The local git repository.
 *
 * A link is only provided if the commit is known to exist upstream.
 *
 * @param {NodeJS.ProcessEnv} env environment variables
 * @returns {{label: string, sha: string|null, tag: string|null, dirty: boolean, url: string|null}}
 */
export function resolveVersionInfo(env = process.env) {
  const isRepo = git(["rev-parse", "--is-inside-work-tree"]) === "true";
  const isGitHubActions = env.GITHUB_ACTIONS === "true";

  // An explicit commit takes precedence over the ref that triggered the workflow
  const useGitHubRef = isGitHubActions && !env.AUTO_APMS_STUDIO_GIT_SHA;

  let sha =
    env.AUTO_APMS_STUDIO_GIT_SHA || (useGitHubRef && env.GITHUB_SHA) || null;
  let tag = env.AUTO_APMS_STUDIO_GIT_TAG || null;
  if (!tag && useGitHubRef && env.GITHUB_REF_TYPE === "tag")
    tag = env.GITHUB_REF_NAME;

  let repoUrl = env.AUTO_APMS_STUDIO_REPO_URL || null;
  if (
    !repoUrl &&
    isGitHubActions &&
    env.GITHUB_SERVER_URL &&
    env.GITHUB_REPOSITORY
  ) {
    repoUrl = `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}`;
  }

  // Without a repository, values provided by the build environment are trusted
  let pushed = Boolean(sha);
  let dirty = false;

  if (isRepo) {
    sha = sha || git(["rev-parse", "HEAD"]);
    tag = tag || git(["describe", "--tags", "--exact-match", sha]);
    dirty = Boolean(git(["status", "--porcelain"]));
    const remote = resolveRemote();
    if (remote) {
      repoUrl = repoUrl || remoteToHttpsUrl(git(["remote", "get-url", remote]));
      if (!isGitHubActions) {
        const containing = git([
          "for-each-ref",
          "--contains",
          sha,
          "--format=%(refname)",
          `refs/remotes/${remote}/`,
        ]);
        pushed = Boolean(containing);
      }
    } else {
      pushed = isGitHubActions;
    }
  }

  repoUrl = repoUrl || DEFAULT_REPO_URL;

  if (!sha) {
    return {
      label: "unknown version",
      sha: null,
      tag: null,
      dirty: false,
      url: null,
    };
  }

  return {
    label: (tag || sha.slice(0, 7)) + (dirty ? "-dirty" : ""),
    sha,
    tag,
    dirty,
    url: pushed ? `${repoUrl}/tree/${tag || sha}` : null,
  };
}
