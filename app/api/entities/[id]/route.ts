import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/entities/:id - Get a single entity config
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const entity = await prisma.entityConfig.findUnique({
      where: { id: params.id },
      include: {
        connection: true,
        views: true,
      },
    })

    if (!entity) {
      return NextResponse.json(
        { error: 'Entity not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(entity)
  } catch (error) {
    console.error('Failed to fetch entity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch entity' },
      { status: 500 }
    )
  }
}

// PATCH /api/entities/:id - Update entity config
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { displayName, fieldsJson, permissionsJson } = body

    const data: any = {}
    if (displayName) data.displayName = displayName
    if (fieldsJson) data.fieldsJson = JSON.stringify(fieldsJson)
    if (permissionsJson) data.permissionsJson = JSON.stringify(permissionsJson)

    const entity = await prisma.entityConfig.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json(entity)
  } catch (error) {
    console.error('Failed to update entity:', error)
    return NextResponse.json(
      { error: 'Failed to update entity' },
      { status: 500 }
    )
  }
}
