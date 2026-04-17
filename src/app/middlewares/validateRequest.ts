import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

const validateRequest =
  (schema: AnyZodObject) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (req.body.data) {
          const parsedData = JSON.parse(req.body.data);
          req.body.data = await schema.parseAsync(parsedData);
        } else {
          req.body = await schema.parseAsync(req.body);
        }
        return next();
      } catch (err) {
        next(err);
      }
    };

export default validateRequest;
