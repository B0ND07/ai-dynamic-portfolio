import { useState, useEffect, ChangeEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/api";

interface BasicInfoEditorProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface BasicInfoFormData {
  full_name: string;
  title: string;
  bio: string;
  avatar_url: string;
  email: string;
  phone: string;
  location: string;
}

const initialFormData: BasicInfoFormData = {
  full_name: "",
  title: "",
  bio: "",
  avatar_url: "",
  email: "",
  phone: "",
  location: "",
};

const BasicInfoEditor = ({ onClose, onSuccess }: BasicInfoEditorProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<BasicInfoFormData>(initialFormData);
  const [avatarMode, setAvatarMode] = useState<"url" | "upload">("url");

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
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setFormData(initialFormData);
    }
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
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
        title: "Basic info updated",
        description: "Your basic information has been updated successfully.",
      });
      onSuccess();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update basic info.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof BasicInfoFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Basic Information</DialogTitle>
          <DialogDescription>
            Update your name, title, bio, and contact details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Professional Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Full-Stack Developer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="New York, NY"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar_url">Avatar</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={avatarMode === "upload" ? "default" : "outline"}
                    onClick={() => setAvatarMode("upload")}
                  >Upload</Button>
                  <Button
                    type="button"
                    variant={avatarMode === "url" ? "default" : "outline"}
                    onClick={() => setAvatarMode("url")}
                  >URL</Button>
                </div>
                {avatarMode === "upload" ? (
                  <Input
                    id="avatar_upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                ) : (
                  <Input
                    id="avatar_url"
                    placeholder="https://example.com/avatar.jpg"
                    value={formData.avatar_url}
                    onChange={(e) => handleChange("avatar_url", e.target.value)}
                  />
                )}
                {formData.avatar_url && (
                  <img
                    src={formData.avatar_url}
                    alt="Avatar"
                    className="h-16 w-16 mt-2 rounded-full border"
                  />
                )}
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={4}
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
              />
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

export default BasicInfoEditor;
