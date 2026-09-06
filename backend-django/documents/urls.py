from django.urls import path
from .views import DocumentListCreateView, DocumentDetailView

urlpatterns = [
    path("", DocumentListCreateView.as_view(), name="document-list-create"),
    path("<int:document_id>/", DocumentDetailView.as_view(), name="document-detail")
]