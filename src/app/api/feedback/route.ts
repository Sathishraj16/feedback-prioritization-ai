import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { feedback } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single feedback fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const feedbackRecord = await db.select()
        .from(feedback)
        .where(eq(feedback.id, parseInt(id)))
        .limit(1);

      if (feedbackRecord.length === 0) {
        return NextResponse.json({ 
          error: 'Feedback not found',
          code: 'FEEDBACK_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(feedbackRecord[0]);
    }

    // List feedback with pagination and filters
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const source = searchParams.get('source');
    const clusterId = searchParams.get('clusterId');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(feedback);
    
    const conditions = [];

    // Search functionality
    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          like(feedback.title, searchTerm),
          like(feedback.description, searchTerm),
          like(feedback.customerName, searchTerm),
          like(feedback.customerEmail, searchTerm)
        )
      );
    }

    // Filter by source
    if (source) {
      conditions.push(eq(feedback.source, source));
    }

    // Filter by clusterId
    if (clusterId && !isNaN(parseInt(clusterId))) {
      conditions.push(eq(feedback.clusterId, parseInt(clusterId)));
    }

    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const orderDirection = order.toLowerCase() === 'asc' ? asc : desc;
    switch (sort) {
      case 'title':
        query = query.orderBy(orderDirection(feedback.title));
        break;
      case 'source':
        query = query.orderBy(orderDirection(feedback.source));
        break;
      case 'createdAt':
      default:
        query = query.orderBy(orderDirection(feedback.createdAt));
        break;
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
    const { title, description, source, customerEmail, customerName, clusterId } = requestBody;

    // Validate required fields
    if (!title) {
      return NextResponse.json({ 
        error: "Title is required",
        code: "MISSING_TITLE" 
      }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json({ 
        error: "Description is required",
        code: "MISSING_DESCRIPTION" 
      }, { status: 400 });
    }

    if (!source) {
      return NextResponse.json({ 
        error: "Source is required",
        code: "MISSING_SOURCE" 
      }, { status: 400 });
    }

    // Validate field lengths
    if (title.length > 500) {
      return NextResponse.json({ 
        error: "Title must not exceed 500 characters",
        code: "TITLE_TOO_LONG" 
      }, { status: 400 });
    }

    if (description.length > 5000) {
      return NextResponse.json({ 
        error: "Description must not exceed 5000 characters",
        code: "DESCRIPTION_TOO_LONG" 
      }, { status: 400 });
    }

    // Validate source value
    const validSources = ['form', 'csv', 'api'];
    if (!validSources.includes(source)) {
      return NextResponse.json({ 
        error: "Source must be one of: form, csv, api",
        code: "INVALID_SOURCE" 
      }, { status: 400 });
    }

    // Validate email format if provided
    if (customerEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail)) {
        return NextResponse.json({ 
          error: "Invalid email format",
          code: "INVALID_EMAIL" 
        }, { status: 400 });
      }
    }

    // Validate customer name length
    if (customerName && customerName.length > 200) {
      return NextResponse.json({ 
        error: "Customer name must not exceed 200 characters",
        code: "CUSTOMER_NAME_TOO_LONG" 
      }, { status: 400 });
    }

    // Validate clusterId if provided
    if (clusterId && isNaN(parseInt(clusterId))) {
      return NextResponse.json({ 
        error: "Cluster ID must be a valid integer",
        code: "INVALID_CLUSTER_ID" 
      }, { status: 400 });
    }

    // Prepare insert data
    const insertData = {
      title: title.trim(),
      description: description.trim(),
      source,
      customerEmail: customerEmail ? customerEmail.toLowerCase().trim() : null,
      customerName: customerName ? customerName.trim() : null,
      clusterId: clusterId ? parseInt(clusterId) : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newFeedback = await db.insert(feedback)
      .values(insertData)
      .returning();

    return NextResponse.json(newFeedback[0], { status: 201 });

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
    const { title, description, source, customerEmail, customerName, clusterId } = requestBody;

    // Check if feedback exists
    const existingFeedback = await db.select()
      .from(feedback)
      .where(eq(feedback.id, parseInt(id)))
      .limit(1);

    if (existingFeedback.length === 0) {
      return NextResponse.json({ 
        error: 'Feedback not found',
        code: 'FEEDBACK_NOT_FOUND' 
      }, { status: 404 });
    }

    // Validate fields if provided
    if (title && title.length > 500) {
      return NextResponse.json({ 
        error: "Title must not exceed 500 characters",
        code: "TITLE_TOO_LONG" 
      }, { status: 400 });
    }

    if (description && description.length > 5000) {
      return NextResponse.json({ 
        error: "Description must not exceed 5000 characters",
        code: "DESCRIPTION_TOO_LONG" 
      }, { status: 400 });
    }

    if (source) {
      const validSources = ['form', 'csv', 'api'];
      if (!validSources.includes(source)) {
        return NextResponse.json({ 
          error: "Source must be one of: form, csv, api",
          code: "INVALID_SOURCE" 
        }, { status: 400 });
      }
    }

    if (customerEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail)) {
        return NextResponse.json({ 
          error: "Invalid email format",
          code: "INVALID_EMAIL" 
        }, { status: 400 });
      }
    }

    if (customerName && customerName.length > 200) {
      return NextResponse.json({ 
        error: "Customer name must not exceed 200 characters",
        code: "CUSTOMER_NAME_TOO_LONG" 
      }, { status: 400 });
    }

    if (clusterId && isNaN(parseInt(clusterId))) {
      return NextResponse.json({ 
        error: "Cluster ID must be a valid integer",
        code: "INVALID_CLUSTER_ID" 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (source !== undefined) updateData.source = source;
    if (customerEmail !== undefined) updateData.customerEmail = customerEmail ? customerEmail.toLowerCase().trim() : null;
    if (customerName !== undefined) updateData.customerName = customerName ? customerName.trim() : null;
    if (clusterId !== undefined) updateData.clusterId = clusterId ? parseInt(clusterId) : null;

    const updatedFeedback = await db.update(feedback)
      .set(updateData)
      .where(eq(feedback.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedFeedback[0]);

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

    // Check if feedback exists
    const existingFeedback = await db.select()
      .from(feedback)
      .where(eq(feedback.id, parseInt(id)))
      .limit(1);

    if (existingFeedback.length === 0) {
      return NextResponse.json({ 
        error: 'Feedback not found',
        code: 'FEEDBACK_NOT_FOUND' 
      }, { status: 404 });
    }

    const deletedFeedback = await db.delete(feedback)
      .where(eq(feedback.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Feedback deleted successfully',
      deletedFeedback: deletedFeedback[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}