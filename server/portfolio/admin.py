from django.contrib import admin
from .models import Project, Skill, Profile, ContactMessage, Resume

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'featured', 'status', 'created_at')
    list_filter = ('status', 'featured')
    search_fields = ('title', 'description', 'technologies')

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'proficiency', 'created_at')
    list_filter = ('category',)
    search_fields = ('name', 'category')

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'user', 'email', 'created_at')
    search_fields = ('full_name', 'email', 'user__username')

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'subject', 'email', 'read', 'created_at')
    list_filter = ('read', 'created_at')
    search_fields = ('name', 'subject', 'message', 'email')

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'target_role', 'created_at')
    search_fields = ('title', 'target_role', 'user__username')
