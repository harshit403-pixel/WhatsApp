import globalApi from "../../shared/global.api";

export const searchUsers = async (
  query,
  signal
) => {
  const response = await globalApi.get(
    "/users/search",
    {
      params: { query },
      signal,
    }
  );

  return response.data?.data ?? [];
};
