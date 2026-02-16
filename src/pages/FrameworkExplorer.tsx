import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Wrench } from 'lucide-react';
import {
  roles,
  skills,
  getSkillsForRole,
  getBehaviorsByLevel,
  getToolsForSkill,
  masteryLevelColors,
  masteryLevelTextColors,
  type Role,
  type Skill,
  type MasteryLevel,
} from '@/data/frameworkData';

const levels: MasteryLevel[] = ['fundamentals', 'intermediate', 'advanced', 'referent'];

const FrameworkExplorer = () => {
  const { t, language } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  if (selectedSkill) {
    const relatedTools = getToolsForSkill(selectedSkill.id);
    return (
      <div className="space-y-6 max-w-4xl">
        <Button variant="ghost" onClick={() => setSelectedSkill(null)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> {t('back')}
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{selectedSkill.name[language]}</h1>
          <p className="text-muted-foreground mt-1">{selectedSkill.description[language]}</p>
        </div>

        <Tabs defaultValue="fundamentals">
          <TabsList className="grid grid-cols-4 w-full">
            {levels.map((level) => (
              <TabsTrigger key={level} value={level} className="text-xs sm:text-sm">
                {t(level)}
              </TabsTrigger>
            ))}
          </TabsList>
          {levels.map((level) => {
            const behaviors = getBehaviorsByLevel(selectedSkill, level);
            return (
              <TabsContent key={level} value={level}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className={`inline-block w-3 h-3 rounded-full ${masteryLevelColors[level]}`} />
                      {t(level)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {behaviors.map((b) => (
                        <li key={b.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <span className={`mt-1 inline-block w-2 h-2 rounded-full shrink-0 ${masteryLevelColors[level]}`} />
                          <span className="text-foreground text-sm">{b.description[language]}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        {relatedTools.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Wrench className="h-5 w-5" /> {t('developmentTools')}
            </h2>
            <div className="grid gap-3">
              {relatedTools.map((tool) => (
                <Card key={tool.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">{tool.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{tool.description[language]}</p>
                      </div>
                      <Badge variant="outline" className="shrink-0 ml-3">{tool.format}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (selectedRole) {
    const roleSkills = getSkillsForRole(selectedRole.id);
    return (
      <div className="space-y-6 max-w-4xl">
        <Button variant="ghost" onClick={() => setSelectedRole(null)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> {t('back')}
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{selectedRole.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{selectedRole.name[language]}</h1>
            <p className="text-muted-foreground">{selectedRole.description[language]}</p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-foreground">{t('skills')}</h2>
        <div className="grid gap-4">
          {roleSkills.map((skill) => (
            <Card
              key={skill.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedSkill(skill)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{skill.name[language]}</CardTitle>
                <CardDescription>{skill.description[language]}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {levels.map((level) => (
                    <Badge
                      key={level}
                      variant="secondary"
                      className={`${masteryLevelTextColors[level]} text-xs`}
                    >
                      {getBehaviorsByLevel(skill, level).length} {t(level)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('frameworkExplorer')}</h1>
        <p className="text-muted-foreground mt-1">
          {language === 'fr'
            ? '4 Rôles · 6 Compétences · 96 Comportements'
            : language === 'es'
            ? '4 Roles · 6 Competencias · 96 Comportamientos'
            : language === 'tr'
            ? '4 Rol · 6 Yetkinlik · 96 Davranış'
            : language === 'zh'
            ? '4个角色 · 6项技能 · 96种行为'
            : '4 Roles · 6 Skills · 96 Behaviors'}
        </p>
      </div>

      {/* Mastery Level Legend */}
      <div className="flex flex-wrap gap-3">
        {levels.map((level) => (
          <div key={level} className="flex items-center gap-2">
            <span className={`inline-block w-3 h-3 rounded-full ${masteryLevelColors[level]}`} />
            <span className="text-sm text-muted-foreground">{t(level)}</span>
          </div>
        ))}
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => {
          const roleSkills = getSkillsForRole(role.id);
          return (
            <Card
              key={role.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedRole(role)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{role.icon}</span>
                  <div>
                    <CardTitle>{role.name[language]}</CardTitle>
                    <CardDescription className="mt-1">{role.description[language]}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {roleSkills.map((skill) => (
                    <Badge key={skill.id} variant="outline">
                      {skill.name[language]}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FrameworkExplorer;
