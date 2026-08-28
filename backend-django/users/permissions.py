from rest_framework.permissions import BasePermission

class IsSelf(BasePermission):
    """ restrict object level view to the owning user only. """

    def has_object_permission(self, request, view, obj):
        return obj == request.user