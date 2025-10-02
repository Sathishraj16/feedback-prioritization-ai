import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { feedback, swarmScores, topPriorities } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// Simulated AI agent scoring logic
const agentScoring = {
  urgency: (feedback: any) => {
    const keywords = ['critical', 'urgent', 'immediate', 'asap', 'now', 'crash', 'broken', 'down', 'blocking'];
    const text = (feedback.title + ' ' + feedback.description).toLowerCase();
    const matches = keywords.filter(kw => text.includes(kw)).length;
    return Math.min(100, 40 + (matches * 15) + Math.random() * 30);
  },
  
  impact: (feedback: any) => {
    const keywords = ['all users', 'everyone', 'entire', 'widespread', 'major', 'critical', 'important'];
    const text = (feedback.title + ' ' + feedback.description).toLowerCase();
    const matches = keywords.filter(kw => text.includes(kw)).length;
    return Math.min(100, 35 + (matches * 20) + Math.random() * 35);
  },
  
  sentiment: (feedback: any) => {
    const negative = ['frustrated', 'angry', 'hate', 'terrible', 'awful', 'horrible', 'unusable'];
    const positive = ['love', 'great', 'excellent', 'awesome', 'amazing'];
    const text = (feedback.title + ' ' + feedback.description).toLowerCase();
    const negMatches = negative.filter(kw => text.includes(kw)).length;
    const posMatches = positive.filter(kw => text.includes(kw)).length;
    return Math.min(100, 30 + (negMatches * 25) - (posMatches * 10) + Math.random() * 30);
  },
  
  novelty: (feedback: any) => {
    const keywords = ['new', 'innovative', 'unique', 'different', 'novel', 'creative', 'never'];
    const text = (feedback.title + ' ' + feedback.description).toLowerCase();
    const matches = keywords.filter(kw => text.includes(kw)).length;
    return Math.min(100, 20 + (matches * 15) + Math.random() * 50);
  },
  
  effort: (feedback: any) => {
    // Effort is inverse - lower score means less effort needed
    const simple = ['simple', 'easy', 'quick', 'small', 'minor'];
    const complex = ['complex', 'difficult', 'major', 'redesign', 'rebuild'];
    const text = (feedback.title + ' ' + feedback.description).toLowerCase();
    const simpleMatches = simple.filter(kw => text.includes(kw)).length;
    const complexMatches = complex.filter(kw => text.includes(kw)).length;
    return Math.min(100, 50 + (complexMatches * 20) - (simpleMatches * 15) + Math.random() * 30);
  },
};

export async function POST(request: NextRequest) {
  try {
    const { feedbackId } = await request.json();

    if (!feedbackId) {
      return NextResponse.json({ 
        error: "feedbackId is required",
        code: "MISSING_FEEDBACK_ID" 
      }, { status: 400 });
    }

    // Fetch the feedback item
    const feedbackItem = await db.select()
      .from(feedback)
      .where(eq(feedback.id, parseInt(feedbackId)))
      .limit(1);

    if (feedbackItem.length === 0) {
      return NextResponse.json({ 
        error: 'Feedback not found',
        code: 'FEEDBACK_NOT_FOUND' 
      }, { status: 404 });
    }

    const item = feedbackItem[0];
    const scores: any = {};
    const agentTypes = ['urgency', 'impact', 'sentiment', 'novelty', 'effort'];

    // Run each agent and save scores
    for (const agentType of agentTypes) {
      const score = agentScoring[agentType as keyof typeof agentScoring](item);
      const reasoning = generateReasoning(agentType, score, item);

      // Save to database
      await db.insert(swarmScores).values({
        feedbackId: parseInt(feedbackId),
        agentType,
        score: parseFloat(score.toFixed(1)),
        reasoning,
        createdAt: new Date().toISOString(),
      });

      scores[agentType] = {
        score: parseFloat(score.toFixed(1)),
        reasoning,
      };
    }

    // Calculate consensus score
    const consensusScore = Object.values(scores).reduce((sum: number, s: any) => sum + s.score, 0) / agentTypes.length;

    // Check if already in top priorities
    const existingPriority = await db.select()
      .from(topPriorities)
      .where(eq(topPriorities.feedbackId, parseInt(feedbackId)))
      .limit(1);

    if (existingPriority.length === 0) {
      // Get current max rank
      const maxRankResult = await db.select()
        .from(topPriorities)
        .orderBy(desc(topPriorities.rank))
        .limit(1);

      const newRank = maxRankResult.length > 0 ? maxRankResult[0].rank + 1 : 1;

      // Add to top priorities
      await db.insert(topPriorities).values({
        feedbackId: parseInt(feedbackId),
        rank: newRank,
        consensusScore: parseFloat(consensusScore.toFixed(1)),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      feedbackId: parseInt(feedbackId),
      scores,
      consensusScore: parseFloat(consensusScore.toFixed(1)),
      message: 'Swarm analysis completed successfully',
    });

  } catch (error) {
    console.error('Swarm analysis error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

function generateReasoning(agentType: string, score: number, feedback: any): string {
  const reasoningTemplates: Record<string, any> = {
    urgency: {
      high: `This feedback indicates a time-sensitive issue that requires immediate attention. Keywords suggest blocking or critical nature.`,
      medium: `Moderate urgency detected. This issue should be addressed in the near term but is not immediately blocking.`,
      low: `This feedback does not indicate urgent time constraints. Can be scheduled based on other priority factors.`,
    },
    impact: {
      high: `Analysis suggests this affects a large user base or critical functionality. High business impact expected.`,
      medium: `This issue appears to affect a moderate subset of users or non-critical features.`,
      low: `Limited impact detected. Issue affects small user segment or edge cases.`,
    },
    sentiment: {
      high: `Strong negative sentiment detected. Customer frustration or dissatisfaction is evident in the feedback.`,
      medium: `Moderate concern expressed by customer. Some dissatisfaction but not severe.`,
      low: `Neutral or positive tone. Customer is providing constructive feedback without strong negative emotion.`,
    },
    novelty: {
      high: `This represents a unique or innovative request that could provide competitive differentiation.`,
      medium: `Some novel aspects but similar to existing features or common requests.`,
      low: `Standard request that follows common patterns. Low innovation potential.`,
    },
    effort: {
      high: `Implementation appears complex and would require significant development resources and time.`,
      medium: `Moderate effort required. Standard development complexity with some technical challenges.`,
      low: `Relatively simple implementation. Can likely be addressed quickly with existing infrastructure.`,
    },
  };

  const level = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
  return reasoningTemplates[agentType]?.[level] || `${agentType} score: ${score.toFixed(1)}`;
}