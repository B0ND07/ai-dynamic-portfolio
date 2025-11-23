from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Project, Skill, Profile, ContactMessage
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    ProjectSerializer,
    SkillSerializer,
    ProfileSerializer,
    ContactMessageSerializer,
)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            Profile.objects.create(
                user=user,
                email=user.email,
                full_name=user.username  
            )
            
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'User registered successfully and profile created',
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        # user = request.user
        
        # If user is authenticated, return their profile
        # if user.is_authenticated:
        #     try:
        #         profile = Profile.objects.get(user=user)
        #         serializer = ProfileSerializer(profile)
        #         return Response(serializer.data, status=status.HTTP_200_OK)
        #     except Profile.DoesNotExist:
        #         return Response({
        #             'username': user.username,
        #             'email': user.email,
        #             'message': 'Profile not found. Please create a profile.'
        #         }, status=status.HTTP_404_NOT_FOUND)
        
        # If not authenticated, return the first profile (for portfolio display)
        try:
            profile = Profile.objects.first()
            if profile:
                serializer = ProfileSerializer(profile)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'No profile found. Please register and create a profile.'
                }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        user = request.user
        try:
            profile = Profile.objects.get(user=user)
        except Profile.DoesNotExist:
            profile = Profile.objects.create(user=user)
        
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        projects = Project.objects.order_by('-created_at')
        serializer = ProjectSerializer(projects, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        id = request.data.get('id')
        try:
            project = Project.objects.get(id=id)
            project.delete()
            return Response({'message': f'project deleted {id}'}, status=status.HTTP_200_OK)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        project_id = request.data.get('id')
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ProjectSerializer(project, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SkillListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        skills = Skill.objects.all()
        
        # Order by proficiency (descending) by default
        order = request.query_params.get('order', '-proficiency')
        skills = skills.order_by(order, 'name')
        
        serializer = SkillSerializer(skills, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        serializer = SkillSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        id = request.data.get('id')
        try:
            skill = Skill.objects.get(id=id)
            skill.delete()
            return Response({'message': f'Skill {id} deleted'}, status=status.HTTP_200_OK)
        except Skill.DoesNotExist:
            return Response({'error': 'Skill not found'}, status=status.HTTP_404_NOT_FOUND)

    
    def put(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        skill_id = request.data.get('id')
        try:
            skill = Skill.objects.get(id=skill_id)
        except Skill.DoesNotExist:
            return Response({'error': 'Skill not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = SkillSerializer(skill, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ContactMessageView(APIView):
    permission_classes = [AllowAny] 
    
    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Your message has been sent successfully!',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        messages = ContactMessage.objects.all()
        serializer = ContactMessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        id = request.data.get('id')
        try:
            message = ContactMessage.objects.get(id=id)
            message.delete()
            return Response({'message': f'Contact message {id} deleted'}, status=status.HTTP_200_OK)
        except ContactMessage.DoesNotExist:
            return Response({'error': 'Contact message not found'}, status=status.HTTP_404_NOT_FOUND)