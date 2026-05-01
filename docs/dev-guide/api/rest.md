# REST API Reference

The backend exposes a compact REST API used primarily by the frontend. Run the backend locally to access the interactive OpenAPI docs at <code>/docs</code>.

## Endpoints

- **GET** `/api/v1/node_modules/` <br>
Returns all available node models (AutoAPMS manifests and native BehaviorTree.CPP nodes).

  **Response**: JSON matching the `NodeModelList` Pydantic model (see backend models for exact schema).

  **Example excerpt**:

  ```json
  {
	"nodes": [
	  {
		"node_name": "Error",
		"class_name": "auto_apms_behavior_tree::ThrowException",
		"description": "Throws an exception to interrupt behavior tree execution",
		"package": "auto_apms_behavior_tree",
		"input_ports": [{"name":message","type":"std::string","default":"","has_default":false}]
	  }
	]
  }
  ```
--- 

- **POST** `/api/v1/upload/xml` <br>
Upload a BehaviorTree XML file. The backend validates that the file is an `.xml` file, ensures it can be decoded as UTF-8, and parses it with a safe XML parser.

  Example curl:

  ```bash
  curl -F "file=@my_tree.xml" http://localhost:8000/api/v1/upload/xml
  ```

  Success response:

  ```json
  <?xml version="1.0"?>
    <root main_tree_to_execute="MainTree">
      <BehaviorTree ID="MainTree">
        <Sequence>
          <Action ID="SaySomething" message="Hello"/>
      </Sequence>
    </BehaviorTree>
  </root>  
  ```

  <div class="custom-block warning" style="padding: 8px 12px;">
	<p style="margin: 0;">Warning: Uploaded XML files are limited to 1MB. The backend uses <code>defusedxml</code> to parse XML safely.</p>
  </div>
--- 

- **GET** `/health/`
Health check. Returns <code>{"status": "healthy"}</code> on HTTP 200.

## Notes for developers

- The backend exposes OpenAPI at `/openapi.json` which can be used to generate clients or to inspect request/response schemas.
You can also use the interactive docs at `/docs` to explore the API.
- See `auto_apms_studio/backend/app/models/nodes.py` for the full `NodeModel`/`NodeModelList` schema used by the nodes endpoint.


