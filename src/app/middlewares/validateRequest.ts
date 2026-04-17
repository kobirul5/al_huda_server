import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

const validateRequest =
  (schema: AnyZodObject) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        console.log("Incoming req.body:", req.body);

      let dataToValidate = req.body;

      if (req.body?.data) {
        console.log("req.body.data detected:", req.body.data);

        try {
          dataToValidate =
            typeof req.body.data === "string"
              ? JSON.parse(req.body.data)
              : req.body.data;

          console.log("Parsed data:", dataToValidate);
        } catch (parseError) {
          console.log("JSON parse failed:", parseError);
          return next(parseError);
        }
      }

      const validatedData = await schema.parseAsync(dataToValidate);

      console.log("Zod validated data:", validatedData);

      req.body = validatedData;
        return next();
      } catch (err) {
        next(err);
      }
    };

export default validateRequest;
