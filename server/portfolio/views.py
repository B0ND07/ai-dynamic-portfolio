from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Project, Skill, Profile, ContactMessage, Resume
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    ProjectSerializer,
    SkillSerializer,
    ProfileSerializer,
    ContactMessageSerializer,
    ResumeSerializer,
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


# Resume Management Views
class ResumeListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        resumes = Resume.objects.filter(user=request.user).order_by('-created_at')
        serializer = ResumeSerializer(resumes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = ResumeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResumeDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        try:
            resume = Resume.objects.get(id=pk, user=request.user)
            serializer = ResumeSerializer(resume)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Resume.DoesNotExist:
            return Response({'error': 'Resume not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, pk):
        try:
            resume = Resume.objects.get(id=pk, user=request.user)
        except Resume.DoesNotExist:
            return Response({'error': 'Resume not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ResumeSerializer(resume, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        try:
            resume = Resume.objects.get(id=pk, user=request.user)
            resume.delete()
            return Response({'message': f'Resume {pk} deleted'}, status=status.HTTP_200_OK)
        except Resume.DoesNotExist:
            return Response({'error': 'Resume not found'}, status=status.HTTP_404_NOT_FOUND)


class AIGenerateResumeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        target_role = request.data.get('target_role', '')
        job_description = request.data.get('job_description', '')
        technologies = request.data.get('technologies', [])
        projects_data = request.data.get('projects_data', [])
        experience_data = request.data.get('experience_data', [])
        education_data = request.data.get('education_data', [])
        skills_data = request.data.get('skills_data', [])
        certifications_data = request.data.get('certifications_data', [])
        summary = request.data.get('summary', '')
        format_type = request.data.get('format', 'markdown')
        
        if not target_role:
            return Response({'error': 'Target role is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            if not settings.GEMINI_API_KEY:
                return Response({'error': 'Gemini API key not configured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-2.5-flash')
            
            # Get user profile for contact info
            profile = Profile.objects.filter(user=request.user).first()
            
            # Get contact information from request or profile
            name = request.data.get('name') or (profile.full_name if profile and profile.full_name else request.user.username)
            phone = request.data.get('phone') or (profile.phone if profile and profile.phone else '')
            email = request.data.get('email') or (profile.email if profile and profile.email else request.user.email)
            linkedin = request.data.get('linkedin') or (profile.linkedin_url if profile and profile.linkedin_url else '')
            github = request.data.get('github') or (profile.github_url if profile and profile.github_url else '')
            
            # Build contact line
            contact_parts = [phone] if phone else []
            contact_parts.append(email)
            if linkedin:
                contact_parts.append('LinkedIn')
            if github:
                contact_parts.append('GitHub')
            contact_line = ' | '.join(contact_parts)
            
            # Build comprehensive prompt with professional resume structure
            bullet_char = '•'
            newline_char = '\n'
            
            summary_section = f"2. PROFESSIONAL SUMMARY:{newline_char}   - Write a compelling 2-3 line professional summary highlighting key strengths{newline_char}{newline_char}3. EDUCATION:" if summary else "2. EDUCATION:"
            
            prompt = f"""Generate a professional, ATS-friendly resume for the role: {target_role}

IMPORTANT: Follow this exact structure and format:"""

            # Add job description analysis if provided
            if job_description:
                prompt += f"""

JOB DESCRIPTION ANALYSIS:
{job_description}

CRITICAL ATS REQUIREMENTS:
- Extract and incorporate KEY SKILLS, TECHNOLOGIES, and QUALIFICATIONS mentioned in the job description
- Use exact terminology from the job description where applicable
- Match keywords for ATS (Applicant Tracking Systems) compatibility
- Prioritize experiences and projects that align with job requirements
- Highlight relevant achievements that match the job's focus areas
"""
            else:
                prompt += f"""

ATS OPTIMIZATION:
- Use industry-standard keywords for {target_role}
- Include relevant technical skills and frameworks
- Quantify achievements where possible
"""

            prompt += f"""

1. HEADING (Center-aligned):
   - Full Name: {name} (Large, Bold)
   - Contact: {contact_line} (Use EXACTLY this text, do NOT add URLs or modify the text)
   {f"IMPORTANT: When you write 'LinkedIn' and 'GitHub', use ONLY these words as text. DO NOT write out the full URLs in the contact line." if (linkedin or github) else ""}

{summary_section}
   - List education in reverse chronological order
   - Format: Institution Name, Location
            Degree, Field of Study, Dates
"""

            if education_data:
                for edu in education_data:
                    prompt += f"""   - {edu.get('institution', 'N/A')}, Location
     {edu.get('degree', 'N/A')}, {edu.get('year', 'N/A')}
"""
            else:
                prompt += "   [Generate realistic education entries based on role requirements]\n"

            experience_section_num = "4" if summary else "3"
            prompt += f"{newline_char}{experience_section_num}. EXPERIENCE:{newline_char}   - List MAXIMUM 2 most recent/relevant positions in reverse chronological order{newline_char}   - Format: Job Title, Duration{newline_char}            Company Name, Location{newline_char}            {bullet_char} 3-5 bullet points per position with specific achievements{newline_char}            {bullet_char} Start each bullet with action verbs{newline_char}            {bullet_char} Quantify results where possible{newline_char}{newline_char}"

            if experience_data:
                for exp in experience_data:
                    prompt += f"""   Experience: {exp.get('position', 'N/A')}, {exp.get('duration', 'N/A')}
   Company: {exp.get('company', 'N/A')}
   Description: {exp.get('description', 'N/A')}
"""
            else:
                prompt += "   [Generate 2 realistic experience entries relevant to the target role]\n"

            projects_section_num = "5" if summary else "4"
            prompt += f"{newline_char}{projects_section_num}. PROJECTS:{newline_char}   - Format: Project Name (BOLD) with Date on right, on SAME line{newline_char}            Technologies (ITALIC) on NEXT line below project name{newline_char}            Then {bullet_char} Bullet points describing implementation{newline_char}   - Example:{newline_char}     E-commerce Platform, March 2023 - Present{newline_char}     React, TypeScript, Django, PostgreSQL{newline_char}     {bullet_char} Built full-stack application...{newline_char}{newline_char}"

            if projects_data:
                for proj in projects_data:
                    prompt += f"""   Project: {proj.get('name', 'N/A')} | {proj.get('technologies', 'N/A')}
   Description: {proj.get('description', 'N/A')}
"""
            else:
                prompt += "   [Generate 2-3 relevant projects based on technologies and role]\n"

            skills_section_num = "6" if summary else "5"
            
            # Handle skills_data which is now an array of {category, items} objects
            skills_text = ""
            if skills_data and isinstance(skills_data, list) and len(skills_data) > 0:
                for skill_cat in skills_data:
                    if isinstance(skill_cat, dict):
                        category = skill_cat.get('category', '')
                        items = skill_cat.get('items', [])
                        if isinstance(items, list):
                            items_str = ', '.join(items)
                        else:
                            items_str = str(items)
                        if category and items_str:
                            skills_text += f"   - {category}: {items_str}\n"
            
            if skills_text:
                prompt += f"\n{skills_section_num}. TECHNICAL SKILLS:\n{skills_text}\n"
            else:
                prompt += f"""
{skills_section_num}. TECHNICAL SKILLS:
   - Languages: {', '.join([t for t in technologies if any(lang in t.lower() for lang in ['python', 'java', 'javascript', 'c++', 'c#', 'sql', 'html', 'css', 'r', 'go', 'rust', 'typescript'])]) if technologies else 'List relevant programming languages'}
   - Frameworks: {', '.join([t for t in technologies if any(fw in t.lower() for fw in ['react', 'angular', 'vue', 'django', 'flask', 'node', 'express', 'spring', 'fastapi', '.net'])]) if technologies else 'List relevant frameworks'}
   - Developer Tools: {', '.join([t for t in technologies if any(tool in t.lower() for tool in ['git', 'docker', 'kubernetes', 'jenkins', 'aws', 'azure', 'gcp', 'vscode', 'intellij'])]) if technologies else 'List relevant developer tools'}
   - Libraries: {', '.join([t for t in technologies if any(lib in t.lower() for lib in ['pandas', 'numpy', 'tensorflow', 'pytorch', 'jest', 'junit', 'redux'])]) if technologies else 'List relevant libraries'}
"""

            if certifications_data and any(certifications_data):
                cert_section_num = "7" if summary else "6"
                prompt += f"\n{cert_section_num}. CERTIFICATIONS:\n{chr(10).join([f'   - {cert}' for cert in certifications_data if cert])}\n"

            if summary:
                prompt += f"\nUse this for PROFESSIONAL SUMMARY section (place after heading, before EDUCATION):\n{summary}\n"

            prompt += f"""

FORMAT REQUIREMENTS for {format_type}:
{'- Use Markdown headers (##), bold (**text**), bullet points (-)' if format_type == 'markdown' else '- Use plain text with clear section separators (===), bullet points (•)'}

CONTENT REQUIREMENTS:
- Tailor ALL content specifically for {target_role} position
- Use industry-standard action verbs (Developed, Implemented, Designed, Architected, Led, etc.)
- Quantify achievements with metrics (%, numbers, scale) where possible
- Make it ATS-friendly: use keywords from job description for {target_role}
{f'- IMPORTANT: Incorporate relevant keywords and requirements from the provided job description' if job_description else ''}
- Keep bullet points concise (1-2 lines each)
- Ensure content fits 1-2 pages
- Maintain professional, confident tone
- No personal pronouns (I, me, my)

Generate the COMPLETE resume now following the professional template structure exactly:"""
            
            response = model.generate_content(prompt)
            generated_resume = response.text.strip()
            
            return Response({
                'generated_content': generated_resume,
                'message': 'Resume generated successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to generate resume: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

