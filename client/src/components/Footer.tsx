
import { useEffect, useState } from "react";
import { Github, Linkedin, Mail, Twitter, Globe } from "lucide-react";
import { authService } from "@/lib/api";

interface FooterData {
  full_name: string;
  title: string;
  github_url: string;
  linkedin_url: string;
  twitter_url: string;
  website_url: string;
  email: string;
  footer_description: string;
  services_list: string;
  quick_links: string;
  copyright_text: string;
  footer_social_github: string;
  footer_social_linkedin: string;
  footer_social_email: string;
}

const defaultFooterData: FooterData = {
  full_name: "John Doe",
  title: "Full-Stack Developer",
  github_url: "https://github.com",
  linkedin_url: "https://linkedin.com",
  twitter_url: "",
  website_url: "",
  email: "contact@example.com",
  footer_description: "Passionate about creating beautiful, functional applications.",
  services_list: "",
  quick_links: "",
  copyright_text: "",
  footer_social_github: "",
  footer_social_linkedin: "",
  footer_social_email: ""
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
          github_url: data.footer_social_github || data.github_url || defaultFooterData.github_url,
          linkedin_url: data.footer_social_linkedin || data.linkedin_url || defaultFooterData.linkedin_url,
          twitter_url: data.twitter_url || defaultFooterData.twitter_url,
          website_url: data.website_url || defaultFooterData.website_url,
          email: data.footer_social_email || data.email || defaultFooterData.email,
          footer_description: data.footer_description || defaultFooterData.footer_description,
          services_list: data.services_list || defaultFooterData.services_list,
          quick_links: data.quick_links || defaultFooterData.quick_links,
          copyright_text: data.copyright_text || defaultFooterData.copyright_text,
          footer_social_github: data.footer_social_github || defaultFooterData.footer_social_github,
          footer_social_linkedin: data.footer_social_linkedin || defaultFooterData.footer_social_linkedin,
          footer_social_email: data.footer_social_email || defaultFooterData.footer_social_email,
        });
      }
    } catch (error) {
      console.error('Error fetching footer data:', error);
      setFooterData(defaultFooterData);
    } finally {
      setLoading(false);
    }
  };

  const services = footerData.services_list 
    ? footerData.services_list.split(',').map(s => s.trim()).filter(Boolean)
    : [
        "Web Development",
        "UI/UX Design", 
        "Mobile Apps",
        "Consulting"
      ];

  const quickLinks = footerData.quick_links
    ? footerData.quick_links.split(',').map(link => {
        const trimmed = link.trim();
        const href = trimmed.toLowerCase().replace(/\s+/g, '-');
        return { name: trimmed, href: `#${href}` };
      })
    : [
        {name: "Home", href: "#home" },
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
              {footerData.footer_description || footerData.title}
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
              {footerData.twitter_url && (
                <a
                  href={footerData.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {footerData.website_url && (
                <a
                  href={footerData.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  aria-label="Website"
                >
                  <Globe className="w-5 h-5" />
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
            {footerData.copyright_text } 
            {/* Made with ❤️ by ${footerData.full_name} */}
            {footerData.copyright_text && (
              <span className="mx-2">•</span>
            )}
            © {new Date().getFullYear()} All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
