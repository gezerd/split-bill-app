import os
from io import BytesIO

from PIL import Image

from app.services.ocr_service import OCRService, _MAX_IMAGE_BYTES, _MAX_LONG_EDGE


def _noisy_jpeg(width, height):
    # Random pixels compress poorly, so a large image stays large as JPEG
    image = Image.frombytes("RGB", (width, height), os.urandom(width * height * 3))
    output = BytesIO()
    image.save(output, format="JPEG", quality=95)
    return output.getvalue()


def test_prepare_image_downscales_large_jpeg_under_api_limit():
    original = _noisy_jpeg(4000, 3000)
    assert len(original) > _MAX_IMAGE_BYTES

    image_bytes, media_type = OCRService()._prepare_image(original)

    assert media_type == "image/jpeg"
    assert len(image_bytes) <= _MAX_IMAGE_BYTES
    assert max(Image.open(BytesIO(image_bytes)).size) <= _MAX_LONG_EDGE


def test_prepare_image_passes_small_supported_image_through():
    output = BytesIO()
    Image.new("RGB", (800, 600), "white").save(output, format="PNG")
    original = output.getvalue()

    image_bytes, media_type = OCRService()._prepare_image(original)

    assert image_bytes == original
    assert media_type == "image/png"
