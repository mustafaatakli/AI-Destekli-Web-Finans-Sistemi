import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET - Tüm kullanıcıları listele
export async function GET(req: NextRequest) {
  // Authentication check
  const authError = requireAuth(req)
  if (authError) return authError
  try {
    const { searchParams } = new URL(req.url)
    const activeOnly = searchParams.get('active') === 'true'
    const email = searchParams.get('email')

    // Tek kullanıcı sorgula
    if (email) {
      const subscriber = await prisma.subscriber.findUnique({
        where: { email }
      })

      if (!subscriber) {
        return NextResponse.json(
          { error: 'Kullanıcı bulunamadı' },
          { status: 404 }
        )
      }

      return NextResponse.json({ subscriber })
    }

    // Tüm kullanıcıları listele
    const subscribers = await prisma.subscriber.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: [
        { notificationHour: 'asc' },
        { email: 'asc' }
      ]
    })

    return NextResponse.json({
      subscribers,
      count: subscribers.length,
      active: subscribers.filter(s => s.isActive).length,
      inactive: subscribers.filter(s => !s.isActive).length
    })
  } catch (error: any) {
    console.error('Get subscribers error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

// PATCH - Kullanıcı bilgilerini güncelle
export async function PATCH(req: NextRequest) {
  // Authentication check
  const authError = requireAuth(req)
  if (authError) return authError
  
  try {
    const body = await req.json()
    const { email, ...updates } = body

    if (!email) {
      return NextResponse.json(
        { error: 'E-posta adresi gerekli' },
        { status: 400 }
      )
    }

    // Geçerli alanları filtrele
    const validUpdates: any = {}

    if (updates.categories !== undefined) {
      if (Array.isArray(updates.categories)) {
        validUpdates.categories = updates.categories.join(',')
      } else {
        validUpdates.categories = updates.categories
      }
    }

    if (updates.notificationHour !== undefined) {
      const hour = parseInt(updates.notificationHour)
      if (hour < 0 || hour > 23) {
        return NextResponse.json(
          { error: 'Geçersiz saat (0-23 arası olmalı)' },
          { status: 400 }
        )
      }
      validUpdates.notificationHour = hour
    }

    if (updates.notificationFrequency !== undefined) {
      if (!['daily', 'twice', 'three_times'].includes(updates.notificationFrequency)) {
        return NextResponse.json(
          { error: 'Geçersiz sıklık (daily, twice, three_times)' },
          { status: 400 }
        )
      }
      validUpdates.notificationFrequency = updates.notificationFrequency
    }

    if (updates.isActive !== undefined) {
      validUpdates.isActive = Boolean(updates.isActive)
    }

    if (updates.lastSentAt !== undefined) {
      validUpdates.lastSentAt = updates.lastSentAt ? new Date(updates.lastSentAt) : null
    }

    validUpdates.updatedAt = new Date()

    // Kullanıcıyı güncelle
    const subscriber = await prisma.subscriber.update({
      where: { email },
      data: validUpdates
    })

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı güncellendi',
      subscriber
    })
  } catch (error: any) {
    console.error('Update subscriber error:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

// DELETE - Kullanıcıyı tamamen sil
export async function DELETE(req: NextRequest) {
  // Authentication check
  const authError = requireAuth(req)
  if (authError) return authError
  
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    const permanent = searchParams.get('permanent') === 'true'

    if (!email) {
      return NextResponse.json(
        { error: 'E-posta adresi gerekli' },
        { status: 400 }
      )
    }

    if (permanent) {
      // Kalıcı olarak sil
      await prisma.subscriber.delete({
        where: { email }
      })

      return NextResponse.json({
        success: true,
        message: 'Kullanıcı kalıcı olarak silindi'
      })
    } else {
      // Sadece deaktif et
      const subscriber = await prisma.subscriber.update({
        where: { email },
        data: { 
          isActive: false,
          updatedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Kullanıcı deaktif edildi',
        subscriber
      })
    }
  } catch (error: any) {
    console.error('Delete subscriber error:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}
