import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Middleware to validate session and check for admin role
const authenticateUser = async (req: Request, res: Response, next: any) => {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true }
    });

    if (!session || !session.isActive || session.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session'
      });
    }

    // Check if user is admin
    if (!session.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privilege required'
      });
    }

    // Add user to request
    (req as any).user = session.user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// GET /api/admin/dashboard/stats
router.get('/dashboard/stats', authenticateUser, async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalOrganizations, totalAssessments, completedAssessments, inProgressAssessments] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.organization.count({ where: { isActive: true } }),
      prisma.assessment.count(),
      prisma.assessmentAttempt.count({ where: { status: 'COMPLETED' } }),
      prisma.assessmentAttempt.count({ where: { status: 'IN_PROGRESS' } })
    ]);

    const averageCompletionRate = totalAssessments > 0 ? Math.round((completedAssessments / totalAssessments) * 100) : 0;

    const averageScoreResult = await prisma.assessmentAttempt.aggregate({
      where: { status: 'COMPLETED', score: { not: null } },
      _avg: { score: true }
    });
    const averageScore = Math.round(averageScoreResult._avg.score || 0);

    const recentActivity = await prisma.assessmentAttempt.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: {
        user: true,
        assessment: { include: { template: true } }
      }
    });

    const formattedActivity = recentActivity.map(attempt => ({
      type: attempt.status === 'COMPLETED' ? 'completion' : attempt.status === 'IN_PROGRESS' ? 'start' : 'other',
      description: `${attempt.user.fullName} ${attempt.status === 'COMPLETED' ? 'completed' : 'started'} assessment: ${attempt.assessment.title}`,
      timestamp: attempt.updatedAt.toLocaleDateString()
    }));

    res.json({
      totalUsers,
      totalOrganizations,
      totalAssessments,
      completedAssessments,
      inProgressAssessments,
      averageCompletionRate,
      averageScore,
      recentActivity: formattedActivity
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/admin/dashboard/charts
router.get('/dashboard/charts', authenticateUser, async (req: Request, res: Response) => {
  try {
    // Assessment by category data
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          include: {
            questions: {
              include: {
                responses: {
                  include: {
                    attempt: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const assessmentsByCategory = categories.map(category => {
      const completed = category.subcategories.reduce((acc, sub) =>
        acc + sub.questions.reduce((qAcc, q) =>
          qAcc + q.responses.filter(r => r.attempt?.status === 'COMPLETED').length, 0), 0);

      const inProgress = category.subcategories.reduce((acc, sub) =>
        acc + sub.questions.reduce((qAcc, q) =>
          qAcc + q.responses.filter(r => r.attempt?.status === 'IN_PROGRESS').length, 0), 0);

      return {
        category: category.name,
        completed,
        inProgress
      };
    });

    // Completion trends (mock data for now)
    const completionTrends = [
      { month: 'Jan', completions: 45 },
      { month: 'Feb', completions: 52 },
      { month: 'Mar', completions: 48 },
      { month: 'Apr', completions: 61 },
      { month: 'May', completions: 55 },
      { month: 'Jun', completions: 67 }
    ];

    // Organization performance
    const organizations = await prisma.organization.findMany({
      include: {
        members: {
          include: {
            user: {
              include: {
                assessmentAttempts: true
              }
            }
          }
        }
      }
    });

    const organizationPerformance = organizations.map(org => {
      const userCount = org.members.length;
      const attempts = org.members.flatMap(m => m.user.assessmentAttempts);
      const completedAttempts = attempts.filter(a => a.status === 'COMPLETED');
      const averageScore = completedAttempts.length > 0
        ? Math.round(completedAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / completedAttempts.length)
        : 0;

      return {
        id: org.id,
        name: org.name,
        userCount,
        assessmentCount: attempts.length,
        averageScore,
        status: org.isActive ? 'Active' : 'Inactive'
      };
    });

    res.json({
      assessmentsByCategory,
      completionTrends,
      organizationPerformance
    });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/admin/assessments
router.get('/assessments', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { org, status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (org) {
      where.assignedBy = {
        organization: org as string,
      };
    }
    if (status) {
      where.status = status as string;
    }

    // Get all users with their responses instead of assessments
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { isActive: true },
        include: {
          responses: {
            include: {
              question: {
                include: {
                  subcategory: {
                    include: {
                      category: true
                    }
                  }
                }
              }
            }
          },
          userProgress: true
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: Number(limit)
      }),
      prisma.assessment.count({ where })
    ]);

    // Transform users to match the expected assessment format
    const transformedAssessments = users.map(user => {
      // Calculate completion status
      const totalQuestions = 50; // Approximate total questions in Baldrige framework
      const completedQuestions = user.responses.length;
      const completionPercentage = Math.round((completedQuestions / totalQuestions) * 100);
      
      return {
        id: user.id,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          organization: user.organization,
          phoneNumber: user.phoneNumber
        },
        status: user.userProgress?.isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
        completionPercentage,
        totalResponses: user.responses.length,
        createdAt: user.createdAt,
        updatedAt: user.userProgress?.updatedAt || user.updatedAt,
        responses: user.responses,
        progress: user.userProgress
      };
    });

    res.status(200).json({
      assessments: transformedAssessments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: users.length,
        pages: Math.ceil(users.length / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/admin/organizations
router.get('/organizations', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { isActive: true };
    if (search) {
      where.name = {
        contains: search as string,
        mode: 'insensitive'
      };
    }

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        include: {
          members: {
            include: {
              user: {
                include: {
                  assessmentAttempts: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: Number(limit)
      }),
      prisma.organization.count({ where })
    ]);

    const formattedOrgs = organizations.map(org => {
      const attempts = org.members.flatMap(m => m.user.assessmentAttempts);
      const completedAttempts = attempts.filter(a => a.status === 'COMPLETED');

      return {
        ...org,
        userCount: org.members.length,
        assessmentCount: attempts.length,
        completedCount: completedAttempts.length,
        averageScore: completedAttempts.length > 0
          ? Math.round(completedAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / completedAttempts.length)
          : 0
      };
    });

    res.json({
      organizations: formattedOrgs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/admin/users
router.get('/users', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, organization } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { isActive: true };
    if (search) {
      where.OR = [
        { fullName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    if (organization) {
      where.organization = organization as string;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          assessmentAttempts: {
            include: {
              assessment: true
            }
          },
          organizationMemberships: {
            include: {
              organization: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: Number(limit)
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/admin/users/:userId
// Get detailed assessment data for a specific user
router.get('/users/:userId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        responses: {
          include: {
            question: {
              include: {
                subcategory: {
                  include: {
                    category: true
                  }
                }
              }
            }
          }
        },
        userProgress: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate scores by category
    const categoryScores: { [key: string]: { score: number; maxScore: number; responses: any[] } } = {};
    
    user.responses.forEach(response => {
      if (response.question && response.question.subcategory) {
        const categoryName = response.question.subcategory.category.name;
        
        if (!categoryScores[categoryName]) {
          categoryScores[categoryName] = {
            score: 0,
            maxScore: 0,
            responses: []
          };
        }
        
        categoryScores[categoryName].score += (response.points || 0);
        categoryScores[categoryName].maxScore += (response.question.points || 10);
        categoryScores[categoryName].responses.push(response);
      }
    });

    // Transform to expected format
    const scores = Object.entries(categoryScores).map(([category, data]) => ({
      category,
      score: data.maxScore > 0 ? Math.round((data.score / data.maxScore) * 100) : 0,
      rawScore: data.score,
      maxScore: data.maxScore,
      responses: data.responses
    }));

    const assessmentData = {
      id: user.id,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        organization: user.organization,
        phoneNumber: user.phoneNumber
      },
      scores: scores,
      totalResponses: user.responses.length,
      isCompleted: user.userProgress?.isCompleted || false,
      completedAt: user.userProgress?.completedAt,
      createdAt: user.createdAt,
      responses: user.responses,
      progress: user.userProgress
    };

    return res.status(200).json({
      success: true,
      data: assessmentData
    });

  } catch (error) {
    console.error('Error fetching user assessment:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/admin/analytics
// Get analytics data for all users with their assessment responses and scores
router.get('/analytics', authenticateUser, async (req: Request, res: Response) => {
  try {
    // Get all users with their responses and progress
    const users = await prisma.user.findMany({
      where: { isActive: true },
      include: {
        responses: {
          include: {
            question: {
              include: {
                subcategory: {
                  include: {
                    category: true
                  }
                }
              }
            }
          }
        },
        userProgress: true
      }
    });

    // Transform the data for analytics
    const analyticsData = users.map(user => {
      // Calculate scores by category
      const categoryScores: { [key: string]: number } = {};
      const categoryMaxScores: { [key: string]: number } = {};
      
      // Initialize category scores
      const categories = ['Leadership', 'Strategy', 'Customers', 'Measurement, Analysis, and Knowledge Management', 'Workforce', 'Operations', 'Results'];
      categories.forEach(cat => {
        categoryScores[cat] = 0;
        categoryMaxScores[cat] = 0;
      });

      // Calculate scores from responses
      user.responses.forEach(response => {
        if (response.question && response.question.subcategory) {
          const categoryName = response.question.subcategory.category.name;
          const points = response.points || 0;
          
          if (!categoryScores[categoryName]) {
            categoryScores[categoryName] = 0;
            categoryMaxScores[categoryName] = 0;
          }
          
          categoryScores[categoryName] += points;
          categoryMaxScores[categoryName] += (response.question.points || 10); // Default max points per question
        }
      });

      // Calculate percentage scores
      const scores = categories.map(category => {
        const score = categoryScores[category] || 0;
        const maxScore = categoryMaxScores[category] || 1;
        const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
        
        return {
          category,
          score: percentage,
          rawScore: score,
          maxScore: maxScore
        };
      });

      return {
        id: user.id,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          organizationName: user.organization,
          phoneNumber: user.phoneNumber
        },
        scores: scores,
        totalResponses: user.responses.length,
        isCompleted: user.userProgress?.isCompleted || false,
        completedAt: user.userProgress?.completedAt,
        createdAt: user.createdAt
      };
    });

    return res.status(200).json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;