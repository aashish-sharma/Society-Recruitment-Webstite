import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { data: cols, error } = await supabase
    .rpc('get_schema') // this might not exist. let's just use REST API to get columns? 
    // Actually, we can't query information_schema from anon key usually due to RLS.
    // Let's just try to insert a dummy row and let it fail to see the schema, or maybe the tables have data?
  
  const { data: s } = await supabase.from('societies').select('*').limit(1);
  const { data: r } = await supabase.from('roles_open').select('*').limit(1);
  const { data: p } = await supabase.from('recruitment_steps').select('*').limit(1);

  console.log('Societies:', s);
  console.log('Roles:', r);
  console.log('Steps:', p);
}

check();
