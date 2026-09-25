// d:\application\automation\check_settings.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('twitter_automation_settings').select('*');
  console.log('--- Twitter Settings Data ---');
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

check();
