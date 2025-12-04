
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, X, Sparkles } from "lucide-react";
import { projectService, aiService } from "@/lib/api";

interface ProjectFormProps {
  projectId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ProjectForm = ({ projectId, onClose, onSuccess }: ProjectFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    technologies: "",
    live_url: "",
    github_url: "",
    featured: false,
    status: "published"
  });

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      if (!projectId) return;
      
      const data = await projectService.get(projectId);

      if (data) {
        setFormData({
          title: data.title || "",
          description: data.description || "",
          image_url: data.image_url || "",
          technologies: data.technologies?.join(", ") || "",
          live_url: data.live_url || "",
          github_url: data.github_url || "",
          featured: data.featured || false,
          status: data.status || "published"
        });
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: "Error",
        description: "Failed to fetch project data.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: File uploads 

    toast({
      title: "File upload not available",
      description: "Please use a direct image URL instead.",
      variant: "destructive",
    });
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image_url: ""
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        image_url: formData.image_url,
        technologies: formData.technologies.split(",").map(t => t.trim()).filter(Boolean),
        live_url: formData.live_url,
        github_url: formData.github_url,
        featured: formData.featured,
        status: formData.status
      };

      if (projectId) {
        await projectService.update(projectId, projectData);
      } else {
        await projectService.create(projectData);
      }

      toast({
        title: projectId ? "Project updated" : "Project created",
        description: `Your project has been ${projectId ? "updated" : "created"} successfully.`,
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: "Error",
        description: `Failed to ${projectId ? "update" : "create"} project.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateDescription = async () => {
    if (!formData.title) {
      toast({
        title: "Title Required",
        description: "Please enter a project title first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const technologies = formData.technologies
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);

      const response = await aiService.generateProjectDescription(
        formData.title, 
        technologies,
        formData.github_url
      );
      
      handleChange("description", response.description);
      
      toast({
        title: "Description Generated! ✨",
         description: "AI has generated a description for your project.",
      });
    } catch (error: any) {
      console.error('Error generating description:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate description. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{projectId ? "Edit Project" : "Add New Project"}</DialogTitle>
          <DialogDescription>
            {projectId ? "Update your project details" : "Create a new project for your portfolio"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateDescription}
                disabled={isGenerating || !formData.title}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating ? "Generating..." : "Generate with AI"}
              </Button>
            </div>
            <Textarea
              id="description"
              rows={5}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter project description or click 'Generate with AI' to create one automatically..."
            />
          </div>

          <div className="space-y-2">
            <Label>Project Image</Label>
            
            {formData.image_url ? (
              <div className="relative">
                <img
                  src={formData.image_url}
                  alt="Project preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <div className="mt-4">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-foreground">
                        Upload an image
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        PNG, JPG, GIF up to 5MB
                      </span>
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="sr-only"
                    />
                  </div>
                  {isUploading && (
                    <div className="mt-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
                      <p className="text-xs text-muted-foreground mt-1">Uploading...</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Or provide an image URL:
            </div>
            <Input
              type="url"
              value={formData.image_url}
              onChange={(e) => handleChange("image_url", e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="technologies">Technologies (comma-separated)</Label>
            <Input
              id="technologies"
              value={formData.technologies}
              onChange={(e) => handleChange("technologies", e.target.value)}
              placeholder="React, TypeScript, Node.js"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="live_url">Live URL</Label>
              <Input
                id="live_url"
                type="url"
                value={formData.live_url}
                onChange={(e) => handleChange("live_url", e.target.value)}
                placeholder="https://your-project.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input
                id="github_url"
                type="url"
                value={formData.github_url}
                onChange={(e) => handleChange("github_url", e.target.value)}
                placeholder="https://github.com/username/repo"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => handleChange("featured", checked)}
            />
            <Label htmlFor="featured">Featured Project</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? "Saving..." : (projectId ? "Update" : "Create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectForm;
