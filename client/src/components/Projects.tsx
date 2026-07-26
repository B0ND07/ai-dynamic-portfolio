import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";
import { projectService } from "@/lib/api";

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string;
  technologies: string[];
  live_url: string;
  github_url: string;
  featured: boolean;
  status: string;
  created_at?: string;
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await projectService.list();
      // Filter published projects and sort by featured/created_at
      const publishedProjects = data
        .filter((p: Project) => p.status === 'published')
        .sort((a: Project, b: Project) => {
          if (a.featured !== b.featured) return b.featured ? 1 : -1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      setProjects(publishedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="projects" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">My Projects</h2>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">My Projects</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Here are some of the projects I've worked on. Each one represents a unique challenge and learning experience.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center">
            <p className="text-muted-foreground">No projects to display yet.</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${
            projects.length === 1 
              ? 'max-w-md mx-auto' 
              : projects.length === 2 
                ? 'md:grid-cols-2 max-w-3xl mx-auto' 
                : 'md:grid-cols-2 lg:grid-cols-3'
          } gap-8`}>
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group">
                {project.image_url && (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    {project.featured && (
                      <Badge variant="secondary" className="ml-2">Featured</Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-3">
                    {project.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {project.live_url && (
                      <Button size="sm" asChild>
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Live Demo
                        </a>
                      </Button>
                    )}
                    {project.github_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Github className="w-4 h-4 mr-2" />
                          Code
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;
