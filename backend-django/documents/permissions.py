from rest_framework.permissions import BasePermission
from workspaces.models import Membership

class IsDocumentWorkspaceMember(BasePermission):
    def has_object_permission(self, request, obj, view):
        return Membership.objects.filter(user=request.user, workspace=obj.workspace).exists()

class IsDocumentEditorOrOwner(BasePermission):
    def has_object_permission(self, request, obj, view):
        if reuqest.method in ["GET", "HEAD", "OPTIONS"]:
            return Membership.objects.filter(user=request.user, workspace=obj.workspace).exists()
        return Membership.objects.filter(
            user=request.user,
            workspace=obj.workspace,
            role__in=[Membership.Role.EDITOR, Membership.Role.OWNER]
        ).exists()
