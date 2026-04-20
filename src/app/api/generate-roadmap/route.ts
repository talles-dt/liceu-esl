import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNvidiaClient, NVIDIA_MODEL } from "@/lib/nvidia";

interface RoadmapRequest {
  answers: number[];
  questions: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    cefr_level: string;
    skill: string;
    difficulty_score: number;
    context?: string;
  }>;
  targetLevel?: string; // Optional: student's desired level (default: C2)
}

interface SkillAnalysis {
  accuracy: number;
  weighted_score: number;
  avg_difficulty: number;
  total: number;
  correct: number;
}

interface LevelAnalysis {
  accuracy: number;
  weighted_score: number;
  avg_difficulty: number;
  total: number;
  correct: number;
  passed: boolean;
}

// CEFR level order and metadata
const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];
const LEVEL_HOURS: Record<string, number> = {
  A1: 80,   // Hours to complete A1 from zero
  A2: 160,  // Additional hours to reach A2
  B1: 300,  // Additional hours to reach B1
  B2: 500,  // Additional hours to reach B2
  C1: 750,  // Additional hours to reach C1
  C2: 1000, // Additional hours to reach C2
};

const STUDY_TOPICS: Record<string, string[]> = {
  A1: [
    "Verb 'to be' (am/is/are)",
    "Articles (a/an/the)",
    "Singular and plural nouns",
    "Simple present tense",
    "Personal pronouns (I/you/he/she/we/they)",
    "Basic prepositions (in/on/at/to/from)",
    "Demonstratives (this/that/these/those)",
    "Possessive adjectives (my/your/his/her)",
    "Numbers 1-100",
    "Common everyday vocabulary",
  ],
  A2: [
    "Past simple (regular and irregular verbs)",
    "Future forms (going to/will)",
    "Comparative and superlative adjectives",
    "Adverbs of frequency",
    "Countable and uncountable nouns",
    "Some/any/no/every compounds",
    "Modal verbs (can/could/must/should)",
    "Prepositions of place and movement",
    "Extended vocabulary for daily life",
    "Basic phrasal verbs",
  ],
  B1: [
    "Present perfect vs past simple",
    "Past perfect",
    "Future continuous and future perfect",
    "Conditionals (type 1 and 2)",
    "Relative clauses (who/which/that/whose)",
    "Reported speech (statements and questions)",
    "Passive voice (present and past)",
    "Gerunds vs infinitives",
    "Quantifiers (much/many/little/few)",
    "Intermediate phrasal verbs",
  ],
  B2: [
    "Advanced conditionals (type 3 and mixed)",
    "Modal verbs of deduction",
    "Wish and regret structures",
    "Causative have/get",
    "Inversion for emphasis",
    "Discourse markers",
    "Advanced phrasal verbs",
    "Collocations and fixed expressions",
    "Nuanced tense usage",
    "Formal and informal register",
  ],
  C1: [
    "Cleft sentences",
    "Advanced inversion",
    "Subjunctive mood",
    "Ellipsis and substitution",
    "Advanced academic vocabulary",
    "Idiomatic expressions",
    "Pragmatics and implied meaning",
    "Complex collocations",
    "Stylistic variation",
    "Sophisticated discourse markers",
  ],
  C2: [
    "Near-native fluency refinement",
    "Rare idioms and proverbs",
    "Cultural references",
    "Specialized vocabulary",
    "Dialectal variations",
    "Archaic and literary forms",
    "Humor and wordplay",
    "Rhetorical devices",
    "Register shifting",
    "Perfect grammatical intuition",
  ],
};

/**
 * Calculate weighted evaluation with contextual comprehension analysis
 */
