import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSiteConfig<T = any>(sectionKey: string) {
  return useQuery({
    queryKey: ["site_config", sectionKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_config")
        .select("config_data")
        .eq("section_key", sectionKey)
        .single();
      if (error) throw error;
      return data.config_data as T;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSiteConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sectionKey, configData }: { sectionKey: string; configData: any }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("site_config")
        .update({ config_data: configData, updated_by: user?.id })
        .eq("section_key", sectionKey);
      if (error) throw error;
    },
    onSuccess: (_, { sectionKey }) => {
      queryClient.invalidateQueries({ queryKey: ["site_config", sectionKey] });
    },
  });
}
