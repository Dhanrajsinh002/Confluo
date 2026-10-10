from rest_framework import generics, permissions
from workspaces.models import Membership
from .models import Document
from .serializers import DocumentSerializer, DocumentCreateSerializer
from .permissions import IsDocumentEditorOrOwner, IsDocumentWorkspaceMember
from rest_framework.exceptions import ValidationError

class DocumentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        workspace_ids = Membership.objects.filter(user=self.request.user).values_list("workspace_id", flat=True)
        qs = Document.objects.filter(workspace_id__in=workspace_ids)
        workspace_param = self.request.query_params.get("workspace")
        if workspace_param is not None:
            if not workspace_param.isdigit():
                raise ValidationError({"workspace": "Workspace must be a numeric ID."})
            qs = qs.filter(workspace_id=int(workspace_param))
        return qs

    def get_serializer_class(self):
        return DocumentCreateSerializer if self.request.method == "POST" else DocumentSerializer

    def get_serializer_context(self):
        return {"request": self.request}

class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDocumentEditorOrOwner]
    lookup_field = "document_id"
