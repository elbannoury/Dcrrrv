import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://qnzalcplpyyzdlogjewp.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImI1OGViMjUxLWU3MWUtNDNkZC1hYTdjLWEzZDY5MmJlYjNiZCJ9.eyJwcm9qZWN0SWQiOiJxbnphbGNwbHB5eXpkbG9namV3cCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzczNDM3NjM5LCJleHAiOjIwODg3OTc2MzksImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.llaVsmGMR1EsbcYhCqttBSlK6BLaa7KcqD6V7YSzCi8';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };