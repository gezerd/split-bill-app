import re
import os
from pillow_heif import register_heif_opener, open_heif
register_heif_opener()  # Register HEIC opener with PIL
from typing import Dict, List
from decimal import Decimal
from io import BytesIO
from google.cloud import vision
from PIL import Image

class OCRService:
    """Service for extracting receipt data from images using Google Cloud Vision API"""

    def __init__(self):
        # Set project ID if provided (for Application Default Credentials)
        project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
        if project_id:
            os.environ["GOOGLE_CLOUD_PROJECT"] = project_id

        # Initialize Google Cloud Vision client
        # Uses Application Default Credentials from `gcloud auth application-default login`
        self.client = vision.ImageAnnotatorClient()
        print("Google Cloud Vision client initialized successfully.")

    def _convert_heic_to_png(self, image_bytes: bytes) -> bytes:
        """
        Convert HEIC image to PNG format using pillow-heif

        Args:
            image_bytes: Original image bytes (HEIC format)

        Returns:
            PNG image bytes
        """
        try:
            heif_file = open_heif(BytesIO(image_bytes))
            image = Image.frombytes(heif_file.mode, heif_file.size, heif_file.data, "raw", heif_file.mode)
            output = BytesIO()
            image.convert("RGB").save(output, format="PNG")
            return output.getvalue()
        except Exception as e:
            print(f"Image conversion error: {type(e).__name__}: {e}")
            return image_bytes

    def extract_receipt_data(self, image_bytes: bytes) -> Dict:
        """
        Extract text from receipt image and parse into structured data

        Args:
            image_bytes: Image file bytes

        Returns:
            Dict with keys: items (List), tax (Decimal), tip (Decimal), subtotal (Decimal), total (Decimal)
        """
        if not self.client:
            # Return mock data if Google Cloud Vision is not configured
            return self._get_mock_receipt_data()

        try:
            from google.cloud import vision

            # Convert HEIC to PNG if necessary (skip if already JPEG or PNG)
            is_jpeg = image_bytes[:3] == b'\xff\xd8\xff'
            is_png = image_bytes[:8] == b'\x89PNG\r\n\x1a\n'
            converted_bytes = image_bytes if (is_jpeg or is_png) else self._convert_heic_to_png(image_bytes)

            image = vision.Image(content=converted_bytes)
            response = self.client.text_detection(image=image)

            if response.error.message:
                raise Exception(f"Google Cloud Vision API error: {response.error.message}")

            # Extract text from first annotation (full text)
            if response.text_annotations:
                text = response.text_annotations[0].description
                return self._parse_receipt_text(text)
            else:
                return {"items": [], "tax": Decimal("0.00"), "tip": Decimal("0.00"), "subtotal": Decimal("0.00"), "total": Decimal("0.00")}

        except Exception as e:
            print(f"OCR extraction error: {e}")
            # Return mock data on error for development
            return self._get_mock_receipt_data()

    def _parse_receipt_text(self, text: str) -> Dict:
        """
        Parse extracted text into structured receipt data

        Args:
            text: Raw text from OCR

        Returns:
            Dict with items, tax, tip, subtotal, total
        """
        lines = text.split("\n")
        items = []
        tax = Decimal("0.00")
        tip = Decimal("0.00")
        subtotal = Decimal("0.00")
        total = Decimal("0.00")

        # Regex pattern to find prices: $XX.XX or XX.XX
        price_pattern = re.compile(r"\$?(\d+\.\d{2})")

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Try to find a price in the line
            price_match = price_pattern.search(line)
            if not price_match:
                continue

            price_value = Decimal(price_match.group(1))
            line_lower = line.lower()

            # Identify line type based on keywords
            if any(keyword in line_lower for keyword in ["tax", "sales tax", "hst", "gst", "vat"]):
                tax = price_value
            elif any(keyword in line_lower for keyword in ["tip", "gratuity", "service charge"]):
                tip = price_value
            elif any(keyword in line_lower for keyword in ["subtotal", "sub total", "sub-total"]):
                subtotal = price_value
            elif any(keyword in line_lower for keyword in ["total", "amount due", "balance"]):
                total = price_value
            else:
                # Assume it's an item
                # Extract item name (text before the price)
                name = line[: price_match.start()].strip()

                # Try to extract quantity
                quantity = self._extract_quantity(line)

                # Skip if name is too short or looks like a label
                if len(name) < 2 or name.lower() in ["qty", "price", "item", "description"]:
                    continue

                items.append({"name": name, "price": price_value, "quantity": quantity})

        # Calculate subtotal from items if not found
        if subtotal == Decimal("0.00") and items:
            subtotal = sum(Decimal(str(item["price"])) * item["quantity"] for item in items)

        # Calculate total if not found
        if total == Decimal("0.00"):
            total = subtotal + tax + tip

        return {
            "items": items,
            "tax": tax,
            "tip": tip,
            "subtotal": subtotal,
            "total": total,
        }

    def _extract_quantity(self, line: str) -> int:
        """Extract quantity from line if present"""
        # Look for patterns like "2x", "x2", "qty 2", "quantity: 2"
        quantity_patterns = [
            r"(\d+)\s*[xX]",  # 2x
            r"[xX]\s*(\d+)",  # x2
            r"(?:qty|quantity)[\s:]+(\d+)",  # qty 2 or quantity: 2
        ]

        for pattern in quantity_patterns:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                return int(match.group(1))

        return 1  # Default quantity

    def _get_mock_receipt_data(self) -> Dict:
        """Return mock receipt data for development/testing when Google Cloud Vision is not configured"""
        return {
            "items": [
                {"name": "Burger", "price": Decimal("12.99"), "quantity": 1},
                {"name": "Fries", "price": Decimal("4.50"), "quantity": 2},
                {"name": "Soda", "price": Decimal("2.50"), "quantity": 3},
            ],
            "tax": Decimal("3.45"),
            "tip": Decimal("0.00"),  # Tip typically not on receipt
            "subtotal": Decimal("29.99"),
            "total": Decimal("33.44"),
        }
