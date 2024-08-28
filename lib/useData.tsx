// useData.ts
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Configure Supabase
const supabaseUrl = "https://ntfnizmqhsvxthxiyfxh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50Zm5pem1xaHN2eHRoeGl5ZnhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ3OTY4ODksImV4cCI6MjA0MDM3Mjg4OX0.m8KqtcK6ndfXTqXPahW9oWD2UQpga2E3fR2a5aTegvg";
const supabase = createClient(supabaseUrl, supabaseKey);

export const useData = () => {
  const [data, setData] = useState<{ id: number; name: string; cantou: boolean; music: string; order_position: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data: fetchedData, error } = await supabase
      .from('test_table')
      .select('id, name, cantou, music, order_position')
      .order('order_position', { ascending: true });

    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setData(fetchedData || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('custom-insert-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'test_table' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { data, fetchData, loading };
};
