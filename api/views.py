# backend/api/views.py

import requests
from bs4 import BeautifulSoup
from rest_framework import viewsets
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Item
from .serializers import ItemSerializer


class ItemViewSet(viewsets.ModelViewSet):
    """
    Standard CRUD API for the Item model.
    """

    queryset = Item.objects.all().order_by("-created_at")
    serializer_class = ItemSerializer


@api_view(["GET"])
@authentication_classes([])  # disable DRF authentication for this view
@permission_classes([AllowAny])  # allow public access
def google_doc(request):
    """
    Public endpoint that returns your published Google Doc as structured JSON blocks.
    """
    PUB_URL = (
        "https://docs.google.com/document/d/e/"
        "2PACX-1vStnZyHCVj7vEF1nHss_33MsLKGKcUyfCzwxqBOhK8sZfQ-VANm2trzrRtiSU8H7R30Yly_e13qUqoL/pub?embedded=true"
    )

    resp = requests.get(PUB_URL)
    if resp.status_code != 200:
        return Response(
            {"error": f"Could not fetch published Doc (status {resp.status_code})"},
            status=resp.status_code,
        )

    soup = BeautifulSoup(resp.text, "html.parser")

    # Try to find the specific wrapper; if that fails, fall back to the full document
    container = soup.find(id="contents")
    if container is None:
        container = soup  # now safe to call find_all on this

    blocks = []
    for el in container.find_all(["h1", "h2", "h3", "p"], recursive=True):
        text = el.get_text(strip=True)
        if not text:
            continue
        blocks.append({"type": el.name, "text": text})  # 'h1', 'h2', 'p', etc.

    return Response(blocks)
