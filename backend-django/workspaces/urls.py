from django.urls import path
from .views import WorkspaceListCreateView, WorkspaceDetailView, InviteMemberView

urlpatterns = [
    path("", WorkspaceListCreateView.as_view(), name="workspace-list-create"),
    path("<int:workspace_id>/", WorkspaceDetailView.as_view(), name="workspace-detail"),
    path("<int:workspace_id>/invite/", InviteMemberView.as_view(), name="workspace-invite")
]
