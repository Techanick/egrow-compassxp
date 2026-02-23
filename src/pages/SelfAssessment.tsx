import { useState, useMemo, useCallback } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  skills,
  MasteryLevel,
  Behavior,
  getBehaviorsByLevel,
  masteryLevelColors,
} from '@/data/frameworkData';
import { ClipboardCheck, ChevronRight, ChevronLeft, CheckCircle2, XCircle, Trophy, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

type Rating = 'hardly_ever' | 'sometimes' | 'often' | 'almost_always';

const MASTERY_LEVELS: MasteryLevel[] = ['fundamentals', 'intermediate', 'advanced', 'referent'];
const VALIDATION_THRESHOLD = 3;

const SelfAssessment = () => {
  const { t, language } = useLanguage();
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const [showResults, setShowResults] = useState(false);

  const currentSkill = skills[currentSkillIndex];
  const totalBehaviors = skills.reduce((sum, s) => sum + s.behaviors.length, 0);
  const ratedCount = Object.keys(ratings).length;

  const ratingOptions: { value: Rating; labelKey: Parameters<typeof t>[0] }[] = [
    { value: 'hardly_ever', labelKey: 'hardlyEver' },
    { value: 'sometimes', labelKey: 'sometimes' },
    { value: 'often', labelKey: 'often' },
    { value: 'almost_always', labelKey: 'almostAlways' },
  ];

  const handleRate = useCallback((behaviorId: string, value: Rating) => {
    setRatings(prev => ({ ...prev, [behaviorId]: value }));
  }, []);

  const getLevelValidation = useCallback((skill: typeof currentSkill, level: MasteryLevel) => {
    const behaviors = getBehaviorsByLevel(skill, level);
    const qualifyingCount = behaviors.filter(
      b => ratings[b.id] === 'often' || ratings[b.id] === 'almost_always'
    ).length;
    return {
      total: behaviors.length,
      qualifying: qualifyingCount,
      validated: qualifyingCount >= VALIDATION_THRESHOLD,
    };
  }, [ratings]);

  const getHighestValidatedLevel = useCallback((skill: typeof currentSkill): MasteryLevel | null => {
    let highest: MasteryLevel | null = null;
    for (const level of MASTERY_LEVELS) {
      if (getLevelValidation(skill, level).validated) {
        highest = level;
      }
    }
    return highest;
  }, [getLevelValidation]);

  const masteryLevelLabel = useCallback((level: MasteryLevel) => {
    const map: Record<MasteryLevel, Parameters<typeof t>[0]> = {
      fundamentals: 'fundamentals',
      intermediate: 'intermediate',
      advanced: 'advanced',
      referent: 'referent',
    };
    return t(map[level]);
  }, [t]);

  const skillRatedCount = useMemo(() => {
    return currentSkill.behaviors.filter(b => ratings[b.id]).length;
  }, [currentSkill, ratings]);

  const handleRestart = () => {
    setRatings({});
    setCurrentSkillIndex(0);
    setShowResults(false);
  };

  if (showResults) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">{t('assessmentResults')}</h1>
          <Button variant="outline" onClick={handleRestart}>
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('restartAssessment')}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              {t('yourMasteryLevels')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">{t('validationRule')}</p>
            <div className="space-y-6">
              {skills.map(skill => {
                const highestLevel = getHighestValidatedLevel(skill);
                return (
                  <div key={skill.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3">{skill.name[language]}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {MASTERY_LEVELS.map(level => {
                        const { qualifying, total, validated } = getLevelValidation(skill, level);
                        return (
                          <div
                            key={level}
                            className={cn(
                              'rounded-lg p-3 border-2 transition-colors',
                              validated
                                ? 'border-primary bg-primary/5'
                                : 'border-muted bg-muted/30'
                            )}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              {validated ? (
                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                              )}
                              <span className="text-xs font-medium truncate">
                                {masteryLevelLabel(level)}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {qualifying}/{total} ≥ {VALIDATION_THRESHOLD}
                            </div>
                            <Badge
                              variant={validated ? 'default' : 'secondary'}
                              className="mt-2 text-xs"
                            >
                              {validated ? t('validatedLevel') : t('notYetValidated')}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                    {highestLevel && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{t('validatedLevel')}:</span>
                        <Badge className={cn(masteryLevelColors[highestLevel], 'text-white')}>
                          {masteryLevelLabel(highestLevel)}
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('selfAssessment')}</h1>
        <p className="text-muted-foreground mt-1">{t('assessmentIntro')}</p>
      </div>

      {/* Overall progress */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              {ratedCount} {t('of')} {totalBehaviors} {t('behaviorRated')}
            </span>
            <span className="font-medium">{Math.round((ratedCount / totalBehaviors) * 100)}%</span>
          </div>
          <Progress value={(ratedCount / totalBehaviors) * 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Skill tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {skills.map((skill, idx) => {
          const rated = skill.behaviors.filter(b => ratings[b.id]).length;
          const total = skill.behaviors.length;
          const complete = rated === total;
          return (
            <button
              key={skill.id}
              onClick={() => setCurrentSkillIndex(idx)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap border transition-colors',
                idx === currentSkillIndex
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border hover:border-primary/50'
              )}
            >
              {complete && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
              <span>{skill.name[language]}</span>
              <span className="text-xs text-muted-foreground">
                {rated}/{total}
              </span>
            </button>
          );
        })}
      </div>

      {/* Current skill assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            {currentSkill.name[language]}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{currentSkill.description[language]}</p>
          <div className="flex items-center gap-2 text-sm mt-1">
            <span className="text-muted-foreground">
              {skillRatedCount}/{currentSkill.behaviors.length} {t('behaviorRated')}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Validation status per level */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {MASTERY_LEVELS.map(level => {
              const { qualifying, validated } = getLevelValidation(currentSkill, level);
              return (
                <div
                  key={level}
                  className={cn(
                    'text-center rounded-md p-2 text-xs border',
                    validated ? 'border-primary bg-primary/5' : 'border-border'
                  )}
                >
                  <div className="font-medium">{masteryLevelLabel(level)}</div>
                  <div className="text-muted-foreground mt-0.5">
                    {qualifying} / {VALIDATION_THRESHOLD}
                    {validated && ' ✓'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Behaviors grouped by level */}
          {MASTERY_LEVELS.map(level => {
            const behaviors = getBehaviorsByLevel(currentSkill, level);
            if (behaviors.length === 0) return null;
            return (
              <div key={level}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn('w-3 h-3 rounded-full', masteryLevelColors[level])} />
                  <h3 className="font-semibold text-sm">{masteryLevelLabel(level)}</h3>
                </div>
                <div className="space-y-4">
                  {behaviors.map(behavior => (
                    <BehaviorRatingRow
                      key={behavior.id}
                      behavior={behavior}
                      rating={ratings[behavior.id]}
                      onRate={handleRate}
                      ratingOptions={ratingOptions}
                      language={language}
                      t={t}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={currentSkillIndex === 0}
          onClick={() => setCurrentSkillIndex(i => i - 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t('back')}
        </Button>

        {currentSkillIndex < skills.length - 1 ? (
          <Button onClick={() => setCurrentSkillIndex(i => i + 1)}>
            {t('next')}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={() => setShowResults(true)}>
            {t('submitAssessment')}
            <CheckCircle2 className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};

interface BehaviorRatingRowProps {
  behavior: Behavior;
  rating: Rating | undefined;
  onRate: (id: string, value: Rating) => void;
  ratingOptions: { value: Rating; labelKey: Parameters<ReturnType<typeof useLanguage>['t']>[0] }[];
  language: ReturnType<typeof useLanguage>['language'];
  t: ReturnType<typeof useLanguage>['t'];
}

const BehaviorRatingRow = ({ behavior, rating, onRate, ratingOptions, language, t }: BehaviorRatingRowProps) => (
  <div className="border rounded-lg p-4 bg-card">
    <p className="text-sm mb-3">{behavior.description[language]}</p>
    <RadioGroup
      value={rating || ''}
      onValueChange={(v) => onRate(behavior.id, v as Rating)}
      className="flex flex-wrap gap-3"
    >
      {ratingOptions.map(opt => (
        <div key={opt.value} className="flex items-center gap-1.5">
          <RadioGroupItem value={opt.value} id={`${behavior.id}-${opt.value}`} />
          <Label
            htmlFor={`${behavior.id}-${opt.value}`}
            className={cn(
              'text-xs cursor-pointer',
              rating === opt.value ? 'font-semibold text-primary' : 'text-muted-foreground'
            )}
          >
            {t(opt.labelKey)}
          </Label>
        </div>
      ))}
    </RadioGroup>
  </div>
);

export default SelfAssessment;
