import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // 1. Create Universal Reusable Access Codes
  console.log('Creating universal reusable access codes...')
  const accessCodes = [
    'TENADAM1301SRS', // Main universal code
    'DEMO123',
    'TEST456',
    'EVAL789',
    'PILOT01'
  ]

  for (const code of accessCodes) {
    await prisma.accessCode.upsert({
      where: { code },
      update: {},
      create: {
        code,
        isReusable: true,
        maxUses: null, // Unlimited uses
        currentUses: 0,
        expiresAt: null, // No expiration
      },
    })
  }

  // 2. Create Categories and Subcategories (Baldrige Framework)
  console.log('Creating categories and subcategories...')

  const categories = [
    {
      name: 'Leadership',
      displayOrder: 1,
      description: 'How senior leaders guide and sustain the organization',
      subcategories: [
        { name: 'Senior Leadership', displayOrder: 1 },
        { name: 'Governance and Societal Responsibilities', displayOrder: 2 }
      ]
    },
    {
      name: 'Strategy',
      displayOrder: 2,
      description: 'How the organization develops strategic objectives and action plans',
      subcategories: [
        { name: 'Strategy Development', displayOrder: 1 },
        { name: 'Strategy Implementation', displayOrder: 2 }
      ]
    },
    {
      name: 'Customers',
      displayOrder: 3,
      description: 'How the organization engages customers and builds relationships',
      subcategories: [
        { name: 'Customer Expectations', displayOrder: 1 },
        { name: 'Customer Engagement', displayOrder: 2 }
      ]
    },
    {
      name: 'Measurement, Analysis, and Knowledge Management',
      displayOrder: 4,
      description: 'How the organization uses data and information for performance management',
      subcategories: [
        { name: 'Measurement and Analysis', displayOrder: 1 },
        { name: 'Information and Knowledge Management', displayOrder: 2 }
      ]
    },
    {
      name: 'Workforce',
      displayOrder: 5,
      description: 'How the organization engages, manages, and develops its workforce',
      subcategories: [
        { name: 'Workforce Environment', displayOrder: 1 },
        { name: 'Workforce Engagement', displayOrder: 2 }
      ]
    },
    {
      name: 'Operations',
      displayOrder: 6,
      description: 'How the organization designs, manages, and improves key processes',
      subcategories: [
        { name: 'Work Processes', displayOrder: 1 },
        { name: 'Operational Effectiveness', displayOrder: 2 }
      ]
    },
    {
      name: 'Results',
      displayOrder: 7,
      description: 'What the organization achieves in key performance areas',
      subcategories: [
        { name: 'Product and Process Results', displayOrder: 1 },
        { name: 'Customer Results', displayOrder: 2 },
        { name: 'Workforce Results', displayOrder: 3 },
        { name: 'Leadership and Governance Results', displayOrder: 4 },
        { name: 'Financial and Market Results', displayOrder: 5 }
      ]
    }
  ]

  for (const categoryData of categories) {
    const { subcategories, ...categoryInfo } = categoryData

    const category = await prisma.category.upsert({
      where: { name: categoryInfo.name },
      update: {},
      create: categoryInfo,
    })

    // Create subcategories
    for (const subcat of subcategories) {
      await prisma.subcategory.upsert({
        where: {
          categoryId_displayOrder: {
            categoryId: category.id,
            displayOrder: subcat.displayOrder
          }
        },
        update: {},
        create: {
          ...subcat,
          categoryId: category.id,
        },
      })
    }
  }

  // 3. Create sample questions for testing
  console.log('Creating sample questions...')

  const leadershipCategory = await prisma.category.findUnique({
    where: { name: 'Leadership' },
    include: { subcategories: true }
  })

  if (leadershipCategory) {
    const seniorLeadershipSubcat = leadershipCategory.subcategories.find(
      s => s.name === 'Senior Leadership'
    )

    if (seniorLeadershipSubcat) {
      const sampleQuestions = [
        {
          questionText: 'How do senior leaders set organizational vision and values?',
          orderIndex: 1,
          subcategoryId: seniorLeadershipSubcat.id,
          options: [
            'No systematic approach',
            'Some leaders communicate vision informally',
            'Vision and values are documented and communicated regularly',
            'Vision and values are integrated into all organizational processes',
            'Vision and values drive innovation and continuous improvement'
          ]
        },
        {
          questionText: 'How do senior leaders communicate with the workforce?',
          orderIndex: 2,
          subcategoryId: seniorLeadershipSubcat.id,
          options: [
            'Limited or no systematic communication',
            'Occasional communication through meetings or emails',
            'Regular communication channels established',
            'Two-way communication with feedback mechanisms',
            'Comprehensive communication strategy with multiple channels'
          ]
        }
      ]

      for (const questionData of sampleQuestions) {
        const { options, ...questionInfo } = questionData

        const question = await prisma.question.upsert({
          where: {
            subcategoryId_orderIndex: {
              subcategoryId: questionInfo.subcategoryId,
              orderIndex: questionInfo.orderIndex
            }
          },
          update: {},
          create: questionInfo,
        })

        // Create question options
        for (let i = 0; i < options.length; i++) {
          await prisma.questionOption.upsert({
            where: {
              questionId_orderIndex: {
                questionId: question.id,
                orderIndex: i
              }
            },
            update: {},
            create: {
              questionId: question.id,
              optionText: options[i],
              value: i.toString(),
              orderIndex: i,
              isCorrect: false // For assessment, there's no "correct" answer
            },
          })
        }
      }
    }
  }

  // 4. Create admin user
  console.log('Creating admin user...')
  await prisma.user.upsert({
    where: { email: 'admin@tenadam.com' },
    update: {},
    create: {
      fullName: 'System Administrator',
      email: 'admin@tenadam.com',
      organization: 'Tenadam Training, Consultancy and Research PLC',
      phoneNumber: '+1234567890',
      passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      isAdmin: true,
    },
  })

  console.log('Seed completed successfully!')
  console.log('Created:')
  console.log(`- ${accessCodes.length} access codes`)
  console.log(`- ${categories.length} categories`)
  console.log('- Sample questions for Leadership category')
  console.log('- Admin user (admin@tenadam.com / password)')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
