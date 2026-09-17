import { createClient } from "@supabase/supabase-js";
import { societies } from "./data/societies";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function seed() {
  for (const s of societies) {
    const { roles, process, id, ...societyData } = s;
    
    const dbSociety = {
      slug: societyData.slug,
      name: societyData.name,
      category: societyData.category,
      tagline: societyData.tagline,
      logo_initials: societyData.logoInitials,
      description: societyData.description,
      criteria: societyData.criteria,
      deadline: societyData.deadline,
      founded_year: societyData.foundedYear,
      member_count: societyData.memberCount,
      meeting_cadence: societyData.meetingCadence,
    };

    const { data: insertedSociety, error: sError } = await supabase
      .from('societies')
      .insert([dbSociety])
      .select()
      .single();

    if (sError) {
      console.error(`Error inserting society ${s.name}:`, sError.message);
      continue;
    }
    console.log(`Inserted society: ${s.name}`);
    const societyId = insertedSociety.id;

    const dbRoles = roles.map(r => ({
      society_id: societyId,
      title: r.title,
      description: r.description
    }));
    const { error: rError } = await supabase.from('roles_open').insert(dbRoles);
    if (rError) console.error(`Error inserting roles for ${s.name}:`, rError.message);

    const dbSteps = process.map((p, index) => ({
      society_id: societyId,
      step_order: index + 1,
      title: p.title,
      description: p.description
    }));
    const { error: pError } = await supabase.from('recruitment_steps').insert(dbSteps);
    if (pError) console.error(`Error inserting steps for ${s.name}:`, pError.message);
  }
}

seed();
