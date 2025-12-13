export const validateRequest = (validator) => async (req, res, next) => {
  try {
    const validationResult = await validator(req);

    if (validationResult?.error) {
      return res.status(400).json({ message: validationResult.error });
    }

    if (validationResult?.value) {
      req.validated = validationResult.value;
    }

    return next();
  } catch (error) {
    console.error("Validation error:", error);
    return res
      .status(400)
      .json({ message: error.message || "Invalid request" });
  }
};
