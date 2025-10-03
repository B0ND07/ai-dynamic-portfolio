from django.urls import path
from .views import RegisterView, LoginView, LogoutView, ProfileView, ProjectListView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),
    path('projects/', ProjectListView.as_view(), name='projects'),
]
