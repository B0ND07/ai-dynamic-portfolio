import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProfileFooterSettingsProps {
  formData: any;
  handleChange: (field: string, value: string) => void;
}

const ProfileFooterSettings = ({
  formData,
  handleChange,
}: ProfileFooterSettingsProps) => (
  <div className="border-b pb-6">
    <h3 className="text-lg font-semibold mb-4">Footer Settings</h3>
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
  </div>
);

export default ProfileFooterSettings;
