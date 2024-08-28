// lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';



// Substitua com suas credenciais do Supabase
const supabaseUrl = 'https://ntfnizmqhsvxthxiyfxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50Zm5pem1xaHN2eHRoeGl5ZnhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ3OTY4ODksImV4cCI6MjA0MDM3Mjg4OX0.m8KqtcK6ndfXTqXPahW9oWD2UQpga2E3fR2a5aTegvg';

export const supabase = createClient(supabaseUrl, supabaseKey);
