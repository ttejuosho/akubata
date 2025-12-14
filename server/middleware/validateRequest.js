import { ApiError } from "./errorHandler.js";

export const validateRequest = (validator) => async (req, res, next) => {
  try {
    const validationResult = await validator(req);

    if (validationResult?.error) {
      throw new ApiError(400, validationResult.error);
    }

    if (validationResult?.value) {
      req.validated = validationResult.value;
    }

    return next();
  } catch (error) {
    return next(
      error instanceof ApiError
        ? error
        : new ApiError(400, error.message || "Invalid request")
    );
  }
};
