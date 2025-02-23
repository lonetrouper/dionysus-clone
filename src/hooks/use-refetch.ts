import { useQueryClient } from "@tanstack/react-query";

const refetch = () => {
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.refetchQueries({
      type: "active",
    });
  };
};

export default refetch;
