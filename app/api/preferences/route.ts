import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyOTP } from '@/lib/otp'
import { sanitizeEmail, isValidEmail } from '@/lib/sanitize'

// GET - Kullanıcı tercihlerini getir (OTP ile doğrulanmış)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    let email = searchParams.get('email')
    const otpCode = searchParams.get('otp')

    if (!email) {
      return NextResponse.json(
        { error: 'E-posta adresi gerekli' },
        { status: 400 }
      )
    }

    // Sanitize email
    email = sanitizeEmail(email)

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi girin' },
        { status: 400 }
      )
    }

    // Verify OTP (don't delete on GET - user might want to update preferences)
    if (!otpCode) {
      return NextResponse.json(
        { error: 'Doğrulama kodu gerekli' },
        { status: 400 }
      )
    }

    const otpResult = await verifyOTP(email, otpCode, false) // Keep OTP for future updates
    if (!otpResult.valid) {
      return NextResponse.json(
        { error: otpResult.message },
        { status: 401 }
      )
    }

    const subscriber = await prisma.subscriber.findUnique({
      where: { email }
    })

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      email: subscriber.email,
      categories: subscriber.categories.split(','),
      notificationHour: subscriber.notificationHour,
      notificationFrequency: subscriber.notificationFrequency,
      isActive: subscriber.isActive,
      createdAt: subscriber.createdAt,
      lastSentAt: subscriber.lastSentAt
    })
  } catch (error) {
    console.error('❌ Tercihler getirme hatası:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}

// PATCH - Kullanıcı tercihlerini güncelle (OTP ile doğrulanmış)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    let { email, otp, categories, notificationHour, notificationFrequency, isActive } = body

    // Sanitize email
    email = sanitizeEmail(email)

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi girin' },
        { status: 400 }
      )
    }

    // Verify OTP (delete after successful update)
    if (!otp) {
      return NextResponse.json(
        { error: 'Doğrulama kodu gerekli' },
        { status: 400 }
      )
    }

    const otpResult = await verifyOTP(email, otp, true) // Delete OTP after verification
    if (!otpResult.valid) {
      return NextResponse.json(
        { error: otpResult.message },
        { status: 401 }
      )
    }

    console.log('📝 Gelen veri:', { email, categories, notificationHour, notificationFrequency, isActive })
    console.log('📝 Categories type:', typeof categories, Array.isArray(categories))

    if (!email) {
      return NextResponse.json(
        { error: 'E-posta adresi gerekli' },
        { status: 400 }
      )
    }

    // Categories array kontrolü ve düzeltmesi
    let categoriesArray: string[]
    if (typeof categories === 'string') {
      categoriesArray = [categories]
    } else if (Array.isArray(categories)) {
      categoriesArray = categories
    } else {
      return NextResponse.json(
        { error: 'Kategoriler geçersiz format' },
        { status: 400 }
      )
    }

    if (categoriesArray.length === 0) {
      return NextResponse.json(
        { error: 'En az bir kategori seçmelisiniz' },
        { status: 400 }
      )
    }

    if (notificationHour < 0 || notificationHour > 23) {
      return NextResponse.json(
        { error: 'Geçersiz bildirim saati' },
        { status: 400 }
      )
    }

    if (!['once', 'twice'].includes(notificationFrequency)) {
      return NextResponse.json(
        { error: 'Geçersiz bildirim sıklığı' },
        { status: 400 }
      )
    }

    // Kullanıcıyı kontrol et
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email }
    })

    if (!existingSubscriber) {
      return NextResponse.json(
        { error: 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Tercihleri güncelle
    const updatedSubscriber = await prisma.subscriber.update({
      where: { email },
      data: {
        categories: categoriesArray.join(','),
        notificationHour,
        notificationFrequency,
        isActive
      }
    })

    console.log('✅ Tercihler güncellendi:', {
      email,
      categories: categoriesArray,
      notificationHour,
      notificationFrequency,
      isActive
    })

    return NextResponse.json({
      message: 'Tercihleriniz başarıyla güncellendi',
      subscriber: {
        email: updatedSubscriber.email,
        categories: updatedSubscriber.categories.split(','),
        notificationHour: updatedSubscriber.notificationHour,
        notificationFrequency: updatedSubscriber.notificationFrequency,
        isActive: updatedSubscriber.isActive
      }
    })
  } catch (error) {
    console.error('❌ Tercih güncelleme hatası:', error)
    const errorMessage = error instanceof Error ? error.message : 'Bir hata oluştu'
    return NextResponse.json(
      { error: `Güncelleme başarısız: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// DELETE - Aboneliği iptal et (OTP ile doğrulanmış)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    let email = searchParams.get('email')
    const otpCode = searchParams.get('otp')

    // Sanitize email
    if (email) {
      email = sanitizeEmail(email)
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi girin' },
        { status: 400 }
      )
    }

    // Verify OTP (delete after successful unsubscribe)
    if (!otpCode) {
      return NextResponse.json(
        { error: 'Doğrulama kodu gerekli' },
        { status: 400 }
      )
    }

    const otpResult = await verifyOTP(email, otpCode, true) // Delete OTP after verification
    if (!otpResult.valid) {
      return NextResponse.json(
        { error: otpResult.message },
        { status: 401 }
      )
    }

    // Kullanıcıyı kontrol et
    const subscriber = await prisma.subscriber.findUnique({
      where: { email }
    })

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Soft delete - isActive'i false yap
    await prisma.subscriber.update({
      where: { email },
      data: { isActive: false }
    })

    console.log('✅ Abonelik iptal edildi:', email)

    return NextResponse.json({
      message: 'Aboneliğiniz başarıyla iptal edildi'
    })
  } catch (error) {
    console.error('❌ Abonelik iptali hatası:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}
