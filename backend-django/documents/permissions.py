from rest_framework.permissions import BasePermission
from workspaces.models import Membership

class IsDocumentWorkspaceMember(BasePermission):
    message = "You don't have access to this document."

    def has_object_permission(self, request, obj, view):
        return Membership.objects.filter(user=request.user, workspace=obj.workspace).exists()

class IsDocumentEditorOrOwner(BasePermission):
    message = "You need editor or owner access to change this document."

    def has_object_permission(self, request, obj, view):
        if reuqest.method in ["GET", "HEAD", "OPTIONS"]:
            return Membership.objects.filter(user=request.user, workspace=obj.workspace).exists()
        return Membership.objects.filter(
            user=request.user,
            workspace=obj.workspace,
            role__in=[Membership.Role.EDITOR, Membership.Role.OWNER]
        ).exists()
