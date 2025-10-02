import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { topPriorities, feedback } from '@/db/schema';
import { eq, like, and, or, desc, asc, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const top = searchParams.get('top');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const priority = await db.select()
        .from(topPriorities)
        .where(eq(topPriorities.id, parseInt(id)))
        .limit(1);

      if (priority.length === 0) {
        return NextResponse.json({ 
          error: 'Top priority not found',
          code: "PRIORITY_NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(priority[0]);
    }

    // Top rankings endpoint
    if (top) {
      const topLimit = Math.min(parseInt(top) || 10, 100);
      
      const rankings = await db.select({
        id: topPriorities.id,
        feedbackId: topPriorities.feedbackId,
        rank: topPriorities.rank,
        consensusScore: topPriorities.consensusScore,
        createdAt: topPriorities.createdAt,
        updatedAt: topPriorities.updatedAt,
        feedbackTitle: feedback.title,
        feedbackDescription: feedback.description,
        feedbackSource: feedback.source,
        feedbackCustomerEmail: feedback.customerEmail,
        feedbackCustomerName: feedback.customerName
      })
      .from(topPriorities)
      .innerJoin(feedback, eq(topPriorities.feedbackId, feedback.id))
      .orderBy(asc(topPriorities.rank))
      .limit(topLimit);

      return NextResponse.json(rankings);
    }

    // List with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const offset = parseInt(searchParams.get('offset') || '0');
    const feedbackId = searchParams.get('feedbackId');
    const minRank = searchParams.get('minRank');
    const maxRank = searchParams.get('maxRank');
    const minScore = searchParams.get('minScore');
    const maxScore = searchParams.get('maxScore');
    const sort = searchParams.get('sort') || 'rank';
    const order = searchParams.get('order') || 'asc';

    let query = db.select().from(topPriorities);
    const conditions = [];

    // Apply filters
    if (feedbackId) {
      const feedbackIdInt = parseInt(feedbackId);
      if (!isNaN(feedbackIdInt)) {
        conditions.push(eq(topPriorities.feedbackId, feedbackIdInt));
      }
    }

    if (minRank) {
      const minRankInt = parseInt(minRank);
      if (!isNaN(minRankInt)) {
        conditions.push(gte(topPriorities.rank, minRankInt));
      }
    }

    if (maxRank) {
      const maxRankInt = parseInt(maxRank);
      if (!isNaN(maxRankInt)) {
        conditions.push(lte(topPriorities.rank, maxRankInt));
      }
    }

    if (minScore) {
      const minScoreFloat = parseFloat(minScore);
      if (!isNaN(minScoreFloat)) {
        conditions.push(gte(topPriorities.consensusScore, minScoreFloat));
      }
    }

    if (maxScore) {
      const maxScoreFloat = parseFloat(maxScore);
      if (!isNaN(maxScoreFloat)) {
        conditions.push(lte(topPriorities.consensusScore, maxScoreFloat));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortField = sort === 'consensusScore' ? topPriorities.consensusScore 
                    : sort === 'createdAt' ? topPriorities.createdAt 
                    : topPriorities.rank;
    
    const orderDirection = order === 'desc' ? desc(sortField) : asc(sortField);
    query = query.orderBy(orderDirection);

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
    const { feedbackId, rank, consensusScore } = requestBody;

    // Validate required fields
    if (!feedbackId) {
      return NextResponse.json({ 
        error: "feedbackId is required",
        code: "MISSING_FEEDBACK_ID" 
      }, { status: 400 });
    }

    if (!rank) {
      return NextResponse.json({ 
        error: "rank is required",
        code: "MISSING_RANK" 
      }, { status: 400 });
    }

    if (consensusScore === undefined || consensusScore === null) {
      return NextResponse.json({ 
        error: "consensusScore is required",
        code: "MISSING_CONSENSUS_SCORE" 
      }, { status: 400 });
    }

    // Validate feedbackId is integer
    const feedbackIdInt = parseInt(feedbackId);
    if (isNaN(feedbackIdInt)) {
      return NextResponse.json({ 
        error: "feedbackId must be a valid integer",
        code: "INVALID_FEEDBACK_ID" 
      }, { status: 400 });
    }

    // Validate rank is positive integer
    const rankInt = parseInt(rank);
    if (isNaN(rankInt) || rankInt < 1) {
      return NextResponse.json({ 
        error: "rank must be a positive integer (≥1)",
        code: "INVALID_RANK" 
      }, { status: 400 });
    }

    // Validate consensusScore is between 0-100
    const consensusScoreFloat = parseFloat(consensusScore);
    if (isNaN(consensusScoreFloat) || consensusScoreFloat < 0 || consensusScoreFloat > 100) {
      return NextResponse.json({ 
        error: "consensusScore must be a number between 0-100 (inclusive)",
        code: "INVALID_CONSENSUS_SCORE" 
      }, { status: 400 });
    }

    // Validate feedbackId exists in feedback table
    const existingFeedback = await db.select()
      .from(feedback)
      .where(eq(feedback.id, feedbackIdInt))
      .limit(1);

    if (existingFeedback.length === 0) {
      return NextResponse.json({ 
        error: "feedbackId does not exist in feedback table",
        code: "FEEDBACK_NOT_FOUND" 
      }, { status: 404 });
    }

    const newPriority = await db.insert(topPriorities)
      .values({
        feedbackId: feedbackIdInt,
        rank: rankInt,
        consensusScore: consensusScoreFloat,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newPriority[0], { status: 201 });

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
    const { feedbackId, rank, consensusScore } = requestBody;

    // Check if record exists
    const existing = await db.select()
      .from(topPriorities)
      .where(eq(topPriorities.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Top priority not found',
        code: "PRIORITY_NOT_FOUND" 
      }, { status: 404 });
    }

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    // Validate and update feedbackId if provided
    if (feedbackId !== undefined) {
      const feedbackIdInt = parseInt(feedbackId);
      if (isNaN(feedbackIdInt)) {
        return NextResponse.json({ 
          error: "feedbackId must be a valid integer",
          code: "INVALID_FEEDBACK_ID" 
        }, { status: 400 });
      }

      // Validate feedbackId exists in feedback table
      const existingFeedback = await db.select()
        .from(feedback)
        .where(eq(feedback.id, feedbackIdInt))
        .limit(1);

      if (existingFeedback.length === 0) {
        return NextResponse.json({ 
          error: "feedbackId does not exist in feedback table",
          code: "FEEDBACK_NOT_FOUND" 
        }, { status: 404 });
      }

      updates.feedbackId = feedbackIdInt;
    }

    // Validate and update rank if provided
    if (rank !== undefined) {
      const rankInt = parseInt(rank);
      if (isNaN(rankInt) || rankInt < 1) {
        return NextResponse.json({ 
          error: "rank must be a positive integer (≥1)",
          code: "INVALID_RANK" 
        }, { status: 400 });
      }
      updates.rank = rankInt;
    }

    // Validate and update consensusScore if provided
    if (consensusScore !== undefined) {
      const consensusScoreFloat = parseFloat(consensusScore);
      if (isNaN(consensusScoreFloat) || consensusScoreFloat < 0 || consensusScoreFloat > 100) {
        return NextResponse.json({ 
          error: "consensusScore must be a number between 0-100 (inclusive)",
          code: "INVALID_CONSENSUS_SCORE" 
        }, { status: 400 });
      }
      updates.consensusScore = consensusScoreFloat;
    }

    const updated = await db.update(topPriorities)
      .set(updates)
      .where(eq(topPriorities.id, parseInt(id)))
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
    const existing = await db.select()
      .from(topPriorities)
      .where(eq(topPriorities.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Top priority not found',
        code: "PRIORITY_NOT_FOUND" 
      }, { status: 404 });
    }

    const deleted = await db.delete(topPriorities)
      .where(eq(topPriorities.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Top priority deleted successfully',
      deletedRecord: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}