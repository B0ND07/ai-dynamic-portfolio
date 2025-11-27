
import { useEffect, useState } from "react";
import { ArrowDown, Github, Linkedin, Mail, Globe, Phone, MapPin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/api";

const SINGLE_USER_ID = "40e4430a-ea37-4a09-958f-b622fbb555af";

interface ProfileData {
  full_name: string;
  title: string;
  bio: string;
  github_url: string;
  linkedin_url: string;
  twitter_url: string;
  website_url: string;
  email: string;
  avatar_url: string;
  cv_url: string;
}

const defaultProfileData: ProfileData = {
  full_name: "John Doe",
  title: "Full-Stack Developer & Creative Problem Solver",
  bio: "I create beautiful, functional web applications that solve real-world problems. Passionate about clean code, user experience, and cutting-edge technologies.",
  github_url: "",
  linkedin_url: "",
  twitter_url: "",
  website_url: "",
  email: "",
  avatar_url: "",
  cv_url: ""
};

const Hero = () => {
  const [profileData, setProfileData] = useState<ProfileData>(defaultProfileData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const data = await authService.getProfile();

      if (!data) {
        console.log('No profile data found, using defaults');
        setProfileData(defaultProfileData);
        return;
      }

      setProfileData({
        full_name: data.full_name || defaultProfileData.full_name,
        title: data.title || defaultProfileData.title,
        bio: data.bio || defaultProfileData.bio,
        github_url: data.github_url || defaultProfileData.github_url,
        linkedin_url: data.linkedin_url || defaultProfileData.linkedin_url,
        twitter_url: data.twitter_url || defaultProfileData.twitter_url,
        website_url: data.website_url || defaultProfileData.website_url,
        email: data.email || defaultProfileData.email,
        avatar_url: data.avatar_url || defaultProfileData.avatar_url,
        cv_url: data.cv_url || defaultProfileData.cv_url
      });
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setProfileData(defaultProfileData);
    } finally {
      setLoading(false);
    }
  };

  const scrollToAbout = () => {
    const aboutSection = document.getElementById("about");
    aboutSection?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToProjects = () => {
    const projectsSection = document.getElementById("projects");
    projectsSection?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDownloadCV = () => {
    if (profileData.cv_url) {
      window.open(profileData.cv_url, '_blank');
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground animate-fade-in">
              Hi, I'm{" "}
              <span className="text-primary bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {profileData.full_name}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-fade-in-delay">
              {profileData.title}
            </p>
            {/* <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in-delay-2">
              {profileData.bio}
            </p> */}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-3">
            <Button 
              size="lg" 
              className="px-8 py-3 text-lg hover:scale-105 transition-transform" 
              onClick={scrollToProjects}
            >
              View My Work
            </Button>
            {profileData.cv_url && (
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-3 text-lg hover:scale-105 transition-transform" 
                onClick={handleDownloadCV}
              >
                Download CV
              </Button>
            )}
          </div>

          <div className="flex justify-center space-x-6 animate-fade-in-delay-4">
            {profileData.github_url && (
              <a
                href={profileData.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-muted hover:bg-muted/80 hover:scale-110 transition-all duration-200"
                aria-label="GitHub Profile"
              >
                <Github className="w-6 h-6" />
              </a>
            )}
            {profileData.linkedin_url && (
              <a
                href={profileData.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-muted hover:bg-muted/80 hover:scale-110 transition-all duration-200"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            )}
            {profileData.twitter_url && (
              <a
                href={profileData.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-muted hover:bg-muted/80 hover:scale-110 transition-all duration-200"
                aria-label="Twitter Profile"
              >
                <Twitter className="w-6 h-6" />
              </a>
            )}
            {profileData.website_url && (
              <a
                href={profileData.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-muted hover:bg-muted/80 hover:scale-110 transition-all duration-200"
                aria-label="Personal Website"
              >
                <Globe className="w-6 h-6" />
              </a>
            )}
            {profileData.email && (
              <a
                href={`mailto:${profileData.email}`}
                className="p-3 rounded-full bg-muted hover:bg-muted/80 hover:scale-110 transition-all duration-200"
                aria-label="Send Email"
              >
                <Mail className="w-6 h-6" />
              </a>
            )}
          </div>

          <button
            onClick={scrollToAbout}
            className="animate-bounce p-2 rounded-full hover:bg-muted/50 transition-colors"
            aria-label="Scroll to About section"
          >
            <ArrowDown className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
