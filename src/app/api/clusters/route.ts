import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { clusters, feedback } from '@/db/schema';
import { eq, like, and, or, desc, asc, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Single cluster fetch
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const cluster = await db.select()
        .from(clusters)
        .where(eq(clusters.id, parseInt(id)))
        .limit(1);

      if (cluster.length === 0) {
        return NextResponse.json({ 
          error: 'Cluster not found',
          code: "CLUSTER_NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(cluster[0]);
    } else {
      // List clusters with pagination, search, and sorting
      const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
      const offset = parseInt(searchParams.get('offset') || '0');
      const search = searchParams.get('search');
      const sort = searchParams.get('sort') || 'name';
      const order = searchParams.get('order') || 'asc';

      let query = db.select().from(clusters);

      if (search) {
        const searchCondition = or(
          like(clusters.name, `%${search}%`),
          like(clusters.description, `%${search}%`)
        );
        query = query.where(searchCondition);
      }

      // Apply sorting
      if (sort === 'name') {
        query = order === 'desc' ? query.orderBy(desc(clusters.name)) : query.orderBy(asc(clusters.name));
      } else if (sort === 'size') {
        query = order === 'desc' ? query.orderBy(desc(clusters.size)) : query.orderBy(asc(clusters.size));
      } else if (sort === 'createdAt') {
        query = order === 'desc' ? query.orderBy(desc(clusters.createdAt)) : query.orderBy(asc(clusters.createdAt));
      }

      const results = await query.limit(limit).offset(offset);
      return NextResponse.json(results);
    }
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
    const { name, description, size, xPosition, yPosition, color } = requestBody;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate name length
    if (name.length > 200) {
      return NextResponse.json({ 
        error: "Name must be 200 characters or less",
        code: "NAME_TOO_LONG" 
      }, { status: 400 });
    }

    // Validate description length
    if (description && description.length > 1000) {
      return NextResponse.json({ 
        error: "Description must be 1000 characters or less",
        code: "DESCRIPTION_TOO_LONG" 
      }, { status: 400 });
    }

    // Validate size
    if (size !== undefined && (isNaN(parseInt(size)) || parseInt(size) < 0)) {
      return NextResponse.json({ 
        error: "Size must be a non-negative integer",
        code: "INVALID_SIZE" 
      }, { status: 400 });
    }

    // Validate positions
    if (xPosition !== undefined && (isNaN(parseFloat(xPosition)) || parseFloat(xPosition) < 0 || parseFloat(xPosition) > 100)) {
      return NextResponse.json({ 
        error: "X position must be a number between 0 and 100",
        code: "INVALID_X_POSITION" 
      }, { status: 400 });
    }

    if (yPosition !== undefined && (isNaN(parseFloat(yPosition)) || parseFloat(yPosition) < 0 || parseFloat(yPosition) > 100)) {
      return NextResponse.json({ 
        error: "Y position must be a number between 0 and 100",
        code: "INVALID_Y_POSITION" 
      }, { status: 400 });
    }

    // Validate color format
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return NextResponse.json({ 
        error: "Color must be in hex format (#RRGGBB)",
        code: "INVALID_COLOR_FORMAT" 
      }, { status: 400 });
    }

    // Check for unique name
    const existingCluster = await db.select()
      .from(clusters)
      .where(eq(clusters.name, name.trim()))
      .limit(1);

    if (existingCluster.length > 0) {
      return NextResponse.json({ 
        error: "Cluster name must be unique",
        code: "NAME_NOT_UNIQUE" 
      }, { status: 400 });
    }

    // Prepare data for insertion
    const insertData = {
      name: name.trim(),
      description: description ? description.trim() : null,
      size: size !== undefined ? parseInt(size) : 0,
      xPosition: xPosition !== undefined ? parseFloat(xPosition) : null,
      yPosition: yPosition !== undefined ? parseFloat(yPosition) : null,
      color: color || null,
      createdAt: new Date().toISOString()
    };

    const newCluster = await db.insert(clusters)
      .values(insertData)
      .returning();

    return NextResponse.json(newCluster[0], { status: 201 });
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
    const { name, description, size, xPosition, yPosition, color } = requestBody;

    // Check if cluster exists
    const existingCluster = await db.select()
      .from(clusters)
      .where(eq(clusters.id, parseInt(id)))
      .limit(1);

    if (existingCluster.length === 0) {
      return NextResponse.json({ 
        error: 'Cluster not found',
        code: "CLUSTER_NOT_FOUND" 
      }, { status: 404 });
    }

    // Validate name if provided
    if (name !== undefined) {
      if (!name) {
        return NextResponse.json({ 
          error: "Name cannot be empty",
          code: "EMPTY_NAME" 
        }, { status: 400 });
      }

      if (name.length > 200) {
        return NextResponse.json({ 
          error: "Name must be 200 characters or less",
          code: "NAME_TOO_LONG" 
        }, { status: 400 });
      }

      // Check for unique name (excluding current cluster)
      const duplicateCluster = await db.select()
        .from(clusters)
        .where(and(
          eq(clusters.name, name.trim()),
          eq(clusters.id, parseInt(id))
        ))
        .limit(1);

      if (duplicateCluster.length === 0) {
        const existingNameCluster = await db.select()
          .from(clusters)
          .where(eq(clusters.name, name.trim()))
          .limit(1);

        if (existingNameCluster.length > 0) {
          return NextResponse.json({ 
            error: "Cluster name must be unique",
            code: "NAME_NOT_UNIQUE" 
          }, { status: 400 });
        }
      }
    }

    // Validate description length
    if (description !== undefined && description && description.length > 1000) {
      return NextResponse.json({ 
        error: "Description must be 1000 characters or less",
        code: "DESCRIPTION_TOO_LONG" 
      }, { status: 400 });
    }

    // Validate size
    if (size !== undefined && (isNaN(parseInt(size)) || parseInt(size) < 0)) {
      return NextResponse.json({ 
        error: "Size must be a non-negative integer",
        code: "INVALID_SIZE" 
      }, { status: 400 });
    }

    // Validate positions
    if (xPosition !== undefined && (isNaN(parseFloat(xPosition)) || parseFloat(xPosition) < 0 || parseFloat(xPosition) > 100)) {
      return NextResponse.json({ 
        error: "X position must be a number between 0 and 100",
        code: "INVALID_X_POSITION" 
      }, { status: 400 });
    }

    if (yPosition !== undefined && (isNaN(parseFloat(yPosition)) || parseFloat(yPosition) < 0 || parseFloat(yPosition) > 100)) {
      return NextResponse.json({ 
        error: "Y position must be a number between 0 and 100",
        code: "INVALID_Y_POSITION" 
      }, { status: 400 });
    }

    // Validate color format
    if (color !== undefined && color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return NextResponse.json({ 
        error: "Color must be in hex format (#RRGGBB)",
        code: "INVALID_COLOR_FORMAT" 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (size !== undefined) updateData.size = parseInt(size);
    if (xPosition !== undefined) updateData.xPosition = parseFloat(xPosition);
    if (yPosition !== undefined) updateData.yPosition = parseFloat(yPosition);
    if (color !== undefined) updateData.color = color || null;

    const updated = await db.update(clusters)
      .set(updateData)
      .where(eq(clusters.id, parseInt(id)))
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

    // Check if cluster exists
    const existingCluster = await db.select()
      .from(clusters)
      .where(eq(clusters.id, parseInt(id)))
      .limit(1);

    if (existingCluster.length === 0) {
      return NextResponse.json({ 
        error: 'Cluster not found',
        code: "CLUSTER_NOT_FOUND" 
      }, { status: 404 });
    }

    // Check if cluster is referenced by feedback items
    const referencedFeedback = await db.select({ count: count() })
      .from(feedback)
      .where(eq(feedback.clusterId, parseInt(id)));

    if (referencedFeedback[0].count > 0) {
      return NextResponse.json({ 
        error: `Cannot delete cluster. It is referenced by ${referencedFeedback[0].count} feedback item(s)`,
        code: "CLUSTER_REFERENCED",
        referencedCount: referencedFeedback[0].count
      }, { status: 400 });
    }

    const deleted = await db.delete(clusters)
      .where(eq(clusters.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Cluster deleted successfully',
      deletedCluster: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}