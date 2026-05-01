import io
from fastapi.testclient import TestClient
from auto_apms_studio.backend.app.main import app


class TestUploadRouter:
    client = TestClient(app)

    def test_upload_valid_xml(self):
        xml_content = b"<?xml version='1.0'?><root><tree /></root>"
        response = self.client.post(
            "/api/v1/upload/xml",
            files={"file": ("test.xml", io.BytesIO(xml_content), "application/xml")},
        )
        assert response.status_code == 200
        data = response.json()
        assert "xml" in data
        assert data["filename"] == "test.xml"

    def test_upload_invalid_file_type(self):
        response = self.client.post(
            "/api/v1/upload/xml",
            files={"file": ("test.txt", io.BytesIO(b"hello"), "text/plain")},
        )
        assert response.status_code == 400
        assert "Invalid file type" in response.json()["detail"]

    def test_upload_file_too_large(self):
        large_content = b"<root/>" + b"x" * (1024 * 1024 + 1)
        response = self.client.post(
            "/api/v1/upload/xml",
            files={"file": ("test.xml", io.BytesIO(large_content), "application/xml")},
        )
        assert response.status_code == 400
        assert "too large" in response.json()["detail"]

    def test_upload_invalid_utf8(self):
        response = self.client.post(
            "/api/v1/upload/xml",
            files={"file": ("test.xml", io.BytesIO(b"\xff\xfe"), "application/xml")},
        )
        assert response.status_code == 400
        assert "UTF-8" in response.json()["detail"]

    def test_upload_invalid_xml(self):
        response = self.client.post(
            "/api/v1/upload/xml",
            files={
                "file": (
                    "test.xml",
                    io.BytesIO(b"not valid xml <<<"),
                    "application/xml",
                )
            },
        )
        assert response.status_code == 400
        assert "unable to parse" in response.json()["detail"]
