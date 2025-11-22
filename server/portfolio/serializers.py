from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Project, Skill, Profile, ContactMessage

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords don't match")
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Incorrect Credentials")

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = (
            'id',
            'title',
            'description',
            'image_url',
            'technologies',
            'live_url',
            'github_url',
            'featured',
            'status',
            'views',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'views', 'created_at', 'updated_at')


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ('id', 'name', 'category', 'proficiency', 'created_at')
        read_only_fields = ('id', 'created_at')
    
    def validate_proficiency(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Proficiency must be between 0 and 100")
        return value


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Profile
        fields = (
            'id',
            'username',
            'user_email',
            'full_name',
            'bio',
            'avatar_url',
            'github_url',
            'linkedin_url',
            'email',
            'created_at',
            'updated_at',
            'title',
            'phone',
            'location',
            'website_url',
            'twitter_url',
            'cv_url',
            'years_experience',
            'current_company',
            'current_position',
            'education',
            'certifications',
            'footer_description',
            'services_list',
            'quick_links',
            'copyright_text',
            'footer_social_github',
            'footer_social_linkedin',
            'footer_social_email',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ('id', 'name', 'email', 'subject', 'message', 'read', 'created_at')
        read_only_fields = ('id', 'read', 'created_at')

