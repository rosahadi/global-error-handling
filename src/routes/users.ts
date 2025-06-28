import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";

const router = Router();
const prisma = new PrismaClient();

router.get(
  "/:id",
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        posts: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      status: "success",
      data: { user },
    });
  })
);

router.post(
  "/",
  catchAsync(async (req: Request, res: Response) => {
    const { email, name } = req.body;

    if (!email) {
      throw new AppError("Email is required", 400);
    }

    // This will trigger Prisma P2002 error if email already exists
    const user = await prisma.user.create({
      data: {
        email,
        name,
      },
    });

    res.status(201).json({
      status: "success",
      data: { user },
    });
  })
);

router.post(
  "/:id/posts",
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title) {
      throw new AppError("Title is required", 400);
    }

    // This will trigger Prisma P2003 error if user doesn't exist
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: parseInt(id),
      },
    });

    res.status(201).json({
      status: "success",
      data: { post },
    });
  })
);

router.delete(
  "/:id",
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    // This will trigger Prisma P2025 error if user doesn't exist
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).json({
      status: "success",
      data: null,
    });
  })
);

export default router;
