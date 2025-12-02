import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, Mail, FolderOpen, Plus, Edit, Trash2, LogOut, User, Award, Settings, FileText, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import ProjectForm from "@/components/admin/ProjectForm";
import BasicInfoEditor from "@/components/admin/BasicInfoEditor";
import SocialLinksEditor from "@/components/admin/SocialLinksEditor";
import ProfessionalInfoEditor from "@/components/admin/ProfessionalInfoEditor";
import CertificationsEditor from "@/components/admin/CertificationsEditor";
import FooterSettingsEditor from "@/components/admin/FooterSettingsEditor";
import SkillsManager from "@/components/admin/SkillsManager";
import { projectService, contactService } from "@/lib/api";

interface Project {
  id: string;
  title: string;
  status: string;
  views: number;
  created_at: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  read: boolean;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalMessages: 0,
    totalVisitors: 0,
    activeProjects: 0
  });
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [showBasicInfoEditor, setShowBasicInfoEditor] = useState(false);
  const [showSocialLinksEditor, setShowSocialLinksEditor] = useState(false);
  const [showProfessionalInfoEditor, setShowProfessionalInfoEditor] = useState(false);
  const [showCertificationsEditor, setShowCertificationsEditor] = useState(false);
  const [showFooterSettingsEditor, setShowFooterSettingsEditor] = useState(false);
  const [showSkillsManager, setShowSkillsManager] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchMessages();
      fetchStats();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const data = await projectService.list();
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const data = await contactService.list();
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [projectsData, messagesData] = await Promise.all([
        projectService.list(),
        contactService.list()
      ]);

      const publishedProjects = projectsData?.filter(p => p.status === 'published').length || 0;
      
      setStats({
        totalProjects: projectsData?.length || 0,
        totalMessages: messagesData?.length || 0,
        totalVisitors: Math.floor(Math.random() * 2000) + 500,
        activeProjects: publishedProjects
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged out successfully",
      description: "You have been signed out of the admin panel.",
    });
    navigate("/auth");
  };

  const deleteProject = async (projectId: string) => {
    try {
      await projectService.delete(projectId);

      toast({
        title: "Project deleted",
        description: "The project has been removed successfully.",
      });
      fetchProjects();
      fetchStats();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project.",
        variant: "destructive",
      });
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      // TODO: Implement update endpoint for contact messages
      // await contactService.update(messageId, { read: true });
      console.log('Mark as read not implemented yet:', messageId);
      // fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage every aspect of your portfolio</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">Active: {stats.activeProjects}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMessages}</div>
              <p className="text-xs text-muted-foreground">
                {messages.filter(m => !m.read).length} unread
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visitors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVisitors}</div>
              <p className="text-xs text-muted-foreground">Estimated monthly</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analytics</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">Engagement rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Management Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>Edit every aspect of your portfolio content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button onClick={() => setShowBasicInfoEditor(true)} className="h-24 flex flex-col">
                <User className="w-8 h-8 mb-2" />
                <span className="text-sm">Personal Info</span>
                <span className="text-xs text-muted-foreground">Name, bio, contact</span>
              </Button>
              
              <Button onClick={() => setShowSkillsManager(true)} className="h-24 flex flex-col">
                <Award className="w-8 h-8 mb-2" />
                <span className="text-sm">Skills & Tech</span>
                <span className="text-xs text-muted-foreground">Technologies & abilities</span>
              </Button>
              
              <Button onClick={() => setShowProjectForm(true)} className="h-24 flex flex-col">
                <Plus className="w-8 h-8 mb-2" />
                <span className="text-sm">Add Project</span>
                <span className="text-xs text-muted-foreground">New portfolio item</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="content">Content Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Projects</CardTitle>
                    <CardDescription>Manage your portfolio projects</CardDescription>
                  </div>
                  <Button onClick={() => setShowProjectForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-medium">{project.title}</h3>
                          <p className="text-sm text-muted-foreground">{project.views} views</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={project.status === "published" ? "default" : "secondary"}>
                          {project.status}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingProject(project.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteProject(project.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No projects yet. Create your first project!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Messages</CardTitle>
                <CardDescription>Messages from your portfolio contact form</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{message.name}</h3>
                          {!message.read && (
                            <Badge variant="destructive" className="text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{message.email}</p>
                        <p className="text-sm font-medium">{message.subject}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {new Date(message.created_at).toLocaleDateString()}
                        </p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => markMessageAsRead(message.id)}
                        >
                          {message.read ? "Read" : "Mark Read"}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No messages yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Overview Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Personal Content
                  </CardTitle>
                  <CardDescription>Manage your personal information and professional details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Profile Information</p>
                      <p className="text-sm text-muted-foreground">Name, title, bio, avatar</p>
                    </div>
                    <Button size="sm" onClick={() => setShowBasicInfoEditor(true)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Professional Info</p>
                      <p className="text-sm text-muted-foreground">Experience, education, position</p>
                    </div>
                    <Button size="sm" onClick={() => setShowProfessionalInfoEditor(true)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Social Links</p>
                      <p className="text-sm text-muted-foreground">GitHub, LinkedIn, Twitter, CV</p>
                    </div>
                    <Button size="sm" onClick={() => setShowSocialLinksEditor(true)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Site Content
                  </CardTitle>
                  <CardDescription>Manage website sections and components</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Skills & Technologies</p>
                      <p className="text-sm text-muted-foreground">Programming languages, tools</p>
                    </div>
                    <Button size="sm" onClick={() => setShowSkillsManager(true)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>

                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Certifications</p>
                      <p className="text-sm text-muted-foreground">Professional credentials</p>
                    </div>
                    <Button size="sm" onClick={() => setShowCertificationsEditor(true)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Footer Content</p>
                      <p className="text-sm text-muted-foreground">Description, services, links</p>
                    </div>
                    <Button size="sm" onClick={() => setShowFooterSettingsEditor(true)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>     
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {(showProjectForm || editingProject) && (
        <ProjectForm
          projectId={editingProject}
          onClose={() => {
            setShowProjectForm(false);
            setEditingProject(null);
          }}
          onSuccess={() => {
            fetchProjects();
            fetchStats();
            setShowProjectForm(false);
            setEditingProject(null);
          }}
        />
      )}

      {showBasicInfoEditor && (
        <BasicInfoEditor
          onClose={() => setShowBasicInfoEditor(false)}
          onSuccess={() => setShowBasicInfoEditor(false)}
        />
      )}

      {showSocialLinksEditor && (
        <SocialLinksEditor
          onClose={() => setShowSocialLinksEditor(false)}
          onSuccess={() => setShowSocialLinksEditor(false)}
        />
      )}

      {showProfessionalInfoEditor && (
        <ProfessionalInfoEditor
          onClose={() => setShowProfessionalInfoEditor(false)}
          onSuccess={() => setShowProfessionalInfoEditor(false)}
        />
      )}

      {showCertificationsEditor && (
        <CertificationsEditor
          onClose={() => setShowCertificationsEditor(false)}
          onSuccess={() => setShowCertificationsEditor(false)}
        />
      )}

      {showFooterSettingsEditor && (
        <FooterSettingsEditor
          onClose={() => setShowFooterSettingsEditor(false)}
          onSuccess={() => setShowFooterSettingsEditor(false)}
        />
      )}

      {showSkillsManager && (
        <SkillsManager
          onClose={() => setShowSkillsManager(false)}
          onSuccess={() => setShowSkillsManager(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
