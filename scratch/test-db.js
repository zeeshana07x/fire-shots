const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  // Try selecting to see what columns exist
  const { data: selectData, error: selectError } = await supabase
    .from('batches')
    .select('*')
    .limit(1);
  console.log('Select * result:', { selectData, selectError });

  // Try inserting a dummy batch (without status first to see if it works, then with status)
  // We need a valid user_id from profiles. Let's get one.
  const { data: profiles, error: profError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);
  
  if (profError || !profiles || profiles.length === 0) {
    console.error('No profiles found or error:', profError);
    return;
  }
  const userId = profiles[0].id;
  console.log('Using userId:', userId);

  const { data: insertNoStatus, error: errNoStatus } = await supabase
    .from('batches')
    .insert({ user_id: userId, palette: {} })
    .select();
  console.log('Insert without status:', { insertNoStatus, errNoStatus });

  const { data: insertWithStatus, error: errWithStatus } = await supabase
    .from('batches')
    .insert({ user_id: userId, palette: {}, status: 'processing' })
    .select();
  console.log('Insert with status:', { insertWithStatus, errWithStatus });
}

test();
