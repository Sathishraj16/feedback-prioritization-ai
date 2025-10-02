import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { swarmScores, feedback } from '@/db/schema';
import { eq, like, and, or, desc, asc, gte, lte } from 'drizzle-orm';

const VALID_AGENT_TYPES = ['urgency', 'impact', 'sentiment', 'novelty', 'effort'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const feedbackId = searchParams.get('feedbackId');
    const groupBy = searchParams.get('groupBy');

    // Single score by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const score = await db.select()
        .from(swarmScores)
        .where(eq(swarmScores.id, parseInt(id)))
        .limit(1);

      if (score.length === 0) {
        return NextResponse.json({ error: 'Swarm score not found' }, { status: 404 });
      }

      return NextResponse.json(score[0]);
    }

    // Scores grouped by agent type for specific feedback
    if (feedbackId && groupBy === 'true') {
      if (isNaN(parseInt(feedbackId))) {
        return NextResponse.json({ 
          error: "Valid feedback ID is required",
          code: "INVALID_FEEDBACK_ID" 
        }, { status: 400 });
      }

      const scores = await db.select()
        .from(swarmScores)
        .where(eq(swarmScores.feedbackId, parseInt(feedbackId)))
        .orderBy(desc(swarmScores.createdAt));

      const groupedScores = scores.reduce((acc: any, score) => {
        if (!acc[score.agentType]) {
          acc[score.agentType] = [];
        }
        acc[score.agentType].push(score);
        return acc;
      }, {});

      return NextResponse.json(groupedScores);
    }

    // List with pagination and filters
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const offset = parseInt(searchParams.get('offset') || '0');
    const agentType = searchParams.get('agentType');
    const minScore = searchParams.get('minScore');
    const maxScore = searchParams.get('maxScore');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(swarmScores);

    const conditions = [];

    if (feedbackId) {
      if (isNaN(parseInt(feedbackId))) {
        return NextResponse.json({ 
          error: "Valid feedback ID is required",
          code: "INVALID_FEEDBACK_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(swarmScores.feedbackId, parseInt(feedbackId)));
    }

    if (agentType) {
      if (!VALID_AGENT_TYPES.includes(agentType)) {
        return NextResponse.json({ 
          error: "Invalid agent type. Must be one of: " + VALID_AGENT_TYPES.join(', '),
          code: "INVALID_AGENT_TYPE" 
        }, { status: 400 });
      }
      conditions.push(eq(swarmScores.agentType, agentType));
    }

    if (minScore) {
      const minScoreNum = parseFloat(minScore);
      if (isNaN(minScoreNum) || minScoreNum < 0 || minScoreNum > 100) {
        return NextResponse.json({ 
          error: "Invalid minScore. Must be a number between 0-100",
          code: "INVALID_MIN_SCORE" 
        }, { status: 400 });
      }
      conditions.push(gte(swarmScores.score, minScoreNum));
    }

    if (maxScore) {
      const maxScoreNum = parseFloat(maxScore);
      if (isNaN(maxScoreNum) || maxScoreNum < 0 || maxScoreNum > 100) {
        return NextResponse.json({ 
          error: "Invalid maxScore. Must be a number between 0-100",
          code: "INVALID_MAX_SCORE" 
        }, { status: 400 });
      }
      conditions.push(lte(swarmScores.score, maxScoreNum));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    if (sort === 'score') {
      query = order === 'asc' 
        ? query.orderBy(asc(swarmScores.score))
        : query.orderBy(desc(swarmScores.score));
    } else {
      query = order === 'asc' 
        ? query.orderBy(asc(swarmScores.createdAt))
        : query.orderBy(desc(swarmScores.createdAt));
    }

    const results = await query.limit(limit).offset(offset);
    return NextResponse.json(results);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { feedbackId, agentType, score, reasoning } = requestBody;

    // Validate required fields
    if (!feedbackId) {
      return NextResponse.json({ 
        error: "Feedback ID is required",
        code: "MISSING_FEEDBACK_ID" 
      }, { status: 400 });
    }

    if (!agentType) {
      return NextResponse.json({ 
        error: "Agent type is required",
        code: "MISSING_AGENT_TYPE" 
      }, { status: 400 });
    }

    // Validate feedbackId is integer
    if (isNaN(parseInt(feedbackId))) {
      return NextResponse.json({ 
        error: "Feedback ID must be a valid integer",
        code: "INVALID_FEEDBACK_ID" 
      }, { status: 400 });
    }

    // Validate agentType
    if (!VALID_AGENT_TYPES.includes(agentType)) {
      return NextResponse.json({ 
        error: "Invalid agent type. Must be one of: " + VALID_AGENT_TYPES.join(', '),
        code: "INVALID_AGENT_TYPE" 
      }, { status: 400 });
    }

    // Validate score if provided
    if (score !== undefined && score !== null) {
      if (isNaN(parseFloat(score)) || score < 0 || score > 100) {
        return NextResponse.json({ 
          error: "Score must be a number between 0-100",
          code: "INVALID_SCORE_RANGE" 
        }, { status: 400 });
      }
    }

    // Validate reasoning length if provided
    if (reasoning && reasoning.length > 2000) {
      return NextResponse.json({ 
        error: "Reasoning must be 2000 characters or less",
        code: "REASONING_TOO_LONG" 
      }, { status: 400 });
    }

    // Validate feedbackId exists
    const existingFeedback = await db.select()
      .from(feedback)
      .where(eq(feedback.id, parseInt(feedbackId)))
      .limit(1);

    if (existingFeedback.length === 0) {
      return NextResponse.json({ 
        error: "Feedback with provided ID does not exist",
        code: "FEEDBACK_NOT_FOUND" 
      }, { status: 400 });
    }

    // Create new swarm score
    const insertData = {
      feedbackId: parseInt(feedbackId),
      agentType: agentType.trim(),
      score: score !== undefined && score !== null ? parseFloat(score) : null,
      reasoning: reasoning ? reasoning.trim() : null,
      createdAt: new Date().toISOString()
    };

    const newScore = await db.insert(swarmScores)
      .values(insertData)
      .returning();

    return NextResponse.json(newScore[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const { feedbackId, agentType, score, reasoning } = requestBody;

    // Check if record exists
    const existingScore = await db.select()
      .from(swarmScores)
      .where(eq(swarmScores.id, parseInt(id)))
      .limit(1);

    if (existingScore.length === 0) {
      return NextResponse.json({ error: 'Swarm score not found' }, { status: 404 });
    }

    const updates: any = {};

    // Validate and update feedbackId if provided
    if (feedbackId !== undefined) {
      if (isNaN(parseInt(feedbackId))) {
        return NextResponse.json({ 
          error: "Feedback ID must be a valid integer",
          code: "INVALID_FEEDBACK_ID" 
        }, { status: 400 });
      }

      // Validate feedbackId exists
      const existingFeedback = await db.select()
        .from(feedback)
        .where(eq(feedback.id, parseInt(feedbackId)))
        .limit(1);

      if (existingFeedback.length === 0) {
        return NextResponse.json({ 
          error: "Feedback with provided ID does not exist",
          code: "FEEDBACK_NOT_FOUND" 
        }, { status: 400 });
      }

      updates.feedbackId = parseInt(feedbackId);
    }

    // Validate and update agentType if provided
    if (agentType !== undefined) {
      if (!VALID_AGENT_TYPES.includes(agentType)) {
        return NextResponse.json({ 
          error: "Invalid agent type. Must be one of: " + VALID_AGENT_TYPES.join(', '),
          code: "INVALID_AGENT_TYPE" 
        }, { status: 400 });
      }
      updates.agentType = agentType.trim();
    }

    // Validate and update score if provided
    if (score !== undefined) {
      if (score !== null && (isNaN(parseFloat(score)) || score < 0 || score > 100)) {
        return NextResponse.json({ 
          error: "Score must be a number between 0-100 or null",
          code: "INVALID_SCORE_RANGE" 
        }, { status: 400 });
      }
      updates.score = score !== null ? parseFloat(score) : null;
    }

    // Validate and update reasoning if provided
    if (reasoning !== undefined) {
      if (reasoning && reasoning.length > 2000) {
        return NextResponse.json({ 
          error: "Reasoning must be 2000 characters or less",
          code: "REASONING_TOO_LONG" 
        }, { status: 400 });
      }
      updates.reasoning = reasoning ? reasoning.trim() : null;
    }

    // Update the record
    const updated = await db.update(swarmScores)
      .set(updates)
      .where(eq(swarmScores.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existingScore = await db.select()
      .from(swarmScores)
      .where(eq(swarmScores.id, parseInt(id)))
      .limit(1);

    if (existingScore.length === 0) {
      return NextResponse.json({ error: 'Swarm score not found' }, { status: 404 });
    }

    // Delete the record
    const deleted = await db.delete(swarmScores)
      .where(eq(swarmScores.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Swarm score deleted successfully',
      deletedScore: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}