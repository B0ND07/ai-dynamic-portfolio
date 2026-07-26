# ✨ Dynamic Portfolio

> Your portfolio, always up to date — without ever touching the code.

Dynamic Portfolio is an **AI-powered personal portfolio platform** where everything is live and editable. Update your bio, add a new project, adjust your skills, or generate a tailored resume with AI — all from a built-in dashboard. Visitors always see the latest version of you, and you never have to redeploy to make a change. 🚀

## ✨ Key Features

- 🌍 **Public portfolio page** — Hero, About, Projects, Skills, and Contact sections, all data-driven from the database
- 🔑 **JWT authentication** — supports login with either username or email; automatic access token refresh
- 🖥️ **Custom admin dashboard** — in-app UI at `/admin/dashboard` to manage profile sections, projects, skills, and resumes without touching Django admin
- 🛡️ **Django admin panel** — available at `/admin/` for superuser access to all models
- 🤖 **AI resume generation** — powered by Google Gemini; generates tailored resumes from profile and project data, with PDF export
- 💡 **AI project descriptions** — auto-generates project descriptions by analyzing GitHub repo details and tech stack
- 🌙 **Dark/light mode** — theme toggle persisted in localStorage
- 📬 **Contact form** — messages stored in the database, viewable in the admin dashboard
- 📱 **Responsive design** — adaptive layouts including smart grid centering for fewer items
