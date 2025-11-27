# Personal Portfolio App

A Django-based portfolio application with admin panel and authentication.

## Setup Instructions

1. Install PostgreSQL if not already installed
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure PostgreSQL:
   - Create a database named 'portfolio_db'
   - Update the database settings in `server/server/settings.py` with your PostgreSQL credentials
5. Make migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
6. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```
7. Run the development server:
   ```bash
   python manage.py runserver
   ```

## Change User Password

To change a user's password (password validators are disabled for development):
```bash
python manage.py changepassword <username>
```

## Features
- User authentication
- Project management
- Blog functionality
- Admin panel

## Project Structure
```
portfolio/
├── client/         # Frontend code (WIP)
├── server/         # Django backend
│   ├── portfolio/  # Portfolio app
│   └── server/     # Project configuration
└── venv/          # Virtual environment
```
