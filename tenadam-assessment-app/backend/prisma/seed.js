"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting database seed...');
    // 1. Create Universal Reusable Access Codes
    console.log('Creating universal reusable access codes...');
    const accessCodes = [
        'TENADAM1301SRS', // Main universal code
        'DEMO123',
        'TEST456',
        'EVAL789',
        'PILOT01'
    ];
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
        });
    }
    // 2. Create Categories and Subcategories (Baldrige Framework)
    console.log('Creating categories and subcategories...');
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
    ];
    for (const categoryData of categories) {
        const { subcategories, ...categoryInfo } = categoryData;
        const category = await prisma.category.upsert({
            where: { name: categoryInfo.name },
            update: {},
            create: categoryInfo,
        });
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
            });
        }
    }
    // 3. Create questions for all categories
    console.log('Creating questions for all categories...');
    // Get all categories with subcategories
    const allCategories = await prisma.category.findMany({
        include: { subcategories: true },
        orderBy: { displayOrder: 'asc' }
    });
    // Define all questions by category
    const allQuestions = {
        'Leadership': {
            'Senior Leadership': [
                { text: 'How do senior leaders set and deploy your organization\'s vision and values?', order: 1 },
                { text: 'How do senior leaders deploy the vision and values through your leadership system, to the workforce, suppliers, partners, customers, and stakeholders?', order: 2 },
                { text: 'How do senior leaders\' personal actions reflect a commitment to those values?', order: 3 },
                { text: 'How do senior leaders\' actions demonstrate commitment to legal and ethical behavior?', order: 4 },
                { text: 'How do senior leaders communicate with and engage workforce, customers, and stakeholders?', order: 5 },
                { text: 'How do senior leaders create an environment for success now and in the future?', order: 6 },
                { text: 'How do senior leaders create and balance value for customers, workforce, suppliers, partners, and stakeholders?', order: 7 },
                { text: 'How do senior leaders evaluate organizational performance and use results to improve leadership, governance, and communication?', order: 8 }
            ],
            'Governance and Societal Responsibilities': [
                { text: 'How does your governance system review and achieve accountability for management\'s actions?', order: 1 },
                { text: 'How does your governance system evaluate senior leaders\' performance and compensation?', order: 2 },
                { text: 'How does your governance system ensure independence and accountability?', order: 3 },
                { text: 'How does your governance system protect stakeholder interests?', order: 4 },
                { text: 'How do you address adverse impacts on society of your products, operations, and workforce?', order: 5 },
                { text: 'How do you promote and ensure ethical behavior throughout the organization?', order: 6 },
                { text: 'How do you monitor and respond to breaches of compliance?', order: 7 },
                { text: 'How do you consider societal well-being and benefit in strategy and daily operations?', order: 8 },
                { text: 'How do you actively support and strengthen key communities?', order: 9 }
            ]
        },
        'Strategy': {
            'Strategy Development': [
                { text: 'How do you conduct your strategic planning?', order: 1 },
                { text: 'How do you consider key elements of risk, resilience, financial, societal, ethical, and regulatory factors in developing strategy?', order: 2 },
                { text: 'How do you consider innovation opportunities in strategy development?', order: 3 },
                { text: 'How do you ensure that your strategy development process addresses your organization\'s core competencies, strategic challenges, and advantages?', order: 4 },
                { text: 'How do you collect and analyze relevant data and information to identify potential blind spots in your strategic planning?', order: 5 },
                { text: 'How do you decide which key potential opportunities for innovation are intelligent risks worth pursuing?', order: 6 },
                { text: 'How do you decide which key strategic opportunities are worth pursuing?', order: 7 }
            ],
            'Strategy Implementation': [
                { text: 'What are your key short- and longer-term action plans?', order: 1 },
                { text: 'How do you deploy your action plans throughout the organization?', order: 2 },
                { text: 'How do you ensure that financial and other resources are available to support action plan implementation?', order: 3 },
                { text: 'What are your key performance measures for tracking progress on your action plans?', order: 4 },
                { text: 'How do you ensure that your performance measurement system provides timely, actionable data?', order: 5 },
                { text: 'How do you project future performance of key measures and indicators?', order: 6 },
                { text: 'How does your projected performance compare with that of competitors, benchmarks, or relevant comparisons?', order: 7 }
            ]
        },
        'Customers': {
            'Customer Expectations': [
                { text: 'How do you listen to current and potential customers to obtain actionable information?', order: 1 },
                { text: 'How do you use listening methods to capture actionable information on changing customer needs and expectations?', order: 2 },
                { text: 'How do you determine customer groups and market segments?', order: 3 },
                { text: 'How do you determine product offerings to support customer groups and market segments?', order: 4 }
            ],
            'Customer Engagement': [
                { text: 'How do you build and manage customer relationships?', order: 1 },
                { text: 'How do you enable customers to seek information and support?', order: 2 },
                { text: 'How do you determine customer satisfaction, dissatisfaction, and engagement?', order: 3 },
                { text: 'How do you manage customer complaints?', order: 4 },
                { text: 'How do you use complaint information to support customer engagement and organizational learning?', order: 5 },
                { text: 'How do you build relationships with customers to retain them, meet their requirements, and exceed their expectations?', order: 6 },
                { text: 'How do you increase customer loyalty and positive referral?', order: 7 }
            ]
        },
        'Measurement, Analysis, and Knowledge Management': {
            'Measurement and Analysis': [
                { text: 'How do you select, collect, align, and integrate data and information to use in tracking daily operations and overall performance?', order: 1 },
                { text: 'How do you use data and information to support organizational decision making and innovation?', order: 2 },
                { text: 'How do you review your organization\'s performance and capabilities?', order: 3 },
                { text: 'How do you use performance review findings to identify priorities for continuous improvement and innovation?', order: 4 }
            ],
            'Information and Knowledge Management': [
                { text: 'How do you ensure the quality of your data and information?', order: 1 },
                { text: 'How do you ensure the availability of data and information to workforce, suppliers, partners, collaborators, and customers, as appropriate?', order: 2 },
                { text: 'How do you build and manage organizational knowledge?', order: 3 },
                { text: 'How do you share best practices across organizational units?', order: 4 },
                { text: 'How do you ensure that your workforce, suppliers, partners, and collaborators have the knowledge needed to accomplish their work?', order: 5 }
            ]
        },
        'Workforce': {
            'Workforce Environment': [
                { text: 'How do you assess workforce capability and capacity needs?', order: 1 },
                { text: 'How do you recruit, hire, place, and retain new workforce members?', order: 2 },
                { text: 'How do you organize and manage your workforce?', order: 3 },
                { text: 'How do you ensure workplace health, security, and accessibility?', order: 4 },
                { text: 'How do you support your workforce via services, benefits, and policies?', order: 5 }
            ],
            'Workforce Engagement': [
                { text: 'How do you determine key drivers of workforce engagement?', order: 1 },
                { text: 'How do you foster a culture conducive to high performance?', order: 2 },
                { text: 'How do you assess workforce engagement?', order: 3 },
                { text: 'How do you use workforce climate and engagement data?', order: 4 },
                { text: 'How do you manage workforce performance to achieve high performance?', order: 5 }
            ]
        },
        'Operations': {
            'Work Processes': [
                { text: 'How do you determine your organization\'s core competencies?', order: 1 },
                { text: 'How do you design and innovate your work processes?', order: 2 },
                { text: 'How do you determine your key work processes?', order: 3 },
                { text: 'How do you manage your key work processes to deliver customer value?', order: 4 }
            ],
            'Operational Effectiveness': [
                { text: 'How do you control the overall costs of your operations?', order: 1 },
                { text: 'How do you achieve productivity and cycle time performance?', order: 2 },
                { text: 'How do you ensure safety across your operations?', order: 3 },
                { text: 'How do you ensure organizational resilience and business continuity?', order: 4 }
            ]
        },
        'Results': {
            'Product and Process Results': [
                { text: 'What are your current levels and trends in key measures or indicators of product and process performance?', order: 1 },
                { text: 'What are your performance results for key work process effectiveness and efficiency?', order: 2 },
                { text: 'What are your results for delivering customer value?', order: 3 }
            ],
            'Customer Results': [
                { text: 'What are your current levels and trends in key measures of customer satisfaction and dissatisfaction?', order: 1 },
                { text: 'What are your results for customer engagement, loyalty, and retention?', order: 2 }
            ],
            'Workforce Results': [
                { text: 'What are your results for workforce capability and capacity?', order: 1 },
                { text: 'What are your results for workforce engagement and satisfaction?', order: 2 },
                { text: 'What are your results for workforce development and learning?', order: 3 }
            ],
            'Leadership and Governance Results': [
                { text: 'What are your results for senior leaders\' communication and actions to build and support the organization\'s vision and values?', order: 1 },
                { text: 'What are your results for governance accountability?', order: 2 },
                { text: 'What are your results for legal, ethical, and regulatory compliance?', order: 3 },
                { text: 'What are your results for societal responsibilities and community support?', order: 4 }
            ],
            'Financial and Market Results': [
                { text: 'What are your current levels and trends in key financial performance measures?', order: 1 },
                { text: 'What are your results for key measures of marketplace performance, including market share or position?', order: 2 },
                { text: 'What are your results for strategic objectives and action plan accomplishment?', order: 3 }
            ]
        }
    };
    // Create questions for each category
    for (const category of allCategories) {
        const categoryQuestions = allQuestions[category.name];
        if (categoryQuestions) {
            for (const subcategory of category.subcategories) {
                const subcatQuestions = categoryQuestions[subcategory.name];
                if (subcatQuestions) {
                    for (const questionData of subcatQuestions) {
                        // Create the question
                        const question = await prisma.question.upsert({
                            where: {
                                subcategoryId_orderIndex: {
                                    subcategoryId: subcategory.id,
                                    orderIndex: questionData.order
                                }
                            },
                            update: {},
                            create: {
                                questionText: questionData.text,
                                questionType: 'LONG_TEXT',
                                orderIndex: questionData.order,
                                subcategoryId: subcategory.id,
                                points: 1.0
                            },
                        });
                        // No options needed for text response questions
                    }
                }
            }
        }
    }
    // 4. Create admin user
    console.log('Creating admin user...');
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
    });
    console.log('Seed completed successfully!');
    console.log('Created:');
    console.log(`- ${accessCodes.length} access codes`);
    console.log(`- ${categories.length} categories`);
    console.log('- All questions for all categories (complete Baldrige Framework)');
    console.log('- Admin user (admin@tenadam.com / password)');
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=seed.js.map