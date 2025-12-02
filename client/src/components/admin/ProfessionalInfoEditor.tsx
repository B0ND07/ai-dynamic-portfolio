import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/api";

interface ProfessionalInfoEditorProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface ProfessionalInfoFormData {
  years_experience: string;
  current_company: string;
  current_position: string;
  education: string;
}

const initialFormData: ProfessionalInfoFormData = {
  years_experience: "",
  current_company: "",
  current_position: "",
  education: "",
};

const ProfessionalInfoEditor = ({ onClose, onSuccess }: ProfessionalInfoEditorProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProfessionalInfoFormData>(initialFormData);

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
        years_experience: data.years_experience || "",
        current_company: data.current_company || "",
        current_position: data.current_position || "",
        education: data.education || "",
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
        title: "Professional info updated",
        description: "Your professional information has been updated successfully.",
      });
      onSuccess();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update professional info.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ProfessionalInfoFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Professional Information</DialogTitle>
          <DialogDescription>
            Update your work experience and education background
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="years_experience">Years of Experience</Label>
                <Input
                  id="years_experience"
                  type="number"
                  min="0"
                  value={formData.years_experience || ""}
                  onChange={(e) => handleChange("years_experience", e.target.value)}
                  placeholder="5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_company">Current Company</Label>
                <Input
                  id="current_company"
                  value={formData.current_company}
                  onChange={(e) => handleChange("current_company", e.target.value)}
                  placeholder="Tech Corp"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_position">Current Position</Label>
                <Input
                  id="current_position"
                  value={formData.current_position}
                  onChange={(e) => handleChange("current_position", e.target.value)}
                  placeholder="Senior Developer"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="education">Education</Label>
              <Textarea
                id="education"
                value={formData.education}
                onChange={(e) => handleChange("education", e.target.value)}
                placeholder="Bachelor's Degree in Computer Science\nUniversity Name, Year"
                rows={3}
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

export default ProfessionalInfoEditor;
