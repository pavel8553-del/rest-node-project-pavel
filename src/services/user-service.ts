import { type User as UserRequest } from "../validations/user.ts";
import { UserModel } from "../database/models.ts";
import { HttpError, NotFoundError } from "../error/custom-error.ts";
import authService from "./auth-service.ts";
import { logger } from "../logs/logger.ts";

const userService = {
  createUser: async (userData: UserRequest) => {
    const userExist = await UserModel.findByEmail(userData.email);

    if (userExist) {
      logger.error("[createUser]: The email is already taken");
      throw new HttpError("The email is already taken", 400);
    }

    const user = new UserModel(userData);
    await user.setPassword(userData.password);

    const { password, ...userWithoutPassword } = (await user.save()).toObject();

    logger.info("[createUser]: return success user without password");

    return userWithoutPassword;
  },

  getUsers: async () => {
    const users = await UserModel.find({}, { password: 0 });

    logger.info("[getUsers]: Return all users");

    return users;
  },

  getUser: async (id: string) => {
    const user = await UserModel.findById(id);

    if (!user) {
      logger.error("[getUser]: No such user found");
      throw new NotFoundError("No such user found");
    }

    logger.info("[getUser]: Return user successfully");

    return user;
  },

  updateUser: async (id: string, userData: Partial<UserRequest>) => {
    const updateData = { ...userData };

    if (updateData.password) {
      updateData.password = await authService.hashPassword(
        updateData.password,
      );
    }

    const user = await UserModel.findByIdAndUpdate(
      { _id: id },
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!user) {
      logger.error("[updateUser]: No such user found");
      throw new NotFoundError("No such user found");
    }

    logger.info("[updateUser]: Update user successfully - Return user");

    return user;
  },

  changeBusinessStatus: async (id: string) => {
    const user = await UserModel.findById(id);

    if (!user) {
      logger.error("[changeBusinessStatus]: No such user found");
      throw new NotFoundError("No such user found");
    }

    user.isBusiness = !user.isBusiness;

    await user.save();

    logger.info(
      "[changeBusinessStatus]: Business status changed successfully",
    );

    return user;
  },

  deleteUser: async (id: string) => {
    const user = await UserModel.findByIdAndDelete(id);

    if (!user) {
      logger.error("[deleteUser]: No such user found");
      throw new NotFoundError("No such user found");
    }

    logger.info("[deleteUser]: Delete user successfully - Return user");

    return user;
  },

  login: async (email: string, password: string) => {
    const user = await UserModel.findOne(
      { email },
      {
        password: 1,
        email: 1,
        isBusiness: 1,
        isAdmin: 1,
        loginAttempts: 1,
        blockedUntil: 1,
      },
    );

    if (!user) {
      logger.error("[login]: Login Failed - cannot find user email");

      throw new HttpError(
        "Login Failed - cannot find user email",
        400,
      );
    }

    // Check if the user is currently blocked
    if (user.blockedUntil && user.blockedUntil > new Date()) {
      logger.error("[login]: User is blocked");

      throw new HttpError(
        `User is blocked until ${user.blockedUntil.toISOString()}`,
        403,
      );
    }

    // If 24 hours already passed, reset the block
    if (user.blockedUntil && user.blockedUntil <= new Date()) {
      user.blockedUntil = null;
      user.loginAttempts = 0;

      await user.save();
    }

    const isPasswordValid = await authService.validatePassword(
      password,
      user.password,
    );

    // Incorrect password
    if (!isPasswordValid) {
      user.loginAttempts = (user.loginAttempts ?? 0) + 1;

      // Third failed attempt -> block for 24 hours
      if (user.loginAttempts >= 3) {
        const blockedUntil = new Date();

        blockedUntil.setHours(blockedUntil.getHours() + 24);

        user.blockedUntil = blockedUntil;
        user.loginAttempts = 0;

        await user.save();

        logger.error("[login]: User blocked for 24 hours");

        throw new HttpError(
          "Login Failed - user blocked for 24 hours",
          403,
        );
      }

      await user.save();

      logger.error(
        `[login]: Login Failed - incorrect password. Attempt ${user.loginAttempts}/3`,
      );

      throw new HttpError(
        `Login Failed - incorrect password. Attempt ${user.loginAttempts}/3`,
        400,
      );
    }

    // Successful login -> reset failed attempts
    user.loginAttempts = 0;
    user.blockedUntil = null;

    await user.save();

    const token = authService.generateJWT({
      _id: user._id.toString(),
      email: user.email,
      isBusiness: user.isBusiness,
      isAdmin: user.isAdmin ?? false,
    });

    logger.info(
      "[login]: Login successfully - Return valid token for user",
    );

    return token;
  },
};

export default userService;