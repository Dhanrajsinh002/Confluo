import logging
from django.conf import settings
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)

CODES = {
    400: "bad_request", 401: "unauthentication", 403: "forbidden",
    404: "not_found", 405: "method_not_allowed", 429: "throttled",
}

def _body(status, code, message, fields=None):
    return { "error": { "status": status, "code": code, "message": message, "fields": fields } }

def custom_exception_handler(exec, context):
    response = exception_handler(exec, context)

    if response is None: #unhandled exception
        if settings.DEBUG:
            return None # keep Django's debug page while developing
        logger.exception("Unhandled API error", exc_info=exec)
        return Response(
            _body(500, "server_error", "Something went wrong on our side. Please try again."),
            status=500,
        )

    if isinstance(exec, ValidationError):
        data = response.data
        fields = data if isinstance(data, dict) else {"non_field_errors": data}
        response.data = _body(response.status_code, "validation_error",
                              "Please correct the errors below.", fields)
    else:
        data = response.data
        detail = data.get("detail", "Request failed.") if isinstance(data, dict) else str(data)
        response.data = _body(response.status_code,
                              CODES.get(response.status_code, "error"), str(detail))
    return response
