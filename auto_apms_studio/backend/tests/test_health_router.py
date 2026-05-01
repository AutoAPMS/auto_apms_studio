from fastapi.testclient import TestClient
from auto_apms_studio.backend.app.main import app


class TestHealthRouter:
    """Tests for the /health endpoint which checks the health status of the backend server."""

    def test_health_check(self):
        """
        The test verifies, using a TestClient, that a GET request to the /health endpoint returns a
        200 status code and a JSON response indicating the server is healthy.
        """
        client = TestClient(app)
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}
