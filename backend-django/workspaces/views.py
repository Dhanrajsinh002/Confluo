from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

from .models import Workspace, Membership
from .serializers import WorkspaceSerializer, WorkspaceCreateSerializer, InviteMemberSerializer
from .permissions import IsWorkspaceMember, IsWorkspaceEditorOrOwner

user = get_user_model()

class WorkspaceListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Workspace.objects.filter(memberships__user=self.request.user)

    def get_serializer_class(self):
        return WorkspaceCreateSerializer if self.request.method == "POST" else WorkspaceSerializer

    def get_serializer_context(self):
        return {"request": self.request}

class  WorkspaceDetailView(generics.RetrieveAPIView):
    query_set = Workspace.objects.all()
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]
    lookup_field = "workspace_id"

class InviteMemberView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, workspace_id):
        workspace = Workspace.objects.get(workspace_id=workspace_id)
        self.check_object_permissions(request, workspace)

        serializer = InviteMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = User.objects.get(email=serializer.validated_data["email"])
        except User.DoesNotExists:
            return Response({"error": "User not found!"}, status=status.HTTP_404_NOT_FOUND)

        membership, created = Workspace.objects.get_or_create(
            user=user,
            workspace=workspace,
            defaults={role: serializer.validated_data["role"]},
        )

        if not created:
            return Response({"error": "User is already a member of this workspace."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Member added."}, status=status.HTTP_201_CREATED)

    def get_permissions(self):
        return [permissions.IsAuthenticated(), IsWorkspaceEditorOrOwner()]