function analyzeResults(
  answers: number[],
  questions: RoadmapRequest["questions"]
) {
  const skills: Record<string, SkillAnalysis> = {};
  const levels: Record<string, LevelAnalysis> = {};
  let contextualQuestionsTotal = 0;
  let contextualQuestionsCorrect = 0;

  questions.forEach((q, i) => {
    // Initialize skill tracking
    if (!skills[q.skill]) {
      skills[q.skill] = {
        accuracy: 0,
        weighted_score: 0,
        avg_difficulty: 0,
        total: 0,
        correct: 0,
      };
    }

    // Initialize level tracking
    if (!levels[q.cefr_level]) {
      levels[q.cefr_level] = {
        accuracy: 0,
        weighted_score: 0,
        avg_difficulty: 0,
        total: 0,
        correct: 0,
        passed: false,
      };
    }

    skills[q.skill].total++;
    levels[q.cefr_level].total++;

    const isCorrect = answers[i] === q.correctIndex;

    if (isCorrect) {
      skills[q.skill].correct++;
      skills[q.skill].weighted_score += q.difficulty_score;
      levels[q.cefr_level].correct++;
      levels[q.cefr_level].weighted_score += q.difficulty_score;

      // Track contextual comprehension (questions with context passages)
      if (q.context) {
        contextualQuestionsTotal++;
        contextualQuestionsCorrect++;
      }
    }

    // Count all contextual questions for scoring
    if (q.context && !isCorrect) {
      contextualQuestionsTotal++;
    }
  });

  // Calculate final metrics
  Object.keys(skills).forEach((skill) => {
    const s = skills[skill];
    s.accuracy = s.total > 0 ? (s.correct / s.total) * 100 : 0;
    s.avg_difficulty = s.correct > 0 ? s.weighted_score / s.correct : 0;
  });

  Object.keys(levels).forEach((lvl) => {
    const l = levels[lvl];
    l.accuracy = l.total > 0 ? (l.correct / l.total) * 100 : 0;
    l.avg_difficulty = l.correct > 0 ? l.weighted_score / l.correct : 0;
    l.passed = l.accuracy >= 50; // 50% threshold to pass a level
  });

  const contextualComprehensionScore =
    contextualQuestionsTotal > 0
      ? (contextualQuestionsCorrect / contextualQuestionsTotal) * 100
      : 0;

  return { skills, levels, contextualComprehensionScore };
}

/**
 * Determine overall CEFR level using weighted algorithm
 */
function determineOverallLevel(
  levels: Record<string, LevelAnalysis>
): string {
  let determinedLevel = "A1";
  let highestConfidenceScore = 0;

  for (const lvl of LEVEL_ORDER) {
    const data = levels[lvl];
    if (!data || data.total === 0) continue;

    const baseAccuracy = data.accuracy / 100;
    const avgDifficulty = data.avg_difficulty;
    const levelWeight = LEVEL_ORDER.indexOf(lvl) + 1;

    // Confidence score combines accuracy, difficulty, and level progression
    const confidenceScore = baseAccuracy * (avgDifficulty / 5.0) * levelWeight;

    // Must have at least 50% accuracy to pass this level
    if (data.passed && confidenceScore > highestConfidenceScore) {
      highestConfidenceScore = confidenceScore;
      determinedLevel = lvl;
    } else if (!data.passed) {
      break; // Stop at first level where user struggles
    }
  }

  // Edge case: if no level passed 50%, assign A1
  const a1Data = levels["A1"];
  if (a1Data && a1Data.accuracy < 50) {
    determinedLevel = "A1";
  }

  return determinedLevel;
}

/**
 * Generate structured study plan based on current level and gaps
 */
function generateStudyPlan(
  currentLevel: string,
  targetLevel: string,
  weaknesses: string[],
  skillBreakdown: Record<string, SkillAnalysis>
) {
  const currentIndex = LEVEL_ORDER.indexOf(currentLevel);
  const targetIndex = LEVEL_ORDER.indexOf(targetLevel);
  const phases = [];

  // Generate phases for each level between current and target
  for (let i = currentIndex; i <= targetIndex; i++) {
    const level = LEVEL_ORDER[i];
    const topics = STUDY_TOPICS[level];

    // Prioritize weak areas in this level
    const priorityTopics = topics.filter((topic) =>
      weaknesses.some((w) =>
        topic.toLowerCase().includes(w.toLowerCase())
      )
    );

    phases.push({
      phase_name: `Level ${level} Mastery`,
      phase_order: i - currentIndex + 1,
      description: `Master all ${level} competencies with focus on identified weak areas`,
      topics: priorityTopics.length > 0 ? priorityTopics : topics.slice(0, 5),
      estimated_hours: LEVEL_HOURS[level],
      status: i === currentIndex ? "in_progress" : "pending",
    });
  }

  return phases;
}

/**
 * Estimate time to proficiency based on current level, target level, and performance
 */
function estimateTimeToProficiency(
  currentLevel: string,
  targetLevel: string,
  overallAccuracy: number
) {
  const currentIndex = LEVEL_ORDER.indexOf(currentLevel);
  const targetIndex = LEVEL_ORDER.indexOf(targetLevel);

  // Sum hours needed for remaining levels
  let totalHours = 0;
  for (let i = currentIndex; i < targetIndex; i++) {
    totalHours += LEVEL_HOURS[LEVEL_ORDER[i + 1]];
  }

  // Adjust based on performance (better accuracy = less time needed)
  const performanceFactor = overallAccuracy >= 80 ? 0.8 : overallAccuracy >= 60 ? 1.0 : 1.2;
  const adjustedHours = Math.round(totalHours * performanceFactor);

  // Calculate weeks at recommended pace (5 hours/week default)
  const recommendedHoursPerWeek = 5;
  const weeks = Math.ceil(adjustedHours / recommendedHoursPerWeek);

  return {
    estimated_hours: adjustedHours,
    estimated_weeks: weeks,
    recommended_hours_per_week: recommendedHoursPerWeek,
  };
}

