import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "./auth";

export function useRequireAuth() {
  const router = useRouter();
  useEffect(() => {
    if (!getAccessToken()) router.replace("/login");
  }, [router]);
}
