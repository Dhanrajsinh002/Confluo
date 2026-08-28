from rest_framework import serializers
from .models import Workspace, Membership

class MembershipSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Membership
        fields = ["membership_id", "user", "email", "username", "workspace", "role", "joined_at"]
        read_only_fields = ["username"]

class WorkspaceSerializer(serializers.ModelSerializer):
    members = MembershipSerializer(source="memberships", many=True, read_only=True)

    class Meta:
        model = Workspace
        fields = ["workspace_id", "name", "owner", "created_at", "updated_at", "members"]
        read_only_fields = ["owner"]

class WorkspaceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = ["name"]

    def create(self, validated_data):
        request = self.context["request"]
        workspace = Workspace.objects.create(owner=request.user, **validated_data)
        Membership.objects.create(user=request.user, workspace=workspace, role=Membership.Role.OWNER)
        return workspace

class InviteMemberSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=Membership.Role.choices, default=Membership.Role.VIEWER)
