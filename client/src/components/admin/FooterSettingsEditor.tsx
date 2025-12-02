import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/api";

interface FooterSettingsEditorProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface FooterSettingsFormData {
  footer_description: string;
  services_list: string;
  quick_links: string;
  copyright_text: string;
  footer_social_github: string;
  footer_social_linkedin: string;
  footer_social_email: string;
}

const initialFormData: FooterSettingsFormData = {
  footer_description: "",
  services_list: "",
  quick_links: "",
  copyright_text: "",
  footer_social_github: "",
  footer_social_linkedin: "",
  footer_social_email: "",
};

const FooterSettingsEditor = ({ onClose, onSuccess }: FooterSettingsEditorProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FooterSettingsFormData>(initialFormData);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchProfile = async () => {
    try {
      const data = await authService.getProfile();
      if (!data) {
        setFormData(initialFormData);
        return;
      }
      setFormData({
        footer_description: data.footer_description || "",
        services_list: data.services_list || "",
        quick_links: data.quick_links || "",
        copyright_text: data.copyright_text || "",
        footer_social_github: data.footer_social_github || "",
        footer_social_linkedin: data.footer_social_linkedin || "",
        footer_social_email: data.footer_social_email || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setFormData(initialFormData);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      await authService.updateProfile(formData);
      toast({
        title: "Footer settings updated",
        description: "Your footer settings have been updated successfully.",
      });
      onSuccess();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update footer settings.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FooterSettingsFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Footer Settings</DialogTitle>
          <DialogDescription>
            Customize your footer description, services, links, and social media
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="footer_description">Footer Description</Label>
              <Textarea
                id="footer_description"
                rows={2}
                value={formData.footer_description}
                onChange={(e) => handleChange("footer_description", e.target.value)}
                placeholder="Brief description shown in footer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="services_list">Services (comma-separated)</Label>
              <Input
                id="services_list"
                value={formData.services_list}
                onChange={(e) => handleChange("services_list", e.target.value)}
                placeholder="Web Development, UI/UX Design, Mobile Apps, Consulting"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quick_links">Quick Links (comma-separated)</Label>
              <Input
                id="quick_links"
                value={formData.quick_links}
                onChange={(e) => handleChange("quick_links", e.target.value)}
                placeholder="About, Projects, Contact, Blog"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="copyright_text">Copyright Text</Label>
              <Input
                id="copyright_text"
                value={formData.copyright_text}
                onChange={(e) => handleChange("copyright_text", e.target.value)}
                placeholder="Made with ❤️ by John Doe"
              />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Footer-Specific Social Links (optional)</h4>
              <p className="text-xs text-muted-foreground mb-2">Leave blank to use main social links</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="footer_social_github">GitHub URL</Label>
                <Input
                  id="footer_social_github"
                  type="url"
                  value={formData.footer_social_github}
                  onChange={(e) => handleChange("footer_social_github", e.target.value)}
                  placeholder="Override main GitHub URL"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="footer_social_linkedin">LinkedIn URL</Label>
                <Input
                  id="footer_social_linkedin"
                  type="url"
                  value={formData.footer_social_linkedin}
                  onChange={(e) => handleChange("footer_social_linkedin", e.target.value)}
                  placeholder="Override main LinkedIn URL"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="footer_social_email">Email</Label>
                <Input
                  id="footer_social_email"
                  type="email"
                  value={formData.footer_social_email}
                  onChange={(e) => handleChange("footer_social_email", e.target.value)}
                  placeholder="Override main email"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FooterSettingsEditor;
