import { type RequestHandler } from "express";
import validateToken from "./validate-token.ts";
import { HttpError, NotFoundError } from "../error/custom-error.ts";
import { CardModel } from "../database/models.ts";

const isCardOwnerOrAdminHandler: RequestHandler = async (req, res, next) => {
  const card = await CardModel.findById(req.params.id);

  if (!card) {
    return next(new NotFoundError("No such card found"));
  }

  if (card.userId === req.user?._id.toString() || req.user?.isAdmin) {
    return next();
  }

  next(new HttpError("Must be admin or card owner", 403));
};

export const isCardOwnerOrAdmin = [validateToken, isCardOwnerOrAdminHandler];
