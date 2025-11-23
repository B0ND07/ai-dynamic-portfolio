
import { useEffect, useState } from "react";
import { Github, Linkedin, Mail } from "lucide-react";
import { authService } from "@/lib/api";

interface FooterData {
  full_name: string;
  title: string;
  github_url: string;
  linkedin_url: string;
  email: string;
}

const defaultFooterData: FooterData = {
  full_name: "John Doe",
  title: "Full-Stack Developer",
  github_url: "https://github.com",
  linkedin_url: "https://linkedin.com",
  email: "contact@example.com"
};

const Footer = () => {
  const [footerData, setFooterData] = useState<FooterData>(defaultFooterData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      const data = await authService.getProfile();

      if (data) {
        setFooterData({
          full_name: data.full_name || defaultFooterData.full_name,
          title: data.title || defaultFooterData.title,
          github_url: data.github_url || defaultFooterData.github_url,
          linkedin_url: data.linkedin_url || defaultFooterData.linkedin_url,
          email: data.email || defaultFooterData.email,
        });
      }
    } catch (error) {
      console.error('Error fetching footer data:', error);
      setFooterData(defaultFooterData);
    } finally {
      setLoading(false);
    }
  };

  const services = [
    "Web Development",
    "UI/UX Design", 
    "Mobile Apps",
    "Consulting"
  ];

  const quickLinks = [
    { name: "About", href: "#about" },
    { name: "Projects", href: "#projects" },
    { name: "Contact", href: "#contact" }
  ];

  if (loading) {
    return (
      <footer className="bg-background border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-background border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">{footerData.full_name}</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {footerData.title}
            </p>
            <div className="flex space-x-4">
              {footerData.github_url && (
                <a
                  href={footerData.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
              )}
              {footerData.linkedin_url && (
                <a
                  href={footerData.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {footerData.email && (
                <a
                  href={`mailto:${footerData.email}`}
                  className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-muted-foreground">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-muted-foreground">
              {services.map((service, index) => (
                <li key={index}>{service}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 text-center">
          <p className="text-muted-foreground flex items-center justify-center">
            Made with ❤️ by {footerData.full_name}
            <span className="mx-2">•</span>
            © {new Date().getFullYear()} All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
