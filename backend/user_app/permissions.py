from rest_framework import permissions

class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
                (request.user and request.user.is_staff) or
                (request.headers.get('X-Is-Staff') == 'true')
        )

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
                (request.user and request.user.is_staff) or
                (request.headers.get('X-Is-Staff') == 'false')
        )
