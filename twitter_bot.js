// d:\application\automation\twitter_bot.js
import { createClient } from '@supabase/supabase-js';
import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://aiicylzukkkhxcimsycb.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY,
  appSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

async function generateTweet(niche) {
  return "Victory is not found in comfort. It's found in the struggle. Rebuild your architecture. #WarriorMode #NoRelapse";
}

async function runBot() {
  console.log('--- TWITTER BOT STARTED ---');
  
  // 1. Fetch current settings
  const { data: settings, error } = await client
    .from('twitter_automation_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching settings:', error);
    return;
  }

  if (!settings || settings.status !== 'active') {
    console.log(`Bot is currently ${settings?.status || 'unset'}. Waiting for status: active.`);
    return;
  }

  const niche = settings.niche || 'Men recovery and discipline';
  console.log(`Working on niche: ${niche}`);

  try {
    // 2. Generate content
    const tweetText = await generateTweet(niche);
    console.log(`Generated potential tweet: "${tweetText}"`);

    // 3. Post to Twitter
    console.log('Sending to X...');
    const tweet = await twitterClient.v2.tweet(tweetText);
    const tweetId = tweet.data.id;
    console.log('Post successful! Tweet ID:', tweetId);

    // 4. Log the post back to Supabase
    await client.from('twitter_posts').insert({
      content: tweetText,
      created_at: new Date().toISOString()
    });

    console.log('Activity logged to database.');
  } catch (err) {
    console.error('ERROR during execution:', err.message || err);
  }
}

runBot();
