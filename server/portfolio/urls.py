from django.urls import path
from .views import (
    RegisterView, 
    LoginView, 
    LogoutView, 
    ProfileView, 
    ProjectListView,
    SkillListView,
    ContactMessageView,
)

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),
    
    # Project endpoints
    path('projects/', ProjectListView.as_view(), name='project-list'),
    
    # Skill endpoints
    path('skills/', SkillListView.as_view(), name='skill-list'),
    
    # Contact endpoints
    path('contact/', ContactMessageView.as_view(), name='contact'),
]
