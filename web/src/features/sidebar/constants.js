import { Rocket, Globe, Split, Sparkles, Sprout } from "lucide-react";

/**
 * Color and Icon mapping for Behavior Tree Node Types
 */
export const NODE_TYPE_CONFIG = {
  "NodeType.ACTION": {
    label: "Action",
    color: "#05b8cf",
    icon: Rocket,
  },
  "NodeType.CONDITION": {
    label: "Condition",
    color: "#FAAC68",
    icon: Split,
  },
  "NodeType.DECORATOR": {
    label: "Decorator",
    color: "#FACE68",
    icon: Sparkles,
  },
  "NodeType.CONTROL": {
    label: "Control",
    color: "#f02a6c",
    icon: Globe,
  },
  "NodeType.SUBTREE": {
    label: "Subtree",
    color: "#89c455",
    icon: Sprout,
  },
};

/**
 * Default colors for specific UI elements in the sidebar
 */
export const SIDEBAR_COLORS = {
  NODE_MODELS: "#05b8cf",
  BEHAVIOR_TREES: "#f02a6c",
};

/**
 * Default empty tree with a single AlwaysSuccess node.
 */
export const EMPTY_TREE_TEMPLATE_Json = {
  id: "new empty tree",
  treeData: {
    BehaviorTree: {
      AlwaysSuccess: [],
    },
  },
};

/**
 * Default XML project values.
 * Used when creating a new project without an imported XML file.
 */
export const DEFAULT_XML_DECLARATION = {
  "?xml": [{ "#text": "" }],
  ":@": {
    "@_version": "1.0",
    "@_encoding": "UTF-8",
  },
};

export const DEFAULT_ROOT_ATTRS = {
  "@_BTCPP_format": "4",
};
