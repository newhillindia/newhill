import { Router, Request, Response } from 'express';
import { MetricsEndpoint } from '../utils/metrics';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Get application metrics
 *     tags: [System]
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [prometheus, json]
 *           default: prometheus
 *         description: Metrics format
 *     responses:
 *       200:
 *         description: Application metrics
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               description: Prometheus format metrics
 *           application/json:
 *             schema:
 *               type: object
 *               description: JSON format metrics
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const format = req.query.format as string || 'prometheus';
    
    if (format === 'json') {
      const metrics = MetricsEndpoint.getJSONMetrics();
      res.json(metrics);
    } else {
      const metrics = MetricsEndpoint.getPrometheusMetrics();
      res.set('Content-Type', 'text/plain');
      res.send(metrics);
    }
  })
);

export default router;

