/**
 * Seed script — run once after migrations:
 *   npm run db:seed
 *
 * Creates:
 *   - Default admin user (change password immediately after!)
 *   - Company info placeholder
 *   - Sample services
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Admin user ─────────────────────────────────────────────────────────────
  const adminEmail    = 'peekayt1000@gmail.com'
  const adminPassword = 'ChangeMe@123!'   // CHANGE THIS IMMEDIATELY after first login

  const existing = await prisma.adminUser.findUnique({ where: { email: adminEmail } })
  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 12)
    await prisma.adminUser.create({
      data: { email: adminEmail, passwordHash, name: 'Site Admin' },
    })
    console.log(`✅ Admin created: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}  ← CHANGE THIS IMMEDIATELY`)
  } else {
    console.log(`ℹ️  Admin already exists: ${adminEmail}`)
  }

  // ─── Company Info ────────────────────────────────────────────────────────────
  const companyExists = await prisma.companyInfo.findFirst()
  if (!companyExists) {
    await prisma.companyInfo.create({
      data: {
        id: 1,
        name: 'IQINISO Construction',
        tagline: 'Building the Future, Delivering Excellence',
        aboutShort: 'A proudly South African construction company committed to quality and integrity.',
        aboutFull: 'IQINISO Construction is a proudly South African construction company with years of experience delivering residential, commercial, and civil construction projects across the country.',
        vision: 'To be the most trusted construction company in Southern Africa.',
        mission: 'To deliver world-class construction services with integrity, quality, and respect for our clients and communities.',
        physicalAddress: 'Newcastle, KwaZulu-Natal, South Africa',
        email: 'info@iqinisoconstruction.co.za',
        phone: '+27 81 002 7138',
      },
    })
    console.log('✅ Company info created')
  }

  // ─── Sample Services ─────────────────────────────────────────────────────────
    const sampleServices = [
        {
            title: 'Renovations & Refurbishments',
            slug: 'renovations',
            description: 'We handle full-scale renovations and refurbishments for residential and commercial properties. From structural changes to cosmetic upgrades, we transform your space from top to bottom.',
            shortDescription: 'Full-scale renovations for homes and businesses.',
            order: 1
        },
        {
            title: 'Floor Work & Tiling',
            slug: 'floor-work-tiling',
            description: 'Professional floor installation including ceramic tiles, porcelain, vinyl, and stone. We handle surface preparation, levelling, grouting, and finishing to deliver flawless floors every time.',
            shortDescription: 'Professional tiling and floor installation.',
            order: 2
        },
        {
            title: 'Ceiling Installation',
            slug: 'ceiling-installation',
            description: 'Expert ceiling installation and repairs including suspended ceilings, cornices, bulkheads, and drywall. We work on new builds and existing structures with clean, precise results.',
            shortDescription: 'Ceiling installation, repairs, and finishing.',
            order: 3
        },
        {
            title: 'Painting',
            slug: 'painting',
            description: 'Interior and exterior painting services using quality paints and materials. We handle surface preparation, priming, and finishing coats to ensure a long-lasting, professional result.',
            shortDescription: 'Interior and exterior painting services.',
            order: 4
        },
        {
            title: 'Kitchen Fitting',
            slug: 'kitchen-fitting',
            description: 'Custom kitchen fitting and carpentry services. We design and install kitchen units, cupboards, countertops, and built-in furniture crafted to fit your space and style perfectly.',
            shortDescription: 'Custom kitchen fitting and carpentry.',
            order: 5
        },
    ]

  for (const service of sampleServices) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: service,
    })
  }
  console.log('✅ Sample services created')

  console.log('\n✨ Seed complete!')
  console.log('\n⚠️  IMPORTANT: Log in and change the admin password immediately.')
  console.log(`   Admin URL: http://localhost:5173/admin`)
  console.log(`   Email:     ${adminEmail}`)
  console.log(`   Password:  ${adminPassword}\n`)
}

main()
  .catch((err) => { console.error('Seed failed:', err); process.exit(1) })
  .finally(() => prisma.$disconnect())
