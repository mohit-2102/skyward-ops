// ============================================
// VALIDATION MIDDLEWARE
// Reusable Zod validation middleware for Express
// ============================================

import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodRawShape, ZodError } from 'zod';

/**
 * Type for Express request with validated data
 */
interface ValidatedRequest extends Request {
  validatedBody?: unknown;
  validatedQuery?: unknown;
  validatedParams?: unknown;
}

/**
 * Validation middleware factory
 * Validates the specified parts of the request against the provided schema
 */
export function validate(schema: {
  body?: ZodObject<ZodRawShape>;
  query?: ZodObject<ZodRawShape>;
  params?: ZodObject<ZodRawShape>;
}) {
  return async (req: ValidatedRequest, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.validatedBody = await schema.body.parseAsync(req.body);
        req.body = req.validatedBody;
      }
      if (schema.query) {
        req.validatedQuery = await schema.query.parseAsync(req.query);
        req.query = req.validatedQuery as Record<string, string | string[] | undefined>;
      }
      if (schema.params) {
        req.validatedParams = await schema.params.parseAsync(req.params);
        req.params = req.validatedParams as Record<string, string>;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        next(new (await import('./errorHandler')).AppError('Invalid request data', 400, 'VALIDATION_ERROR', details));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Middleware to validate request body only
 */
export function validateBody(schema: ZodObject<ZodRawShape>) {
  return validate({ body: schema });
}

/**
 * Middleware to validate query parameters only
 */
export function validateQuery(schema: ZodObject<ZodRawShape>) {
  return validate({ query: schema });
}

/**
 * Middleware to validate route parameters only
 */
export function validateParams(schema: ZodObject<ZodRawShape>) {
  return validate({ params: schema });
}

/**
 * Combined middleware for common patterns
 */
export function validateAll(schemas: {
  body?: ZodObject<ZodRawShape>;
  query?: ZodObject<ZodRawShape>;
  params?: ZodObject<ZodRawShape>;
}) {
  return validate(schemas);
}