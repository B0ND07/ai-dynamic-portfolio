import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2, Award } from "lucide-react";
import { authService } from "@/lib/api";

interface CertificationsEditorProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Certification {
  title: string;
  link: string;
}

const CertificationsEditor = ({ onClose, onSuccess }: CertificationsEditorProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newLink, setNewLink] = useState("");

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchProfile = async () => {
    try {
      const data = await authService.getProfile();
      if (data && data.certifications) {
        // Parse existing certifications from "Title - URL" format
        const parsed = data.certifications.split('\n')
          .filter(cert => cert.trim())
          .map(cert => {
            const parts = cert.split(' - ');
            return {
              title: parts[0]?.trim() || "",
              link: parts[1]?.trim() || ""
            };
          });
        setCertifications(parsed);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleAdd = () => {
    if (!newTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a certification title.",
        variant: "destructive",
      });
      return;
    }

    setCertifications([...certifications, { title: newTitle.trim(), link: newLink.trim() }]);
    setNewTitle("");
    setNewLink("");
  };

  const handleRemove = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      // Convert certifications array back to "Title - URL" format
      const certificationsText = certifications
        .map(cert => cert.link ? `${cert.title} - ${cert.link}` : cert.title)
        .join('\n');

      await authService.updateProfile({ certifications: certificationsText });
      toast({
        title: "Certifications updated",
        description: "Your certifications have been updated successfully.",
      });
      onSuccess();
    } catch (error) {
      console.error('Error updating certifications:', error);
      toast({
        title: "Error",
        description: "Failed to update certifications.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Certifications</DialogTitle>
          <DialogDescription>
            Add and manage your professional certifications and credentials
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Add New Certification */}
          <div className="space-y-4 border-b pb-6">
            <h3 className="text-sm font-semibold">Add New Certification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Certification Title *</Label>
                <Input
                  id="title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="AWS Certified Developer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link">Certificate Link (optional)</Label>
                <Input
                  id="link"
                  type="url"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder="https://example.com/certificate"
                />
              </div>
            </div>
            <Button type="button" onClick={handleAdd} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Certification
            </Button>
          </div>

          {/* Certifications List */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Your Certifications ({certifications.length})</h3>
            {certifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No certifications added yet</p>
                <p className="text-sm">Add your first certification above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {certifications.map((cert, index) => (
                  <div key={index} className="flex items-start justify-between p-4 border rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Award className="w-4 h-4 text-primary" />
                        <h4 className="font-medium">{cert.title}</h4>
                      </div>
                      {cert.link && (
                        <a 
                          href={cert.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          🔗 {cert.link}
                        </a>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
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

export default CertificationsEditor;
