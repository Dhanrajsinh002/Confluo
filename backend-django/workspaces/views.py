from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound, ValidationError

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
    def get_permissions(self):
        return [permissions.IsAuthenticated(), IsWorkspaceEditorOrOwner()]

    def post(self, request, workspace_id):
        workspace = get_object_or_404(Workspace, workspace_id=workspace_id)
        self.check_object_permissions(request, workspace)

        serializer = InviteMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = User.objects.get(email__iexact=serializer.validated_data["email"])
        except User.DoesNotExist:
            raise NotFound("No account found for that email. Ask them to register first.")

        _, created = Membership.objects.get_or_create(
            user=user, workspace=workspace,
            defaults={"role": serializer.validated_data["role"]},
        )
        if not created:
            raise ValidationError({"email": "This user is already a member of the workspace."})

        return Response({"message": "Member added."}, status=status.HTTP_201_CREATED)
