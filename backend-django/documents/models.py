from django.db import models
from django.conf import settings
from workspaces.models import Workspace

class Document(models.Model):
    document_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255, default="Untitled Document")
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name="documents"
    ),
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_documents"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class DocumentSnapshot(models.Model):
    """Periodic saved snapshot of YJs document state, for persistance/recovery"""
    snapshot_id = models.AutoField(primary_key=True)
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name="snapshots"
    )
    content = models.BinaryField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Snapshot of {self.document.title} at {self.created_at}"
