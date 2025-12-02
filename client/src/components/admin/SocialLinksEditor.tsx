import { useState, useEffect, ChangeEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/api";

interface SocialLinksEditorProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface SocialLinksFormData {
  website_url: string;
  github_url: string;
  linkedin_url: string;
  twitter_url: string;
  cv_url: string;
}

const initialFormData: SocialLinksFormData = {
  website_url: "",
  github_url: "",
  linkedin_url: "",
  twitter_url: "",
  cv_url: "",
};

const SocialLinksEditor = ({ onClose, onSuccess }: SocialLinksEditorProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SocialLinksFormData>(initialFormData);
  const [cvMode, setCvMode] = useState<"url" | "upload">("url");

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
        website_url: data.website_url || "",
        github_url: data.github_url || "",
        linkedin_url: data.linkedin_url || "",
        twitter_url: data.twitter_url || "",
        cv_url: data.cv_url || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setFormData(initialFormData);
    }
  };

  const handleCvChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({ 
        title: "File upload not available", 
        description: "Please use a URL instead.", 
        variant: "destructive" 
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      await authService.updateProfile(formData);
      toast({
        title: "Social links updated",
        description: "Your social links have been updated successfully.",
      });
      onSuccess();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update social links.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof SocialLinksFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Social Links</DialogTitle>
          <DialogDescription>
            Update your social media profiles and CV/Resume link
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website_url">Personal Website</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => handleChange("website_url", e.target.value)}
                  placeholder="https://johndoe.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github_url">GitHub URL</Label>
                <Input
                  id="github_url"
                  type="url"
                  value={formData.github_url}
                  onChange={(e) => handleChange("github_url", e.target.value)}
                  placeholder="https://github.com/johndoe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => handleChange("linkedin_url", e.target.value)}
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter_url">Twitter/X URL</Label>
                <Input
                  id="twitter_url"
                  type="url"
                  value={formData.twitter_url}
                  onChange={(e) => handleChange("twitter_url", e.target.value)}
                  placeholder="https://twitter.com/johndoe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cv_url">CV/Resume</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={cvMode === "upload" ? "default" : "outline"}
                    onClick={() => setCvMode("upload")}
                  >Upload</Button>
                  <Button
                    type="button"
                    variant={cvMode === "url" ? "default" : "outline"}
                    onClick={() => setCvMode("url")}
                  >URL</Button>
                </div>
                {cvMode === "upload" ? (
                  <Input
                    id="cv_upload"
                    type="file"
                    accept="application/pdf,.doc,.docx"
                    onChange={handleCvChange}
                  />
                ) : (
                  <Input
                    id="cv_url"
                    type="url"
                    placeholder="https://example.com/resume.pdf"
                    value={formData.cv_url}
                    onChange={(e) => handleChange("cv_url", e.target.value)}
                  />
                )}
                {formData.cv_url && (
                  <a
                    href={formData.cv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary mt-2 block underline text-sm"
                  >
                    CV Link
                  </a>
                )}
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

export default SocialLinksEditor;
