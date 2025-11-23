import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { skillService } from "@/lib/api";

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
}

interface SkillsManagerProps {
  onClose: () => void;
  onSuccess: () => void;
}

const SkillsManager = ({ onClose, onSuccess }: SkillsManagerProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState({
    name: "",
    category: "",
    proficiency: 50
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    "Frontend Development",
    "Backend Development",
    "Design & UX",
    "Tools & Technologies",
    "Soft Skills"
  ];

  useEffect(() => {
    if (user) {
      fetchSkills();
    }
  }, [user]);

  const fetchSkills = async () => {
    try {
      const data = await skillService.list();
      setSkills(data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const addSkill = async () => {
    if (!user || !newSkill.name || !newSkill.category) return;

    setIsSubmitting(true);
    try {
      await skillService.create({
        name: newSkill.name,
        category: newSkill.category,
        proficiency: newSkill.proficiency
      });

      setNewSkill({ name: "", category: "", proficiency: 50 });
      fetchSkills();
      
      toast({
        title: "Skill added",
        description: "New skill has been added to your profile.",
      });
    } catch (error) {
      console.error('Error adding skill:', error);
      toast({
        title: "Error",
        description: "Failed to add skill.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteSkill = async (skillId: string) => {
    try {
      await skillService.delete(skillId);

      fetchSkills();
      toast({
        title: "Skill deleted",
        description: "Skill has been removed from your profile.",
      });
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast({
        title: "Error",
        description: "Failed to delete skill.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Skills</DialogTitle>
          <DialogDescription>
            Add and manage your technical and professional skills
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add new skill */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold">Add New Skill</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skill-name">Skill Name</Label>
                <Input
                  id="skill-name"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., React, Python, Figma"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skill-category">Category</Label>
                <Select value={newSkill.category} onValueChange={(value) => setNewSkill(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skill-proficiency">Proficiency: {newSkill.proficiency}%</Label>
                <Slider
                  value={[newSkill.proficiency]}
                  onValueChange={(value) => setNewSkill(prev => ({ ...prev, proficiency: value[0] }))}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>
            <Button onClick={addSkill} disabled={isSubmitting || !newSkill.name || !newSkill.category}>
              <Plus className="w-4 h-4 mr-2" />
              Add Skill
            </Button>
          </div>

          {/* Existing skills */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Skills</h3>
            {categories.map((category) => {
              const categorySkills = skills.filter(skill => skill.category === category);
              if (categorySkills.length === 0) return null;

              return (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">{category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {categorySkills.map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{skill.name}</span>
                            <Badge variant="secondary">{skill.proficiency}%</Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteSkill(skill.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {skills.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No skills added yet. Add your first skill above!
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onSuccess}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SkillsManager;
