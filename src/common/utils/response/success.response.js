export const successResponse = ({
  res,
  message = "Done",
  status = 200,
  data = undefined,
} = {}) => {
  return res.status(status).json({
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
  });
};
