import autoapmslogo from "../../../assets/autoapms_studio_header.svg";
/**
 * Topbar component for Sidebar
 * renders the AutoAPMS logo
 *
 * @returns {React.JSX.Element} AutoAPMS logo
 * @component
 */
function SidebarHeader() {
  return (
    <div className="flex-1 relative flex justify-center items-center h-full pt-0.5">
      <img src={autoapmslogo} alt="AutoAPMS" className="h-9.5" />
    </div>
  );
}

export default SidebarHeader;
