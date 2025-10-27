
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://szijpquljlzmnthfneab.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6aWpwcXVsamx6bW50aGZuZWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NjkyMDYsImV4cCI6MjA3NzA0NTIwNn0.jabZpQl_UvW69uwquHznsJBqrbJCyA_0Xks-ioONlJ4'

export const supabase = createClient(supabaseUrl, supabaseKey)