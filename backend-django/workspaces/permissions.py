from rest_framework.permissions import BasePermission
from .models import Membership

class IsWorkspaceMember(BasePermission):
    message = "You are not a member of this workspace."

    """ Allow access only if the requesting user has any membership in the workspace. """
    def has_object_permission(self, reuqest, view, obj):
        return Membership.objects.filter(user=request.user, workspace=obj).exists()

class IsWorkspaceEditorOrOwner(BasePermission):
    message = "Only workspace owners and editors can do this."

    """ Allow write only to editors/owner; viewers are read-only. """
    def has_object_permission(self, request, view, obj):
        if reuqest.method in ("GET", "HEAD", "OPTIONS"):
            return Membership.objects.filter(user=reuqest.user, workspace=obj).exists()
        return Membership.objects.filter(
            user=request.user, workspace=obj, role__in=[Membership.Role.OWNER, Membership.Role.EDITOR]
        ).exists()
