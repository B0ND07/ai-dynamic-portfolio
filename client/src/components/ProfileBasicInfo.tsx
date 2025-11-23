
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ProfileBasicInfoProps {
  formData: any;
  handleChange: (field: string, value: string) => void;
  avatarMode: "url" | "upload";
  setAvatarMode: (mode: "url" | "upload") => void;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileBasicInfo = ({
  formData,
  handleChange,
  avatarMode,
  setAvatarMode,
  handleAvatarChange,
}: ProfileBasicInfoProps) => (
  <div className="border-b pb-6">
    <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
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
);

export default ProfileBasicInfo;
