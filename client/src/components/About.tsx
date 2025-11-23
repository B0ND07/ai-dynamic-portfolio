
import { useEffect, useState } from "react";
import { Code, Palette, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { skillService, authService } from "@/lib/api";

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
}

interface ProfileData {
  full_name: string;
  bio: string;
  years_experience: string;
  current_company: string;
  current_position: string;
  education: string;
}

const defaultSkills = [
  {
    icon: Code,
    title: "Frontend Development",
    description: "React, TypeScript, Tailwind CSS, Next.js",
    items: ["React", "TypeScript", "Tailwind CSS", "Next.js", "Vue.js"]
  },
  {
    icon: Zap,
    title: "Backend Development", 
    description: "Node.js, Python, PostgreSQL, MongoDB",
    items: ["Node.js", "Python", "PostgreSQL", "MongoDB", "REST APIs"]
  },
  {
    icon: Palette,
    title: "Design & UX",
    description: "Figma, Adobe Creative Suite, UI/UX Design",
    items: ["Figma", "Adobe XD", "Photoshop", "UI Design", "UX Research"]
  }
];

const About = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch skills
      const skillsData = await skillService.list();

      // Fetch profile data
      const profileData = await authService.getProfile();

      setSkills(skillsData || []);
      setProfileData(profileData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const skillCategories = Object.keys(groupedSkills);
  const hasSkills = skillCategories.length > 0;

  const displaySkills = hasSkills 
    ? skillCategories.map((category, index) => ({
        icon: [Code, Zap, Palette][index % 3],
        title: category,
        description: groupedSkills[category].map(s => s.name).join(', '),
        items: groupedSkills[category].map(s => s.name)
      }))
    : defaultSkills;

  const experienceText = profileData?.years_experience 
    ? `${profileData.years_experience} years of experience`
    : "over 5 years of experience";

  const aboutText = profileData?.bio || 
    `I'm a passionate developer with ${experienceText} creating digital experiences that are not only functional but also beautiful and user-friendly.`;

  const journeyText = profileData?.education || profileData?.current_company
    ? `${profileData?.education ? `Educated in ${profileData.education}. ` : ''}${profileData?.current_company ? `Currently working at ${profileData.current_company}${profileData.current_position ? ` as ${profileData.current_position}` : ''}. ` : ''}I believe in writing clean, maintainable code and creating applications that users love to interact with.`
    : "Started as a curious developer who loved solving complex problems, I've grown into a full-stack developer who values both technical excellence and user-centered design. I believe in writing clean, maintainable code and creating applications that users love to interact with.";

  if (loading) {
    return (
      <section id="about" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">About Me</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {aboutText}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {displaySkills.map((skill, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <skill.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{skill.title}</CardTitle>
                <CardDescription>{skill.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skill.items.map((item, itemIndex) => (
                    <span
                      key={itemIndex}
                      className="px-3 py-1 bg-muted text-sm rounded-full hover:bg-muted/80 transition-colors"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* <div className="text-center">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold mb-6">My Journey</h3>
            <p className="text-muted-foreground leading-relaxed">
              {journeyText}
            </p>
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default About;
