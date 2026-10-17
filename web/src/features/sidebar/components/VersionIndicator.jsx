/* global __APP_VERSION__ */

/**
 * Version information injected at build time by Vite (see versionInfo.js).
 */
const VERSION_INFO =
  typeof __APP_VERSION__ !== "undefined"
    ? __APP_VERSION__
    : { label: "unknown version", sha: null, tag: null, url: null };

/**
 * VersionIndicator component
 * Displays the release tag or commit hash the frontend was built from.
 * Links to the corresponding source on GitHub if the commit has been pushed.
 *
 * @param {object} props
 * @param {object} [props.versionInfo] version information to display
 * @returns {React.JSX.Element} small version label
 * @component
 */
function VersionIndicator({ versionInfo = VERSION_INFO }) {
  const { label, sha, url } = versionInfo;
  const title = sha
    ? `Commit ${sha}${url ? "" : " (not pushed upstream)"}`
    : undefined;

  return (
    <div className="text-center text-[10px] leading-none text-gray-400 select-text">
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title={title}
          className="hover:underline"
        >
          {label}
        </a>
      ) : (
        <span title={title}>{label}</span>
      )}
    </div>
  );
}

export default VersionIndicator;
