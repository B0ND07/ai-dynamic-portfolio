from django.db import models
from django.contrib.auth.models import User
import uuid
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.postgres.fields import ArrayField

class Project(models.Model):
    STATUS_CHOICES = [
        ('published', 'Published'),
        ('draft', 'Draft'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.TextField()
    description = models.TextField(blank=True, null=True)
    image_url = models.TextField(blank=True, null=True)
    technologies = ArrayField(models.TextField(), default=list, blank=True)
    live_url = models.TextField(blank=True, null=True)
    github_url = models.TextField(blank=True, null=True)
    featured = models.BooleanField(default=False)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='published')
    views = models.IntegerField(blank=True, null=True, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'projects'
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(
                check=models.Q(status__in=['published', 'draft']),
                name='projects_status_check'
            )
        ]

    def __str__(self):
        return self.title


class Skill(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.TextField()
    category = models.TextField()
    proficiency = models.IntegerField(
        default=50,
        validators=[
            MinValueValidator(0, message="Proficiency cannot be less than 0"),
            MaxValueValidator(100, message="Proficiency cannot be greater than 100")
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'skills'
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.name} ({self.category} - {self.proficiency}%)"
