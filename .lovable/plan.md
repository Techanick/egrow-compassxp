
# Expanscience Management Framework Companion App

## Overview
A multilingual (English, French, Spanish, Turkish, Chinese) professional development companion for Expanscience managers. The app digitizes the Management Framework document into an interactive tool with self-assessment, development planning, and progress tracking — integrated into the performance management cycle.

---

## 1. Authentication & User Profiles
- **Login page** with email/password authentication (Supabase Auth)
- **User profiles** storing name, role, language preference, department, and reporting manager
- **Role-based access**: Manager (self-use) and HR/Supervisor (review access)
- **Language selector** available at login and throughout the app (EN, FR, ES, TR, ZH)

## 2. Dashboard — Manager's Home
- **Welcome view** with the manager's current focus skills and upcoming review dates
- **Progress summary**: radar/spider chart showing current mastery level across the 6 skills
- **Periodic reminders**: daily tips, monthly self-assessment prompts, quarterly development review nudges
- **Quick actions**: Start self-assessment, Update development plan, Browse framework

## 3. Framework Explorer (Reference Tool)
- **Visual overview** of the 4 Roles → 6 Skills structure with the iconic diagram from the PDF
- **Drill-down navigation**: Role → Skill → Behaviors by mastery level (Fundamentals, Intermediate, Advanced, Referent/Role Model)
- **96 behaviors** fully detailed with descriptions from the framework
- **Development tools catalog**: listing all tools (Insights Discovery, Assertogram, NVC, SMART Objectives, etc.) with descriptions, when to use, and format — linked to the relevant skills

## 4. Self-Assessment Module
- **Guided self-assessment** across all 6 skills and their behaviors
- For each behavior, the manager rates observation frequency: Hardly ever / Sometimes / Often / Almost always
- **Level validation logic**: A mastery level is validated when at least 3 behaviors at that level are rated "often" or "almost always"
- **Assessment history**: track assessments over time to see progression
- **Periodic prompts**: reminder to complete assessment at least once per year (Q3 development interview), with option for more frequent check-ins

## 5. Development Plan Builder
- After self-assessment, the app **recommends 1-2 skills** to focus on based on gaps
- Manager selects target skills, target mastery level, and specific behaviors to work on
- **Action plan creation**: for each selected behavior, define concrete development actions (training, reading, feedback sessions, co-development, coaching, etc.)
- **Timeline & milestones**: set deadlines aligned with the performance cycle
- **Progress tracking**: mark actions as in-progress or completed

## 6. HR & Supervisor View
- **Supervisor dashboard**: see direct reports' self-assessments and development plans
- **Validation workflow**: supervisor can review and validate self-assessments during Q3 interviews
- **Team overview**: aggregated view of team skill levels to identify collective development needs
- **360° feedback support**: ability to select 10-20 behaviors for a manager and invite peers/reports to rate them

## 7. Multilingual Support
- Full app content in **5 languages**: English, French, Spanish, Turkish, Chinese
- All 96 behaviors, role descriptions, skill definitions, and UI text translated
- Language toggle accessible from any screen, preference saved per user

## 8. Design & Navigation
- **Clean, professional design** with Expanscience brand feel
- **Sidebar navigation**: Dashboard, Framework Explorer, Self-Assessment, Development Plan, Team (for supervisors)
- **Responsive layout** for desktop and tablet use
- **Color-coded mastery levels** for quick visual scanning (Fundamentals → Referent/Role Model)