/**
 * Identify strengths and weaknesses from skill breakdown
 */
function analyzeStrengthsAndWeaknesses(
  skills: Record<string, SkillAnalysis>,
  levels: Record<string, LevelAnalysis>
) {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Analyze skills
  Object.entries(skills).forEach(([skill, data]) => {
    if (data.accuracy >= 75) {
      strengths.push(`${skill} (${Math.round(data.accuracy)}% accuracy)`);
    } else if (data.accuracy < 60) {
      weaknesses.push(skill);
    }
  });

  // Analyze level gaps
  let foundGap = false;
  for (const lvl of LEVEL_ORDER) {
    const data = levels[lvl];
    if (!data) continue;

    if (data.passed && !foundGap) {
      continue; // Still passing levels
    } else if (!data.passed) {
      foundGap = true;
      weaknesses.push(`${lvl} level competencies`);
    }
  }

  return { strengths, weaknesses };
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: RoadmapRequest = await req.json();
  const { answers, questions, targetLevel = "C2" } = body;

  if (!answers || !questions || answers.length !== questions.length) {
    return NextResponse.json(
      { error: "Invalid answers or questions" },
      { status: 400 }
    );
  }

  try {
    // Analyze results
    const { skills, levels, contextualComprehensionScore } = analyzeResults(
      answers,
      questions
    );

    // Determine overall level
    const currentLevel = determineOverallLevel(levels);

    // Calculate overall accuracy
    const totalCorrect = answers.filter(
      (a, i) => a === questions[i].correctIndex
    ).length;
    const overallAccuracy = Math.round((totalCorrect / questions.length) * 100);

    // Identify strengths and weaknesses
    const { strengths, weaknesses } = analyzeStrengthsAndWeaknesses(skills, levels);

    // Generate study plan
    const studyPlan = generateStudyPlan(
      currentLevel,
      targetLevel,
      weaknesses,
      skills
    );

    // Estimate time to proficiency
    const timeEstimate = estimateTimeToProficiency(
      currentLevel,
      targetLevel,
      overallAccuracy
    );

    // Prepare roadmap data
    const roadmapData = {
      user_id: user.id,
      current_cefr_level: currentLevel as any,
      target_cefr_level: targetLevel as any,
      overall_accuracy: overallAccuracy,
      skill_breakdown: skills as any,
      level_breakdown: levels as any,
      contextual_comprehension_score: Math.round(contextualComprehensionScore),
      strengths,
      weaknesses,
      priority_topics: weaknesses.length > 0 ? weaknesses : STUDY_TOPICS[currentLevel].slice(0, 5),
      study_plan: { phases: studyPlan },
      estimated_hours_to_proficiency: timeEstimate.estimated_hours,
      estimated_weeks: timeEstimate.estimated_weeks,
      recommended_study_hours_per_week: timeEstimate.recommended_hours_per_week,
      expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months
    };

    // Insert roadmap into database
    const { data: roadmap, error } = await supabase
      .from("learning_roadmaps")
      .insert(roadmapData)
      .select()
      .single();

    if (error) {
      console.error("Failed to save roadmap:", error);
      return NextResponse.json(
        { error: "Failed to generate roadmap" },
        { status: 500 }
      );
    }

    // Insert milestones
    const milestoneInserts = studyPlan.map((phase) => ({
      roadmap_id: roadmap.id,
      phase_name: phase.phase_name,
      phase_order: phase.phase_order,
      description: phase.description,
      topics: phase.topics,
      estimated_hours: phase.estimated_hours,
      status: phase.status,
    }));

    if (milestoneInserts.length > 0) {
      await supabase.from("roadmap_milestones").insert(milestoneInserts);
    }

    return NextResponse.json({
      success: true,
      roadmap: {
        id: roadmap.id,
        currentLevel,
        targetLevel,
        overallAccuracy,
        strengths,
        weaknesses,
        priorityTopics: roadmapData.priority_topics,
        studyPlan,
        estimatedHours: timeEstimate.estimated_hours,
        estimatedWeeks: timeEstimate.estimated_weeks,
        recommendedHoursPerWeek: timeEstimate.recommended_hours_per_week,
        skillBreakdown: skills,
        levelBreakdown: levels,
        contextualComprehensionScore: Math.round(contextualComprehensionScore),
      },
    });
  } catch (err: any) {
    console.error("Roadmap generation error:", err.message);
    return NextResponse.json(
      { error: "Erro ao gerar roadmap de aprendizado" },
      { status: 500 }
    );
  }
}
