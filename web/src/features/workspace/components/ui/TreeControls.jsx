import { ControlButton, Controls, useReactFlow } from "@xyflow/react";
import { AlignVerticalDistributeCenter } from "lucide-react";

export default function TreeControls({ onLayout }) {
  const { getNodes, getEdges } = useReactFlow();
  return (
    <Controls
      position="bottom-right"
      className="!right-5 !bottom-5 !m-0 border border-divider rounded-md"
    >
      <ControlButton
        onClick={() => onLayout("DOWN", false, getNodes(), getEdges())}
        title="Align Vertical"
      >
        <AlignVerticalDistributeCenter />
      </ControlButton>
    </Controls>
  );
}
