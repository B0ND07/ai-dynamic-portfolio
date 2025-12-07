from django.urls import path
from .views import (
    RegisterView, 
    LoginView, 
    LogoutView, 
    ProfileView, 
    ProjectListView,
    ProjectDetailView,
    SkillListView,
    ContactMessageView,
    AIGenerateProjectDescriptionView,
    ResumeListView,
    ResumeDetailView,
    AIGenerateResumeView,
)

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),
    
    # Project endpoints
    path('projects/', ProjectListView.as_view(), name='project-list'),
    path('projects/<uuid:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    
    # Skill endpoints
    path('skills/', SkillListView.as_view(), name='skill-list'),
    
    # Contact endpoints
    path('contact/', ContactMessageView.as_view(), name='contact'),
    
    # AI endpoints
    path('ai/generate-project-description/', AIGenerateProjectDescriptionView.as_view(), name='ai-generate-description'),
    path('ai/generate-resume/', AIGenerateResumeView.as_view(), name='ai-generate-resume'),
    
    # Resume endpoints
    path('resumes/', ResumeListView.as_view(), name='resume-list'),
    path('resumes/<uuid:pk>/', ResumeDetailView.as_view(), name='resume-detail'),
]
