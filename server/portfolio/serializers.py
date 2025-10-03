from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Project

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
            'technologies',
            'github_link',
            'live_link',
            'image',
            'created_at',
            'updated_at',
        )
