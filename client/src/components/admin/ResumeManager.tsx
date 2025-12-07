import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, Trash2, Download, Sparkles, Edit, Copy } from "lucide-react";
import { resumeService, aiService, authService, projectService, skillService } from "@/lib/api";
import { jsPDF } from "jspdf";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Resume {
  id: string;
  title: string;
  target_role: string;
  generated_content?: string;
  created_at: string;
  format: string;
  linkedin?: string;
  github?: string;
}

const ResumeManager = () => {
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    target_role: "",
    job_description: "",
    name: "",
    phone: "",
    email: "",
    linkedin: "",
    github: "",
    summary: "",
    technologies: "",
    skills: "",
    format: "markdown",
    projects: [{ name: "", technologies: "", description: "", github_link: "" }],
    experience: [{ company: "", position: "", duration: "", description: "" }],
    education: [{ degree: "", institution: "", year: "" }],
    certifications: [""],
    skillCategories: [{ category: "", items: "" }],
    generated_content: "",
  });

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      // Fetch profile data for contact information
      const profile = await authService.getProfile();
      
      // Fetch projects and skills if not already provided
      const portfolioProjects = await projectService.list();
      const portfolioSkills = await skillService.list();

      // Auto-fill form data if fields are empty
      setFormData(prev => ({
        ...prev,
        name: prev.name || profile.user?.username || "",
        email: prev.email || profile.user?.email || "",
        github: prev.github || profile.github_url || "",
        linkedin: prev.linkedin || profile.linkedin_url || "",
        phone: prev.phone || profile.phone || "",
        summary: prev.summary || profile.bio || "",
        // Only populate projects if the initial empty project is still there
        projects: prev.projects.length === 1 && !prev.projects[0].name && portfolioProjects.length > 0
          ? portfolioProjects.map((p: any) => ({
              name: p.title || "",
              technologies: Array.isArray(p.technologies) ? p.technologies.join(", ") : p.technologies || "",
              description: p.description || "",
              github_link: p.github_url || ""
            }))
          : prev.projects,
        // Only populate skills if the initial empty category is still there
        skillCategories: prev.skillCategories.length === 1 && !prev.skillCategories[0].category && portfolioSkills.length > 0
          ? portfolioSkills.map((s: any) => ({
              category: s.category || "Skills",
              items: s.name || ""
            }))
          : prev.skillCategories,
      }));
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      // Don't show error toast - portfolio data is optional
    }
  };

  const fetchResumes = async () => {
    try {
      setIsLoading(true);
      const data = await resumeService.list();
      setResumes(data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast({
        title: "Error",
        description: "Failed to load resumes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateResume = async () => {
    if (!formData.target_role) {
      toast({
        title: "Target Role Required",
        description: "Please enter a target role first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Fetch portfolio data only for missing fields
    try {
      await fetchPortfolioData();
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    }
    try {
      const requestData = {
        target_role: formData.target_role,
        job_description: formData.job_description,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        linkedin: formData.linkedin,
        github: formData.github,
        summary: formData.summary,
        technologies: formData.technologies.split(",").map(t => t.trim()).filter(Boolean),
        skills_data: formData.skillCategories.filter(sc => sc.category && sc.items).map(sc => ({
          category: sc.category,
          items: sc.items.split(",").map(i => i.trim()).filter(Boolean)
        })),
        projects_data: formData.projects.filter(p => p.name),
        experience_data: formData.experience.filter(e => e.company),
        education_data: formData.education.filter(e => e.degree),
        certifications_data: formData.certifications.filter(c => c.trim()),
        format: formData.format,
      };

      const response = await aiService.generateResume(requestData);
      
      setFormData(prev => ({
        ...prev,
        generated_content: response.generated_content
      }));
      
      toast({
        title: "Resume Generated! ✨",
        description: "AI has generated your resume.",
      });
    } catch (error: any) {
      console.error('Error generating resume:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate resume.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveResume = async () => {
    try {
      const resumeData = {
        title: formData.title,
        target_role: formData.target_role,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        linkedin: formData.linkedin,
        github: formData.github,
        summary: formData.summary,
        technologies: formData.technologies.split(",").map(t => t.trim()).filter(Boolean),
        skills_data: formData.skillCategories.filter(sc => sc.category && sc.items).map(sc => ({
          category: sc.category,
          items: sc.items.split(",").map(i => i.trim()).filter(Boolean)
        })),
        projects_data: formData.projects.filter(p => p.name),
        experience_data: formData.experience.filter(e => e.company),
        education_data: formData.education.filter(e => e.degree),
        certifications_data: formData.certifications.filter(c => c.trim()),
        generated_content: formData.generated_content,
        format: formData.format,
      };

      if (editingId) {
        await resumeService.update(editingId, resumeData);
        toast({ title: "Resume updated successfully" });
      } else {
        await resumeService.create(resumeData);
        toast({ title: "Resume saved successfully" });
      }

      fetchResumes();
      resetForm();
    } catch (error) {
      console.error('Error saving resume:', error);
      toast({
        title: "Error",
        description: "Failed to save resume.",
        variant: "destructive",
      });
    }
  };

  const handleEditResume = async (resume: Resume) => {
    try {
      const fullResume = await resumeService.get(resume.id);
      
      setFormData({
        title: fullResume.title,
        target_role: fullResume.target_role,
        job_description: fullResume.job_description || "",
        name: fullResume.name || "",
        phone: fullResume.phone || "",
        email: fullResume.email || "",
        linkedin: fullResume.linkedin || "",
        github: fullResume.github || "",
        summary: fullResume.summary || "",
        technologies: fullResume.technologies?.join(", ") || "",
        skills: fullResume.skills_data?.join(", ") || "",
        format: fullResume.format,
        projects: fullResume.projects_data?.length ? fullResume.projects_data.map((p: any) => ({
          name: p.name || "",
          technologies: p.technologies || "",
          description: p.description || "",
          github_link: p.github_link || ""
        })) : [{ name: "", technologies: "", description: "", github_link: "" }],
        experience: fullResume.experience_data?.length ? fullResume.experience_data : [{ company: "", position: "", duration: "", description: "" }],
        education: fullResume.education_data?.length ? fullResume.education_data : [{ degree: "", institution: "", year: "" }],
        certifications: fullResume.certifications_data?.length ? fullResume.certifications_data : [""],
        skillCategories: fullResume.skills_data?.length ? fullResume.skills_data.map((skill: any) => ({
          category: skill.category || "",
          items: Array.isArray(skill.items) ? skill.items.join(", ") : skill.items || ""
        })) : [{ category: "", items: "" }],
        generated_content: fullResume.generated_content || "",
      });
      
      setEditingId(resume.id);
      setShowForm(true);
      
      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error loading resume:', error);
      toast({
        title: "Error",
        description: "Failed to load resume for editing.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteResume = async (id: string) => {
    try {
      await resumeService.delete(id);
      toast({ title: "Resume deleted" });
      fetchResumes();
      setDeleteDialogOpen(false);
      setResumeToDelete(null);
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast({
        title: "Error",
        description: "Failed to delete resume.",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (id: string) => {
    setResumeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDownloadResume = (resume: Resume, format: 'pdf' | 'text' = 'text') => {
    if (!resume.generated_content) {
      toast({
        title: "No Content",
        description: "This resume hasn't been generated yet.",
        variant: "destructive",
      });
      return;
    }

    if (format === 'pdf') {
      handleDownloadPDF(resume);
    } else {
      const extension = 'txt';
      const mimeType = 'text/plain';
      const blob = new Blob([resume.generated_content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume.title.replace(/\s+/g, '_')}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Downloaded",
        description: `Resume saved as ${a.download}`,
      });
    }
  };

  const handleDownloadPDF = (resume: Resume) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      let cleanContent = resume.generated_content || '';
      
      // Remove markdown code blocks and language identifiers
      cleanContent = cleanContent
        .replace(/```[\w]*\n?/g, '') // Remove code block markers with language identifiers
        .replace(/`([^`]+)`/g, '$1') // Remove inline code markers
        .replace(/^---+$/gm, '') // Remove horizontal rules (---)
        .replace(/^===+$/gm, '') // Remove horizontal rules (===)
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/\[(.+?)\]\((.+?)\)/g, '$1')
        .replace(/<[^>]+>/g, '')
        .trim();

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 12.7;
      const maxLineWidth = pageWidth - (margin * 2);
      let yPosition = margin + 5;

      const lines = cleanContent.split('\n');
      let currentSection = '';
      let lastWasTitle = false;
      let lastItemType = ''; // Track last item type for spacing
      let isHeaderDone = false; // Track if we've processed the header section
      
      for (let i = 0; i < lines.length; i++) {
        const trimmedLine = lines[i].trim();
        const nextLine = i < lines.length - 1 ? lines[i + 1]?.trim() : '';
        
        if (yPosition > pageHeight - margin - 15) {
          doc.addPage();
          yPosition = margin + 5;
        }

        if (!trimmedLine) {
          if (yPosition > margin + 10 && lastWasTitle) {
            yPosition += 1.5;
          }
          continue;
        }

        // Section headers
        const sectionMatch = trimmedLine.match(/^(PROFESSIONAL SUMMARY|EDUCATION|EXPERIENCE|PROJECTS|TECHNICAL SKILLS|SKILLS|CERTIFICATIONS|SUMMARY)$/i);
        if (sectionMatch) {
          currentSection = sectionMatch[1].toUpperCase();
          // Replace "TECHNICAL SKILLS" with "SKILLS" for display
          const displaySection = currentSection === 'TECHNICAL SKILLS' ? 'SKILLS' : currentSection;
          yPosition += 3;
          doc.setFontSize(12);
          doc.setFont('times', 'bold');
          doc.text(displaySection, margin, yPosition);
          doc.setLineWidth(0.3);
          doc.line(margin, yPosition + 0.8, pageWidth - margin, yPosition + 0.8);
          yPosition += 6;
          lastWasTitle = false;
          lastItemType = 'section';
          continue;
        }

        // Name (first line)
        if (!isHeaderDone && yPosition < margin + 10 && !trimmedLine.includes('@') && !trimmedLine.includes('|')) {
          doc.setFontSize(22);
          doc.setFont('times', 'bold');
          const textWidth = doc.getTextWidth(trimmedLine);
          doc.text(trimmedLine, (pageWidth - textWidth) / 2, yPosition);
          yPosition += 5;
          lastItemType = 'name';
          continue;
        }

        // Contact info
        if (trimmedLine.includes('@') || (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(trimmedLine) && trimmedLine.includes('|'))) {
          doc.setFontSize(10);
          doc.setFont('times', 'normal');
          
          // Parse contact line and create clickable links for LinkedIn and GitHub
          const parts = trimmedLine.split('|').map(p => p.trim());
          let xOffset = 0;
          const totalWidth = doc.getTextWidth(trimmedLine);
          const startX = (pageWidth - totalWidth) / 2;
          
          parts.forEach((part, idx) => {
            const partWidth = doc.getTextWidth(part);
            const separatorWidth = idx < parts.length - 1 ? doc.getTextWidth(' | ') : 0;
            
            // Check if this part is LinkedIn or GitHub
            if (part.toLowerCase().includes('linkedin')) {
              const linkedinUrl = resume.linkedin || '';
              const fullUrl = linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`;
              doc.textWithLink('LinkedIn', startX + xOffset, yPosition, { url: fullUrl });
            } else if (part.toLowerCase().includes('github')) {
              const githubUrl = resume.github || '';
              const fullUrl = githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`;
              doc.textWithLink('GitHub', startX + xOffset, yPosition, { url: fullUrl });
            } else {
              doc.text(part, startX + xOffset, yPosition);
            }
            
            xOffset += partWidth + separatorWidth;
            if (idx < parts.length - 1) {
              doc.text(' | ', startX + xOffset - separatorWidth, yPosition);
            }
          });
          
          yPosition += 8;
          lastItemType = 'contact';
          isHeaderDone = true; // Mark header section as complete
          continue;
        }

        // Bullet points
        if (/^[•\-\*]\s/.test(trimmedLine)) {
          doc.setFontSize(10);
          doc.setFont('times', 'normal');
          const bulletText = trimmedLine.replace(/^[•\-\*]\s*/, '');
          const bulletIndent = margin + 3;
          const textIndent = margin + 7;
          const bulletWidth = maxLineWidth - 7;
          
          const splitLines = doc.splitTextToSize(bulletText, bulletWidth);
          splitLines.forEach((splitLine: string, idx: number) => {
            if (yPosition > pageHeight - margin - 15) {
              doc.addPage();
              yPosition = margin + 5;
            }
            if (idx === 0) {
              doc.text('•', bulletIndent, yPosition);
            }
            doc.text(splitLine, textIndent, yPosition);
            yPosition += 4.2;
          });
          lastWasTitle = false;
          lastItemType = 'bullet';
          continue;
        }

        // Title with date (Job title, Institution, Project)
        // Pattern: Text, Date/Location OR Text | Technologies, Date
        const hasDate = /\b(20\d{2}|201\d|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Present)\b/i.test(trimmedLine);
        const hasBulletNext = nextLine && /^[•\-\*]/.test(nextLine);
        
        if (hasDate && !hasBulletNext && currentSection !== 'TECHNICAL SKILLS') {
          // Add gap between different items in PROJECTS/EXPERIENCE sections
          if ((currentSection === 'PROJECTS' || currentSection === 'EXPERIENCE') && lastItemType === 'bullet') {
            yPosition += 2;
          }
          
          // For PROJECTS section, handle differently (Project Name | Tech Stack, Date)
          if (currentSection === 'PROJECTS' && trimmedLine.includes(' | ')) {
            const pipeIndex = trimmedLine.indexOf(' | ');
            const projectName = trimmedLine.substring(0, pipeIndex).trim();
            const afterPipe = trimmedLine.substring(pipeIndex + 3);
            const lastComma = afterPipe.lastIndexOf(',');
            
            let techStack = '';
            let dateLocation = '';
            
            if (lastComma > 0) {
              techStack = afterPipe.substring(0, lastComma).trim();
              dateLocation = afterPipe.substring(lastComma + 1).trim();
            } else {
              techStack = afterPipe;
            }
            
            // Project name - bold, larger, with date on right
            doc.setFontSize(11);
            doc.setFont('times', 'bold');
            doc.text(projectName, margin, yPosition);
            
            if (dateLocation) {
              const dateWidth = doc.getTextWidth(dateLocation);
              doc.text(dateLocation, pageWidth - margin - dateWidth, yPosition);
            }
            
            yPosition += 4.5;
            
            // Tech stack below project name - italic, smaller
            if (techStack) {
              doc.setFontSize(10);
              doc.setFont('times', 'italic');
              doc.text(techStack, margin, yPosition);
              yPosition += 4.5;
            }
            
            lastWasTitle = true;
            lastItemType = 'project-title';
            continue;
          }
          
          // For other sections (Experience, Education)
          doc.setFontSize(11);
          doc.setFont('times', 'bold');
          
          let title = '';
          let dateLocation = '';
          
          // Pattern: Title, Date
          const parts = trimmedLine.split(',');
          if (parts.length >= 2) {
            // Check if last part looks like date/location
            const lastPart = parts[parts.length - 1].trim();
            if (/\b(20\d{2}|201\d|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Present)\b/i.test(lastPart)) {
              dateLocation = lastPart;
              title = parts.slice(0, -1).join(',').trim();
            } else {
              title = trimmedLine;
            }
          } else {
            title = trimmedLine;
          }
          
          doc.text(title, margin, yPosition);
          if (dateLocation) {
            const dateWidth = doc.getTextWidth(dateLocation);
            doc.text(dateLocation, pageWidth - margin - dateWidth, yPosition);
          }
          
          yPosition += 4.5;
          lastWasTitle = true;
          lastItemType = 'experience-title';
          continue;
        }

        // Subtitle after title (company, institution, degree info)
        if (lastWasTitle && !hasBulletNext) {
          doc.setFontSize(10);
          doc.setFont('times', 'italic');
          
          // Two-column for institution/company
          const commaIndex = trimmedLine.lastIndexOf(',');
          if (commaIndex > 0) {
            const left = trimmedLine.substring(0, commaIndex).trim();
            const right = trimmedLine.substring(commaIndex + 1).trim();
            
            doc.text(left, margin, yPosition);
            const rightWidth = doc.getTextWidth(right);
            doc.text(right, pageWidth - margin - rightWidth, yPosition);
          } else {
            doc.text(trimmedLine, margin, yPosition);
          }
          
          yPosition += 4.5;
          lastWasTitle = false;
          lastItemType = 'subtitle';
          continue;
        }

        // Technical Skills section 
        if (currentSection === 'TECHNICAL SKILLS' || currentSection === 'SKILLS') {
          doc.setFontSize(10);
          doc.setFont('times', 'normal');
          
          // Check if it's a category line (Languages:, Frameworks:, etc.)
          if (trimmedLine.includes(':')) {
            const colonIndex = trimmedLine.indexOf(':');
            const category = trimmedLine.substring(0, colonIndex + 1);
            const items = trimmedLine.substring(colonIndex + 1).trim();
            
            doc.setFont('times', 'bold');
            doc.text(category, margin, yPosition);
            
            const categoryWidth = doc.getTextWidth(category);
            doc.setFont('times', 'normal');
            
            const itemsWidth = maxLineWidth - categoryWidth - 1;
            const splitItems = doc.splitTextToSize(items, itemsWidth);
            
            splitItems.forEach((line: string, idx: number) => {
              if (idx === 0) {
                doc.text(line, margin + categoryWidth + 1, yPosition);
              } else {
                yPosition += 4.2;
                doc.text(line, margin + categoryWidth + 1, yPosition);
              }
            });
            yPosition += 4.2;
          } else {
            const splitLines = doc.splitTextToSize(trimmedLine, maxLineWidth);
            splitLines.forEach((line: string) => {
              doc.text(line, margin, yPosition);
              yPosition += 4.2;
            });
          }
          lastItemType = 'skill';
          continue;
        }

        // Regular text
        if (trimmedLine) {
          doc.setFontSize(10);
          doc.setFont('times', 'normal');
          const splitLines = doc.splitTextToSize(trimmedLine, maxLineWidth);
          
          splitLines.forEach((splitLine: string) => {
            if (yPosition > pageHeight - margin - 15) {
              doc.addPage();
              yPosition = margin + 5;
            }
            doc.text(splitLine, margin, yPosition);
            yPosition += 4.2;
          });
          
          lastWasTitle = false;
          lastItemType = 'text';
        }
      }

      doc.save(`${resume.title.replace(/\s+/g, '_')}.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: `Resume saved as ${resume.title.replace(/\s+/g, '_')}.pdf`,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "PDF Generation Failed",
        description: "Could not generate PDF. Try downloading as text instead.",
        variant: "destructive",
      });
    }
  };

  const handleCopyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast({
        title: "Copied!",
        description: "Resume content copied to clipboard.",
      });
    }).catch(() => {
      toast({
        title: "Failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: "",
      target_role: "",
      job_description: "",
      name: "",
      phone: "",
      email: "",
      linkedin: "",
      github: "",
      summary: "",
      technologies: "",
      skills: "",
      format: "markdown",
      projects: [{ name: "", technologies: "", description: "", github_link: "" }],
      experience: [{ company: "", position: "", duration: "", description: "" }],
      education: [{ degree: "", institution: "", year: "" }],
      certifications: [""],
      skillCategories: [{ category: "", items: "" }],
      generated_content: "",
    });
  };

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { name: "", technologies: "", description: "", github_link: "" }]
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { company: "", position: "", duration: "", description: "" }]
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: "", institution: "", year: "" }]
    }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, ""]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Resume Generator</h2>
          <p className="text-muted-foreground mt-1">Create AI-powered resumes for different roles</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          New Resume
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Resume" : "Create New Resume"}</CardTitle>
            <CardDescription>Fill in your details and generate an AI-powered resume</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Resume Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Senior Full Stack Developer Resume"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_role">Target Role *</Label>
                <Input
                  id="target_role"
                  value={formData.target_role}
                  onChange={(e) => setFormData({...formData, target_role: e.target.value})}
                  placeholder="e.g., Full Stack Developer"
                />
              </div>
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <Label htmlFor="job_description">Job Description (Optional)</Label>
              <Textarea
                id="job_description"
                value={formData.job_description}
                onChange={(e) => setFormData({...formData, job_description: e.target.value})}
                placeholder="Paste the job description here to tailor your resume and make it ATS-friendly with relevant keywords..."
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                Adding a job description helps the AI match keywords and requirements, making your resume more ATS-friendly.
              </p>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Contact Information</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="e.g., 123-456-7890"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="e.g., john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                    placeholder="e.g., linkedin.com/in/johndoe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={formData.github}
                    onChange={(e) => setFormData({...formData, github: e.target.value})}
                    placeholder="e.g., github.com/johndoe"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Professional Summary</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData({...formData, summary: e.target.value})}
                placeholder="Brief professional summary..."
                rows={3}
              />
            </div>

            {/* Education Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Education</Label>
                <Button type="button" onClick={addEducation} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Education
                </Button>
              </div>
              {formData.education.map((edu, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Degree/Course *</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => {
                            const newEducation = [...formData.education];
                            newEducation[index].degree = e.target.value;
                            setFormData({...formData, education: newEducation});
                          }}
                          placeholder="e.g., Bachelor of Computer Science"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Institution *</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => {
                            const newEducation = [...formData.education];
                            newEducation[index].institution = e.target.value;
                            setFormData({...formData, education: newEducation});
                          }}
                          placeholder="e.g., University Name"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Year/Duration</Label>
                        <Input
                          value={edu.year}
                          onChange={(e) => {
                            const newEducation = [...formData.education];
                            newEducation[index].year = e.target.value;
                            setFormData({...formData, education: newEducation});
                          }}
                          placeholder="e.g., 2018 - 2022 or May 2022"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const newEducation = formData.education.filter((_, i) => i !== index);
                            setFormData({...formData, education: newEducation});
                          }}
                          className="w-full"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Experience Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Work Experience</Label>
                <Button type="button" onClick={addExperience} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Experience
                </Button>
              </div>
              {formData.experience.map((exp, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Company *</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => {
                            const newExperience = [...formData.experience];
                            newExperience[index].company = e.target.value;
                            setFormData({...formData, experience: newExperience});
                          }}
                          placeholder="e.g., Tech Company Inc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Position/Role *</Label>
                        <Input
                          value={exp.position}
                          onChange={(e) => {
                            const newExperience = [...formData.experience];
                            newExperience[index].position = e.target.value;
                            setFormData({...formData, experience: newExperience});
                          }}
                          placeholder="e.g., Senior Software Engineer"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Input
                        value={exp.duration}
                        onChange={(e) => {
                          const newExperience = [...formData.experience];
                          newExperience[index].duration = e.target.value;
                          setFormData({...formData, experience: newExperience});
                        }}
                        placeholder="e.g., Jan 2020 - Present"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description/Responsibilities</Label>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => {
                          const newExperience = [...formData.experience];
                          newExperience[index].description = e.target.value;
                          setFormData({...formData, experience: newExperience});
                        }}
                        placeholder="Describe your key responsibilities and achievements..."
                        rows={3}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const newExperience = formData.experience.filter((_, i) => i !== index);
                        setFormData({...formData, experience: newExperience});
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove Experience
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Projects Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Projects</Label>
                <Button type="button" onClick={addProject} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Project
                </Button>
              </div>
              {formData.projects.map((project, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Project Name *</Label>
                      <Input
                        value={project.name}
                        onChange={(e) => {
                          const newProjects = [...formData.projects];
                          newProjects[index].name = e.target.value;
                          setFormData({...formData, projects: newProjects});
                        }}
                        placeholder="e.g., E-commerce Platform"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Technologies Used</Label>
                        <Input
                          value={project.technologies}
                          onChange={(e) => {
                            const newProjects = [...formData.projects];
                            newProjects[index].technologies = e.target.value;
                            setFormData({...formData, projects: newProjects});
                          }}
                          placeholder="e.g., React, Node.js, MongoDB"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>GitHub Link (Optional)</Label>
                        <Input
                          value={project.github_link || ""}
                          onChange={(e) => {
                            const newProjects = [...formData.projects];
                            newProjects[index].github_link = e.target.value;
                            setFormData({...formData, projects: newProjects});
                          }}
                          placeholder="e.g., github.com/username/project"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={project.description}
                        onChange={(e) => {
                          const newProjects = [...formData.projects];
                          newProjects[index].description = e.target.value;
                          setFormData({...formData, projects: newProjects});
                        }}
                        placeholder="Describe the project and your contributions..."
                        rows={3}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const newProjects = formData.projects.filter((_, i) => i !== index);
                        setFormData({...formData, projects: newProjects});
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove Project
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Skills Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Technical Skills</Label>
                <Button type="button" onClick={() => {
                  setFormData({
                    ...formData,
                    skillCategories: [...formData.skillCategories, { category: "", items: "" }]
                  });
                }} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Skill Category
                </Button>
              </div>
              {formData.skillCategories.map((skillCat, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label>Category Name *</Label>
                        <Input
                          value={skillCat.category}
                          onChange={(e) => {
                            const newSkillCategories = [...formData.skillCategories];
                            newSkillCategories[index].category = e.target.value;
                            setFormData({...formData, skillCategories: newSkillCategories});
                          }}
                          placeholder="e.g., Languages, Frameworks, Tools"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Items (comma-separated) *</Label>
                        <Input
                          value={skillCat.items}
                          onChange={(e) => {
                            const newSkillCategories = [...formData.skillCategories];
                            newSkillCategories[index].items = e.target.value;
                            setFormData({...formData, skillCategories: newSkillCategories});
                          }}
                          placeholder="e.g., JavaScript, Python, Java, C++"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const newSkillCategories = formData.skillCategories.filter((_, i) => i !== index);
                        setFormData({...formData, skillCategories: newSkillCategories});
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove Category
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Certifications Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Certifications (Optional)</Label>
                <Button type="button" onClick={addCertification} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Certification
                </Button>
              </div>
              {formData.certifications.map((cert, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={cert}
                    onChange={(e) => {
                      const newCertifications = [...formData.certifications];
                      newCertifications[index] = e.target.value;
                      setFormData({...formData, certifications: newCertifications});
                    }}
                    placeholder="e.g., AWS Certified Solutions Architect"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const newCertifications = formData.certifications.filter((_, i) => i !== index);
                      setFormData({...formData, certifications: newCertifications});
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Output Format</Label>
              <Select value={formData.format} onValueChange={(value) => setFormData({...formData, format: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="plain">Plain Text</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.generated_content && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Generated Resume Content</Label>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownloadPDF({ 
                        id: '', 
                        title: formData.title || 'Resume', 
                        target_role: formData.target_role,
                        generated_content: formData.generated_content,
                        created_at: new Date().toISOString(),
                        format: formData.format,
                        linkedin: formData.linkedin,
                        github: formData.github
                      })}
                      variant="default"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      onClick={() => handleCopyToClipboard(formData.generated_content)}
                      variant="ghost"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={formData.generated_content}
                  onChange={(e) => setFormData({...formData, generated_content: e.target.value})}
                  rows={20}
                  className="font-mono text-sm"
                  placeholder="Generated resume content will appear here..."
                />
                <p className="text-xs text-muted-foreground">
                  You can edit the generated content above. Changes will be saved when you click "Save Resume".
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleGenerateResume}
                disabled={isGenerating || !formData.target_role}
                className="flex-1"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate with AI"}
              </Button>
              <Button
                onClick={handleSaveResume}
                disabled={!formData.title || !formData.target_role}
                variant="outline"
                className="flex-1"
              >
                Save Resume
              </Button>
              <Button onClick={resetForm} variant="ghost">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-8">Loading...</div>
        ) : resumes.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No resumes yet. Create your first AI-powered resume!
          </div>
        ) : (
          resumes.map((resume) => (
            <Card key={resume.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <FileText className="w-8 h-8 text-primary" />
                  <Badge variant="secondary">{resume.format}</Badge>
                </div>
                <CardTitle className="mt-2">{resume.title}</CardTitle>
                <CardDescription>{resume.target_role}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownloadResume(resume, 'pdf')}
                      variant="default"
                      size="sm"
                      className="flex-1"
                      disabled={!resume.generated_content}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                    <Button
                      onClick={() => handleDownloadResume(resume, 'text')}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={!resume.generated_content}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Text
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditResume(resume)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleCopyToClipboard(resume.generated_content || '')}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={!resume.generated_content}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <Button
                    onClick={() => openDeleteDialog(resume.id)}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Created: {new Date(resume.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the resume from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setResumeToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => resumeToDelete && handleDeleteResume(resumeToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ResumeManager;
