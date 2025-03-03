import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ymzzoaacmqxgnwqhinun.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltenpvYWFjbXF4Z253cWhpbnVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMzUzNDcsImV4cCI6MjA1NjYxMTM0N30.yLg7sNuIeUwiwSwx6UkLxq2ICDjn05oJgW5VqgnVYqg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
