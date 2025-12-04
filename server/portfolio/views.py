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
import google.generativeai as genai
from django.conf import settings
import requests
import re

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


class ProjectDetailView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, pk):
        try:
            project = Project.objects.get(id=pk)
            serializer = ProjectSerializer(project, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, pk):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            project = Project.objects.get(id=pk)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ProjectSerializer(project, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            project = Project.objects.get(id=pk)
            project.delete()
            return Response({'message': f'Project {pk} deleted'}, status=status.HTTP_200_OK)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)


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
            return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)

class AIGenerateProjectDescriptionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def fetch_github_info(self, github_url):
        """Fetch README and repo info from GitHub URL"""
        try:
            # Extract owner and repo from URL
            match = re.match(r'https?://github\.com/([^/]+)/([^/]+)/?', github_url)
            if not match:
                return None
            
            owner, repo = match.groups()
            repo = repo.rstrip('/')
            
            # Fetch README via GitHub API
            readme_url = f'https://api.github.com/repos/{owner}/{repo}/readme'
            headers = {'Accept': 'application/vnd.github.v3.raw'}
            
            readme_response = requests.get(readme_url, headers=headers, timeout=10)
            readme_content = readme_response.text if readme_response.status_code == 200 else ''
            
            # Fetch repo info
            repo_url = f'https://api.github.com/repos/{owner}/{repo}'
            repo_response = requests.get(repo_url, timeout=10)
            repo_data = repo_response.json() if repo_response.status_code == 200 else {}
            
            return {
                'readme': readme_content[:3000],  # Limit to 3000 chars
                'description': repo_data.get('description', ''),
                'language': repo_data.get('language', ''),
                'topics': repo_data.get('topics', [])
            }
        except Exception as e:
            print(f"Error fetching GitHub info: {str(e)}")
            return None
    
    def post(self, request):
        title = request.data.get('title', '')
        technologies = request.data.get('technologies', [])
        github_url = request.data.get('github_url', '')
        
        if not title:
            return Response({'error': 'Title is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Configure Gemini
            if not settings.GEMINI_API_KEY:
                return Response({'error': 'Gemini API key not configured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-2.5-flash')
            
            # Fetch GitHub info if URL provided
            github_info = None
            if github_url and 'github.com' in github_url:
                github_info = self.fetch_github_info(github_url)
            
            tech_list = ', '.join(technologies) if technologies else 'various technologies'
            
            prompt = f"""Write a professional and compelling project description for a portfolio website.

            Project Title: {title}
            Technologies Used: {tech_list}"""

            if github_info:
                prompt += f"\n\nGitHub Repository Information:"
                if github_info.get('description'):
                    prompt += f"\nRepository Description: {github_info['description']}"
                if github_info.get('language'):
                    prompt += f"\nPrimary Language: {github_info['language']}"
                if github_info.get('topics'):
                    prompt += f"\nTopics: {', '.join(github_info['topics'])}"
                if github_info.get('readme'):
                    prompt += f"\n\nREADME Content (excerpt):\n{github_info['readme']}"

            prompt += """

            Requirements:
            - Write 2-3 concise paragraphs (150-200 words total)
            - Focus on the project's purpose, key features, and technical implementation
            - Highlight the impact or value it provides
            - Use professional but engaging language
            - Make it suitable for a developer portfolio
            - Don't use markdown formatting
            - If GitHub information is provided, incorporate relevant details naturally

            Write the description now:"""
            
            # Generate description
            response = model.generate_content(prompt)
            description = response.text.strip()
            
            return Response({
                'description': description,
                'message': 'Description generated successfully',
                'used_github_info': github_info is not None
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to generate description: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)