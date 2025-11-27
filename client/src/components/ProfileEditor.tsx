import { useState, useEffect, ChangeEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import ProfileBasicInfo from "./ProfileBasicInfo";
import ProfileSocialLinks from "./ProfileSocialLinks";
import ProfileProfessionalInfo from "./ProfileProfessionalInfo";
import ProfileFooterSettings from "./ProfileFooterSettings";
import { authService } from "@/lib/api";

interface ProfileEditorProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface ProfileFormData {
  full_name: string;
  title: string;
  bio: string;
  avatar_url: string;
  github_url: string;
  linkedin_url: string;
  email: string;
  phone: string;
  location: string;
  website_url: string;
  twitter_url: string;
  cv_url: string;
  years_experience: string;
  current_company: string;
  current_position: string;
  education: string;
  certifications: string;
  footer_description: string;
  services_list: string;
  quick_links: string;
  copyright_text: string;
  footer_social_github: string;
  footer_social_linkedin: string;
  footer_social_email: string;
}

const initialFormData: ProfileFormData = {
  full_name: "",
  title: "",
  bio: "",
  avatar_url: "",
  github_url: "",
  linkedin_url: "",
  email: "",
  phone: "",
  location: "",
  website_url: "",
  twitter_url: "",
  cv_url: "",
  years_experience: "",
  current_company: "",
  current_position: "",
  education: "",
  certifications: "",
  footer_description: "",
  services_list: "",
  quick_links: "",
  copyright_text: "",
  footer_social_github: "",
  footer_social_linkedin: "",
  footer_social_email: "",
};

const ProfileEditor = ({ onClose, onSuccess }: ProfileEditorProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);

  // For switching input mode between URL & File for avatar/cv
  const [avatarMode, setAvatarMode] = useState<"url" | "upload">("url");
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
        full_name: data.full_name || "",
        title: data.title || "",
        bio: data.bio || "",
        avatar_url: data.avatar_url || "",
        github_url: data.github_url || "",
        linkedin_url: data.linkedin_url || "",
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || "",
        website_url: data.website_url || "",
        twitter_url: data.twitter_url || "",
        cv_url: data.cv_url || "",
        years_experience: data.years_experience || "",
        current_company: data.current_company || "",
        current_position: data.current_position || "",
        education: data.education || "",
        certifications: data.certifications || "",
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

  const uploadFile = async (
    bucket: "avatars" | "documents",
    file: File,
    fileType: "avatar_url" | "cv_url"
  ) => {
    // TODO: File uploads 
    // For now, use direct URLs in the form
    toast({ 
      title: "File upload not available", 
      description: "Please use a URL instead.", 
      variant: "destructive" 
    });
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile("avatars", file, "avatar_url");
  };
  const handleCvChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile("documents", file, "cv_url");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      await authService.updateProfile(formData);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      onSuccess();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Complete Profile</DialogTitle>
          <DialogDescription>
            Update all your personal information, contact details, and professional data
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ProfileBasicInfo
            formData={formData}
            handleChange={handleChange}
            avatarMode={avatarMode}
            setAvatarMode={setAvatarMode}
            handleAvatarChange={handleAvatarChange}
          />
          <ProfileSocialLinks
            formData={formData}
            handleChange={handleChange}
            cvMode={cvMode}
            setCvMode={setCvMode}
            handleCvChange={handleCvChange}
          />
          <ProfileProfessionalInfo
            formData={formData}
            handleChange={handleChange}
          />
          <ProfileFooterSettings
            formData={formData}
            handleChange={handleChange}
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditor;
