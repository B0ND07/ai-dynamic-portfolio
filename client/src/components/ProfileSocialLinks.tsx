
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ProfileSocialLinksProps {
  formData: any;
  handleChange: (field: string, value: string) => void;
  cvMode: "url" | "upload";
  setCvMode: (mode: "url" | "upload") => void;
  handleCvChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileSocialLinks = ({
  formData,
  handleChange,
  cvMode,
  setCvMode,
  handleCvChange,
}: ProfileSocialLinksProps) => (
  <div className="border-b pb-6">
    <h3 className="text-lg font-semibold mb-4">Social Links & URLs</h3>
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
);

export default ProfileSocialLinks;
