import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Middleware to validate session
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

// GET /api/assessment/categories
// Get all categories with subcategories for navigation (public endpoint)
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        subcategories: {
          orderBy: { displayOrder: 'asc' },
          include: {
            questions: {
              orderBy: { orderIndex: 'asc' },
              include: {
                options: {
                  orderBy: { orderIndex: 'asc' }
                }
              }
            }
          }
        }
      }
    });

    // Format categories for public access (without user progress)
    const formattedCategories = categories.map(category => {
      const subcategoriesFormatted = category.subcategories.map(subcategory => {
        const totalQuestions = subcategory.questions.length;

        return {
          id: subcategory.id,
          name: subcategory.name,
          displayOrder: subcategory.displayOrder,
          description: subcategory.description,
          totalQuestions,
          answeredQuestions: 0, // No user progress for public access
          isComplete: false, // No user progress for public access
          questions: subcategory.questions.map(question => ({
            id: question.id,
            text: question.questionText,
            type: 'textarea', // All Baldrige questions are written response questions
            required: true, // All questions are required in Baldrige assessment
            subcategoryId: question.subcategoryId,
            displayOrder: question.orderIndex,
            options: [] // No options needed for text responses
          }))
        };
      });

      const totalQuestions = subcategoriesFormatted.reduce(
        (sum, sub) => sum + sub.totalQuestions, 0
      );

      return {
        id: category.id,
        name: category.name,
        displayOrder: category.displayOrder,
        description: category.description,
        totalQuestions,
        answeredQuestions: 0, // No user progress for public access
        isComplete: false, // No user progress for public access
        subcategories: subcategoriesFormatted
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedCategories
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/assessment/questions/:subcategoryId
// Get all questions for a specific subcategory
router.get('/questions/:subcategoryId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { subcategoryId } = req.params;
    const user = (req as any).user;

    const subcategory = await prisma.subcategory.findUnique({
      where: { id: subcategoryId },
      include: {
        category: { select: { name: true } },
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            options: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        }
      }
    });

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }

    // Get user's existing responses for this subcategory
    const userResponses = await prisma.response.findMany({
      where: {
        userId: user.id,
        questionId: {
          in: subcategory.questions.map(q => q.id)
        }
      }
    });

    const responseMap = new Map(
      userResponses.map(response => [response.questionId, response])
    );

    // Format questions with user responses
    const questionsWithResponses = subcategory.questions.map(question => ({
      id: question.id,
      questionText: question.questionText,
      questionType: question.questionType,
      orderIndex: question.orderIndex,
      points: question.points,
      instructions: question.instructions,
      options: question.options.map(option => ({
        id: option.id,
        optionText: option.optionText,
        value: option.value,
        orderIndex: option.orderIndex
      })),
      userResponse: responseMap.has(question.id) ? {
        responseValue: responseMap.get(question.id)?.responseValue,
        responseText: responseMap.get(question.id)?.responseText,
        points: responseMap.get(question.id)?.points
      } : null
    }));

    return res.status(200).json({
      success: true,
      data: {
        subcategory: {
          id: subcategory.id,
          name: subcategory.name,
          description: subcategory.description,
          categoryName: subcategory.category.name
        },
        questions: questionsWithResponses
      }
    });

  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/assessment/response
// Save or update a response to a question
router.post('/response', authenticateUser, async (req: Request, res: Response) => {
  try {
    const {
      questionId,
      responseValue,
      responseText,
      timeSpent
    } = req.body;

    const user = (req as any).user;

    // Validate required fields
    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: 'questionId is required'
      });
    }

    // Verify question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { options: true }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Calculate points based on response (for Likert scale, points = response value)
    let points = 0;
    if (responseValue !== null && responseValue !== undefined) {
      points = parseFloat(responseValue) || 0;
    }

    // Save or update response
    const response = await prisma.response.upsert({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId: questionId
        }
      },
      update: {
        responseValue: responseValue?.toString(),
        responseText,
        points,
        timeSpent: timeSpent || 0,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        questionId,
        responseValue: responseValue?.toString(),
        responseText,
        points,
        timeSpent: timeSpent || 0
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Response saved successfully',
      data: {
        id: response.id,
        responseValue: response.responseValue,
        responseText: response.responseText,
        points: response.points,
        updatedAt: response.updatedAt
      }
    });

  } catch (error) {
    console.error('Error saving response:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/assessment/responses
// Save or update multiple responses at once (bulk operation)
router.post('/responses', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { assessmentId, responses } = req.body;
    const user = (req as any).user;

    if (!responses || typeof responses !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Responses object is required'
      });
    }

    const savedResponses = [];
    const errors = [];

    // Process each response
    for (const [itemCode, responseText] of Object.entries(responses)) {
      if (!responseText || typeof responseText !== 'string') {
        continue; // Skip empty responses
      }

      try {
        // Find the question by itemCode (assuming itemCode maps to question text or we have a mapping)
        // For now, we'll create a simple mapping or use the itemCode directly
        const question = await prisma.question.findFirst({
          where: {
            questionText: {
              contains: itemCode
            }
          }
        });

        if (!question) {
          errors.push(`Question not found for itemCode: ${itemCode}`);
          continue;
        }

        // Save the response
        const response = await prisma.response.upsert({
          where: {
            userId_questionId: {
              userId: user.id,
              questionId: question.id
            }
          },
          update: {
            responseText: responseText.trim(),
            updatedAt: new Date()
          },
          create: {
            userId: user.id,
            questionId: question.id,
            responseText: responseText.trim(),
            points: 0, // Will be calculated later during scoring
            timeSpent: 0
          }
        });

        savedResponses.push({
          itemCode,
          questionId: question.id,
          responseId: response.id,
          responseText: response.responseText
        });

      } catch (error) {
        console.error(`Error saving response for ${itemCode}:`, error);
        errors.push(`Failed to save response for ${itemCode}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Saved ${savedResponses.length} responses successfully`,
      data: {
        savedResponses,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('Error saving bulk responses:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/assessment/progress/:userId
// Save assessment progress for a user
router.post('/progress/:userId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { responses, completedCategories } = req.body;
    const currentUser = (req as any).user;

    // Users can only save their own progress
    if (currentUser.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const progress = await prisma.userProgress.upsert({
      where: { userId },
      update: {
        responses,
        completedCategories,
      },
      create: {
        userId,
        responses,
        completedCategories,
      },
    });

    return res.status(200).json({
      success: true,
      data: progress,
    });

  } catch (error) {
    console.error('Error saving progress:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/assessment/progress/:userId
// Get assessment progress for a user
router.get('/progress/:userId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUser = (req as any).user;

    // Users can only view their own progress (unless admin)
    if (currentUser.id !== userId && !currentUser.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const progress = await prisma.userProgress.findUnique({
      where: { userId },
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'No progress found for this user.'
      });
    }

    return res.status(200).json({
      success: true,
      data: progress,
    });

  } catch (error) {
    console.error('Error fetching progress:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/assessment/submit
// Submit completed assessment
router.post('/submit', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // Check if all questions are answered - require complete assessment
    const totalQuestions = await prisma.question.count();
    const answeredQuestions = await prisma.response.count({
      where: { userId: user.id }
    });

    console.log(`User ${user.id} attempting submission: ${answeredQuestions}/${totalQuestions} questions answered`);

    if (answeredQuestions < totalQuestions) {
      return res.status(400).json({
        success: false,
        message: `Assessment incomplete. Please answer all questions before submitting. ${answeredQuestions}/${totalQuestions} questions completed.`,
        data: {
          answeredQuestions,
          totalQuestions,
          remainingQuestions: totalQuestions - answeredQuestions
        }
      });
    }

    // Calculate total score
    const responses = await prisma.response.findMany({
      where: { userId: user.id },
      include: { question: true }
    });

    const totalScore = responses.reduce((sum, response) =>
      sum + (response.points || 0), 0
    );

    const maxPossibleScore = totalQuestions * 4; // Assuming 4 is max score per question
    const percentageScore = Math.round((totalScore / maxPossibleScore) * 100);

    // Mark assessment as completed (you might want to create an AssessmentAttempt record)
    // For now, we'll just return the completion data

    return res.status(200).json({
      success: true,
      message: 'Thank you for taking the Tenadam Assessment! Your responses have been successfully submitted.',
      data: {
        submissionId: `TENADAM-${Date.now()}`, // Simple submission ID
        submittedAt: new Date(),
        totalScore,
        maxPossibleScore,
        percentageScore: answeredQuestions > 0 ? percentageScore : 0,
        totalQuestions,
        answeredQuestions,
        completionRate: Math.round((answeredQuestions / totalQuestions) * 100),
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          organization: user.organization
        }
      }
    });

  } catch (error) {
    console.error('Error submitting assessment:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;