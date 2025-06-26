import express, { Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import emailAutomationService from '../services/emailAutomationService';
import brevoService from '../services/brevoService';
import advancedEmailTemplates from '../services/advancedEmailTemplates';

const router = express.Router();

/**
 * Get email automation statistics
 * GET /api/email-management/stats
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const workflowStats = emailAutomationService.getWorkflowStats();
    
    res.json({
      success: true,
      data: {
        workflows: workflowStats,
        brevoStatus: {
          apiKey: process.env.BREVO_API_KEY ? 'Configured' : 'Not configured',
          emailTemplates: Object.keys(brevoService.getEmailTemplates()).length,
          smsTemplates: Object.keys(brevoService.getSMSTemplates()).length
        }
      }
    });
  } catch (error) {
    console.error('Email stats error:', error);
    res.status(500).json({ error: 'Failed to get email statistics' });
  }
});

/**
 * Test email workflow
 * POST /api/email-management/test-workflow
 */
router.post('/test-workflow', async (req: Request, res: Response) => {
  try {
    const { workflowName, triggerType, testEmail, testData } = req.body;

    if (!workflowName || !triggerType || !testEmail) {
      return res.status(400).json({ error: 'Workflow name, trigger type, and test email are required' });
    }

    const userData = {
      userId: 'test-user-id',
      email: testEmail,
      name: testData?.name || 'Test User',
      firstName: testData?.firstName || 'Test'
    };

    await emailAutomationService.triggerWorkflow(workflowName, triggerType, userData, testData);

    res.json({
      success: true,
      message: `Test email workflow '${workflowName}' triggered successfully`,
      data: {
        workflowName,
        triggerType,
        testEmail,
        userData,
        testData
      }
    });
  } catch (error) {
    console.error('Test workflow error:', error);
    res.status(500).json({ 
      error: 'Failed to test email workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Send personalized recommendations
 * POST /api/email-management/send-recommendations
 */
router.post('/send-recommendations', async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // TODO: Fetch real product recommendations based on user behavior
    // For now, return error indicating this needs real product data
    return res.status(501).json({ 
      error: 'Personalized recommendations require real product data integration',
      message: 'This endpoint needs to be connected to actual product recommendation logic'
    });
  } catch (error) {
    console.error('Send recommendations error:', error);
    res.status(500).json({ 
      error: 'Failed to send recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Send win-back campaign
 * POST /api/email-management/send-winback
 */
router.post('/send-winback', async (req: Request, res: Response) => {
  try {
    const { email, name, daysInactive } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const userData = { name: name || 'Valued Customer' };
    const template = advancedEmailTemplates.winBackCampaign(userData, daysInactive || 30);
    
    const result = await brevoService.sendEmail({ email, name: userData.name }, template);

    res.json({
      success: true,
      message: 'Win-back campaign sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Send win-back error:', error);
    res.status(500).json({ 
      error: 'Failed to send win-back campaign',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get email templates
 * GET /api/email-management/templates
 */
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const emailTemplates = brevoService.getEmailTemplates();
    const smsTemplates = brevoService.getSMSTemplates();

    res.json({
      success: true,
      data: {
        emailTemplates: Object.keys(emailTemplates),
        smsTemplates: Object.keys(smsTemplates),
        advancedTemplates: ['personalizedRecommendations', 'winBackCampaign'],
        workflows: [
          {
            name: 'welcome-series',
            triggers: ['user-registered'],
            description: 'Welcome email series for new users'
          },
          {
            name: 'order-journey',
            triggers: ['order-placed', 'order-shipped', 'order-delivered'],
            description: 'Complete order journey emails'
          },
          {
            name: 'cart-abandonment',
            triggers: ['cart-abandoned'],
            description: 'Cart abandonment recovery emails'
          },
          {
            name: 'win-back',
            triggers: ['user-inactive-30days', 'user-inactive-60days', 'user-inactive-90days'],
            description: 'Win-back campaigns for inactive users'
          }
        ]
      }
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to get email templates' });
  }
});

export default router; 