# Importing Node Models

Node models power the workspace. The backend collects node models from two sources and returns a merged list to the frontend.

## Sources

1. **AutoAPMS Node Manifests**: discovered via `auto_apms_behavior_tree_core` resources when AutoAPMS is installed.
For this, the backend uses `get_node_manifest_resource_identities()` from `auto_apms_behavior_tree_core.resources`.
2. **BehaviorTree.CPP Native Nodes**: discovered via the native registry exposed by BehaviorTree.CPP helper packages.
AutoAPMS Studio utilizes `get_native_node_model()` from `auto_apms_behavior_tree.resources` to access the native node registry.

### How it works in detail

- `AutoAPMSLoader` reads available manifest identities using `get_node_manifest_resource_identities()` and converts `NodeManifestResource` data into the backend `NodeModel` format.
- `NativeTreeLoader` calls `get_native_node_model()` and converts native node descriptions to `NodeModel` entries.
- The `nodes` router (`GET /api/v1/node_modules/`) concatenates both lists and returns a `NodeModelList`.

### Development Notes

- `NodeModel` contains port information (`input_ports`, `output_ports`, `input_output_ports`), defaults, aliases and other metadata used by the frontend to render node configuration forms.
- To add another source, implement an adapter that returns `list[NodeModel]` and include it in the router aggregation.

### Caching and Standalone Node Editor

- The standalone web editor uses cached node models or built-in defaults if no backend is available. The backend is the source of truth when present.
- You can export your currently loaded node models to a JSON file and import them into the standalone editor. This can be done through the settings menu.

## Code Locations for Development

- **AutoAPMS Adapter**: `auto_apms_studio/backend/app/adapters/autoapms.py`
- **Native Node Model Adapter**: `auto_apms_studio/backend/app/adapters/cpp_nodes.py`
- **Router**: `auto_apms_studio/backend/app/routers/nodes.py`
- **Models**: `auto_apms_studio/backend/app/models/nodes.py`
