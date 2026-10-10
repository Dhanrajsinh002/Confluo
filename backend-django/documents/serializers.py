from rest_framework import serializers
from workspaces.models import Membership
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source="created_by.email", read_only=True)

    class Meta:
        model = Document
        fields = ["document_id", "title", "workspace", "created_by", "created_by_email", "created_at", "updated_at"]
        read_only_fields = ["created_by"]

class DocumentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["title", "workspace"]

    def validate(self, attrs):
        request = self.context["request"]
        workspace = attrs.get("workspace")
        is_member = Membership.objects.filter(user=request.user, workspace=workspace).exists()
        if not is_member:
            raise serializers.ValidationError({"workspace": "You are not a member of this workspace."})
        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        return Document.objects.create(created_by=request.user, **validated_data)

    def to_representation(self, instance):
        return DocumentSerializer(instance, context=self.context).data
