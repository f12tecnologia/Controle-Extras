import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://baiamtipehjpssonxzjh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhaWFtdGlwZWhqcHNzb254empoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjc2NTksImV4cCI6MjA3MDYwMzY1OX0.uCxzVvNl_OmyBmii3Z4_fJ1Ws-hBK1MkZdY0vo57L1o';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
