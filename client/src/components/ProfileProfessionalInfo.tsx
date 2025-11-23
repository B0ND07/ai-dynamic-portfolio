
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProfileProfessionalInfoProps {
  formData: any;
  handleChange: (field: string, value: string) => void;
}

const ProfileProfessionalInfo = ({
  formData,
  handleChange,
}: ProfileProfessionalInfoProps) => (
  <div className="border-b pb-6">
    <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="current_position">Current Position</Label>
        <Input
          id="current_position"
          value={formData.current_position}
          onChange={(e) => handleChange("current_position", e.target.value)}
          placeholder="Senior Software Engineer"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="current_company">Current Company</Label>
        <Input
          id="current_company"
          value={formData.current_company}
          onChange={(e) => handleChange("current_company", e.target.value)}
          placeholder="Tech Corp Inc."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="years_experience">Years of Experience</Label>
        <Input
          id="years_experience"
          value={formData.years_experience}
          onChange={(e) => handleChange("years_experience", e.target.value)}
          placeholder="5+ years"
        />
      </div>
    </div>
    <div className="space-y-2 mt-4">
      <Label htmlFor="education">Education</Label>
      <Textarea
        id="education"
        rows={3}
        value={formData.education}
        onChange={(e) => handleChange("education", e.target.value)}
        placeholder="Bachelor's in Computer Science, University of Technology (2019)"
      />
    </div>
    <div className="space-y-2 mt-4">
      <Label htmlFor="certifications">Certifications</Label>
      <Textarea
        id="certifications"
        rows={3}
        value={formData.certifications}
        onChange={(e) => handleChange("certifications", e.target.value)}
        placeholder="AWS Certified Developer, Google Cloud Professional, etc."
      />
    </div>
  </div>
);

export default ProfileProfessionalInfo;
