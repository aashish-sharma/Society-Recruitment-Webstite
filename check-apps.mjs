

async function check() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/?apikey=' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const res = await fetch(url);
  const spec = await res.json();
  console.log("Applications columns:", Object.keys(spec.definitions.applications.properties));
}

check();
