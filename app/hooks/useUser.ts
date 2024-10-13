import useSWR from "swr";

/**
 * Fetch the current user. undefined means loading, null means logged out
 *
 * @example const { data: currentUser } = useUser<User>();
 */
export function useUser<T = unknown>() {
  return useSWR<T>("/api/me");
}
