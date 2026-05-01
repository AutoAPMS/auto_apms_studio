# Migrating from Groot2 / BehaviorTree.CPP

AutoAPMS Studio uses the same BehaviorTree.CPP XML format as Groot2. Most trees exported from Groot2 will work out of the box, but there are a few integration points to check.
AutoAPMS Studio itself, utilizes additional parameters in the XML format to support features like node manifests and custom nodes. 

## Key Differences

- **XML file format**: AutoAPMS Studio targets BehaviorTree.CPP v4 XML — Groot2 exports are typically compatible.
- **Node availability**: AutoAPMS Studio merges native BehaviorTree.CPP nodes with AutoAPMS Node Manifests. If your trees use custom ROS 2 nodes, make sure their manifests are available to AutoAPMS so the backend can expose them.

## Migration Checklist

1. Export your Behavior Tree from Groot2 as XML.
2. If the tree uses custom nodes, ensure those nodes are packaged with AutoAPMS Node Manifests or available in the native registry. If they are unavailable, you will need to add them to the registry. Please check [this Guide](https://autoapms.github.io/auto-apms-guide/tutorial/implementing-behavior-tree-nodes) for more details on how to do this.
3. Start the backend in a ROS 2 environment with AutoAPMS and your packages sourced, or run the frontend and upload the XML for a quick check.
4. If nodes are reported as unknown in the frontend, inspect backend logs for adapter warnings (missing imports or manifest load errors). The Frontend will also show useful error warnings in the top right corner.
