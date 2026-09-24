import os
import json
import base64
import re
from pillow_heif import register_heif_opener
register_heif_opener()
from typing import Dict, Tuple
from decimal import Decimal
from io import BytesIO
import anthropic
from PIL import Image, ImageOps

RECEIPT_PROMPT = """Read the text from this photo of a receipt and return only valid JSON with no other text.

Rules:
- Each item must include a "customModifiers" array. If the item has modifiers printed on the receipt (e.g. "No tomatoes", "Extra onions", "Add bacon"), list each one as {"description": "..."}. If there are no modifiers, use an empty array [].
- Use 0 for any field not found on the receipt.
- "totalPrice" per item is the line total printed on the receipt for that item (the amount charged for all units of that item combined).
- "unitPrice" per item is the price for a single unit. If the receipt only shows a line total, divide it by the quantity (e.g. line total $7.05 for quantity 3 → unitPrice 2.35, totalPrice 7.05).
- The top-level "totalPrice" is the grand total of the entire receipt (including tax and tip if on the receipt).

Return JSON in exactly this format:
{
  "items": [
    {
      "description": "Cheeseburger",
      "customModifiers": [{"description": "No tomatoes"}, {"description": "Extra onions"}],
      "quantity": 1,
      "unitPrice": 12.99,
      "totalPrice": 12.99
    }
  ],
  "subtotal": 0.00,
  "tax": 0.00,
  "taxPercentage": 0.0,
  "totalPrice": 0.00,
  "tip": 0.00,
  "tipPercentage": 0.0
}"""

# Formats natively supported by Claude's API
_CLAUDE_SUPPORTED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
# Claude API rejects images over 5 MB, and downscales anything with a long edge
# over 1568px itself, so larger images only add upload time
_MAX_IMAGE_BYTES = 5 * 1024 * 1024
_MAX_LONG_EDGE = 1568


_MOCK_DATA = {
    "items": [
        {"name": "Cheeseburger", "price": Decimal("4.25"), "quantity": 1, "customModifiers": ["Grilled 0"]},
        {"name": "Dbl-Dbl", "price": Decimal("6.10"), "quantity": 1, "customModifiers": ["Tomato"]},
        {"name": "Dbl-Dbl", "price": Decimal("6.10"), "quantity": 1, "customModifiers": ["Grilled 0", "Protein Style"]},
        {"name": "Dbl-Dbl", "price": Decimal("6.10"), "quantity": 1, "customModifiers": ["Onion", "Grilled 0"]},
        {"name": "Fry", "price": Decimal("2.35"), "quantity": 3, "customModifiers": []},
        {"name": "Animal Fry", "price": Decimal("4.75"), "quantity": 2, "customModifiers": []},
        {"name": "Med Coke", "price": Decimal("2.30"), "quantity": 1, "customModifiers": []},
        {"name": "Med Root Beer", "price": Decimal("2.30"), "quantity": 1, "customModifiers": []},
        {"name": "Reg Neapolitan Shk", "price": Decimal("3.05"), "quantity": 2, "customModifiers": []},
    ],
    "tax": Decimal("4.86"),
    "tip": Decimal("0.0"),
    "subtotal": Decimal("49.80"),
    "total": Decimal("54.66"),
}


class OCRService:
    def __init__(self):
        self._mock = os.environ.get("MOCK_OCR", "").lower() in ("1", "true", "yes")
        if not self._mock:
            self.client = anthropic.Anthropic()
            print("Anthropic client initialized successfully.")
        else:
            print("OCR mock enabled — Anthropic API will not be called.")

    def _get_media_type(self, image_bytes: bytes) -> str:
        if image_bytes[:3] == b'\xff\xd8\xff':
            return "image/jpeg"
        if image_bytes[:8] == b'\x89PNG\r\n\x1a\n':
            return "image/png"
        if image_bytes[:6] in (b'GIF87a', b'GIF89a'):
            return "image/gif"
        if image_bytes[:4] == b'RIFF' and image_bytes[8:12] == b'WEBP':
            return "image/webp"
        if image_bytes[4:8] == b'ftyp':  # HEIC/HEIF (ISOBMFF container)
            return "image/heic"
        return "image/jpeg"

    def _prepare_image(self, image_bytes: bytes) -> Tuple[bytes, str]:
        """
        Return (image_bytes, media_type) ready for the Claude API. Small images in
        a supported format pass through untouched; anything else (HEIC, or a photo
        over the API's per-image size limit) is re-encoded as a downscaled JPEG.
        """
        media_type = self._get_media_type(image_bytes)
        if media_type in _CLAUDE_SUPPORTED_TYPES and len(image_bytes) <= _MAX_IMAGE_BYTES:
            return image_bytes, media_type

        try:
            image = Image.open(BytesIO(image_bytes))
            # Phone photos store rotation in EXIF, which re-encoding drops
            image = ImageOps.exif_transpose(image).convert("RGB")
            image.thumbnail((_MAX_LONG_EDGE, _MAX_LONG_EDGE))
            output = BytesIO()
            image.save(output, format="JPEG", quality=85)
            return output.getvalue(), "image/jpeg"
        except Exception as e:
            print(f"Image conversion error: {type(e).__name__}: {e}")
            return image_bytes, media_type

    def extract_receipt_data(self, image_bytes: bytes) -> Dict:
        if self._mock:
            return _MOCK_DATA

        image_bytes, media_type = self._prepare_image(image_bytes)

        image_data = base64.standard_b64encode(image_bytes).decode("utf-8")

        message = self.client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": image_data,
                            },
                        },
                        {
                            "type": "text",
                            "text": RECEIPT_PROMPT,
                        },
                    ],
                }
            ],
        )
        text = message.content[0].text
        text = re.sub(r'^```(?:json)?\s*|\s*```$', '', text.strip())
        data = json.loads(text)
        print(f"OCR extracted data: {data}")

        items = []
        print('data', data)
        for item in data.get("items", []):
            quantity = max(int(item.get("quantity", 1)), 1)
            total_price = Decimal(str(item.get("totalPrice", 0)))
            unit_price = total_price / quantity
            items.append({
                "name": item.get("description", ""),
                "price": unit_price,
                "quantity": quantity,
                "customModifiers": [m.get("description", "") for m in item.get("customModifiers", [])],
            })

        tax = Decimal(str(data.get("tax", 0)))
        tip = Decimal(str(data.get("tip", 0)))
        total = Decimal(str(data.get("totalPrice", 0)))
        subtotal = Decimal(str(data.get("subtotal", 0)))

        return {
            "items": items,
            "tax": tax,
            "tip": tip,
            "subtotal": subtotal,
            "total": total,
        }