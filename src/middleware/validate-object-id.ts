import { isValidObjectId } from "mongoose";
import { HttpError } from "../error/custom-error.ts";

export const validateObjectId = (req: any, res: any, next: any) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new HttpError("Invalid ID", 400);
  }

  next();
};