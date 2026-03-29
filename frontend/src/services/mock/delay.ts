export const delay = async (ms = 400) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};
