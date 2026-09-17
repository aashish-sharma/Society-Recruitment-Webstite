DROP TABLE IF EXISTS applications CASCADE;

CREATE TABLE applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id uuid NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles_open(id) ON DELETE CASCADE,
  why text NOT NULL,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  
  -- Ensure a student can only apply for one role per society at a time, or at least only have one application per society.
  -- Depending on the rules, maybe we just restrict one application per society per student.
  UNIQUE(society_id, applicant_id)
);

-- RLS Policies
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage applications" 
ON applications
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Students can insert their own applications
CREATE POLICY "Students can insert their own applications" 
ON applications
FOR INSERT
TO authenticated
WITH CHECK (
  applicant_id = auth.uid()
);

-- Students can read their own applications
CREATE POLICY "Students can view their own applications"
ON applications
FOR SELECT
TO authenticated
USING (
  applicant_id = auth.uid()
);
-- Enable cascading deletes if they aren't already enabled
-- Note: You may need to drop the existing constraint first if it doesn't cascade.
-- This block assumes the standard naming convention 'roles_open_society_id_fkey'. 
-- If it errors on dropping, you can safely skip this part if you know your tables already cascade.
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'roles_open_society_id_fkey') THEN
    ALTER TABLE roles_open DROP CONSTRAINT roles_open_society_id_fkey;
    ALTER TABLE roles_open ADD CONSTRAINT roles_open_society_id_fkey FOREIGN KEY (society_id) REFERENCES societies (id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'recruitment_steps_society_id_fkey') THEN
    ALTER TABLE recruitment_steps DROP CONSTRAINT recruitment_steps_society_id_fkey;
    ALTER TABLE recruitment_steps ADD CONSTRAINT recruitment_steps_society_id_fkey FOREIGN KEY (society_id) REFERENCES societies (id) ON DELETE CASCADE;
  END IF;
END $$;


-- Function to atomically upsert a society and completely replace its roles and steps
CREATE OR REPLACE FUNCTION admin_upsert_society(
  p_society jsonb,
  p_roles jsonb,
  p_steps jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges
AS $$
DECLARE
  v_society_id uuid;
BEGIN
  -- 1. Upsert the society
  -- If p_society->>'id' is null or empty string, we insert without id (let it auto-generate).
  IF p_society->>'id' IS NULL OR p_society->>'id' = '' THEN
    INSERT INTO societies (
      slug, name, category, tagline, logo_initials, description, criteria, 
      deadline, founded_year, member_count, meeting_cadence
    )
    VALUES (
      p_society->>'slug',
      p_society->>'name',
      p_society->>'category',
      p_society->>'tagline',
      p_society->>'logo_initials',
      p_society->>'description',
      p_society->>'criteria',
      (p_society->>'deadline')::date,
      (p_society->>'founded_year')::int,
      (p_society->>'member_count')::int,
      p_society->>'meeting_cadence'
    )
    RETURNING id INTO v_society_id;
  ELSE
    v_society_id := (p_society->>'id')::uuid;
    
    UPDATE societies
    SET
      slug = p_society->>'slug',
      name = p_society->>'name',
      category = p_society->>'category',
      tagline = p_society->>'tagline',
      logo_initials = p_society->>'logo_initials',
      description = p_society->>'description',
      criteria = p_society->>'criteria',
      deadline = (p_society->>'deadline')::date,
      founded_year = (p_society->>'founded_year')::int,
      member_count = (p_society->>'member_count')::int,
      meeting_cadence = p_society->>'meeting_cadence'
    WHERE id = v_society_id;
  END IF;

  -- 2. Delete existing roles and steps
  DELETE FROM roles_open WHERE society_id = v_society_id;
  DELETE FROM recruitment_steps WHERE society_id = v_society_id;

  -- 3. Insert new roles
  IF jsonb_array_length(p_roles) > 0 THEN
    INSERT INTO roles_open (society_id, title, description)
    SELECT 
      v_society_id,
      r->>'title',
      r->>'description'
    FROM jsonb_array_elements(p_roles) AS r;
  END IF;

  -- 4. Insert new steps
  IF jsonb_array_length(p_steps) > 0 THEN
    INSERT INTO recruitment_steps (society_id, step_order, title, description)
    SELECT 
      v_society_id,
      (s->>'step_order')::int,
      s->>'title',
      s->>'description'
    FROM jsonb_array_elements(p_steps) AS s;
  END IF;

  RETURN v_society_id;
END;
$$;
-- 1. Update handle_new_user trigger function to populate full_name, year, and branch
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, year, branch, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'year',
    new.raw_user_meta_data->>'branch',
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    year = EXCLUDED.year,
    branch = EXCLUDED.branch;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Backfill existing profiles where branch or year was not copied over
UPDATE public.profiles p
SET 
  branch = COALESCE(p.branch, u.raw_user_meta_data->>'branch'),
  year = COALESCE(p.year, u.raw_user_meta_data->>'year'),
  full_name = COALESCE(p.full_name, u.raw_user_meta_data->>'full_name')
FROM auth.users u
WHERE p.id = u.id
  AND (p.branch IS NULL OR p.year IS NULL OR p.full_name IS NULL);
-- Google Developers Group --
INSERT INTO societies (id, slug, name, category, tagline, logo_initials, description, criteria, deadline, founded_year, member_count, meeting_cadence)
VALUES ('cedd2934-813f-4cd0-a993-74405cbfec16', 'Google Developers Group', 'Google Developers Group', 'Technical', 'Build things that ship.', 'GDG', 'GDG is a student-run group focused on practical software development. Members collaborate on semester-long projects spanning web, mobile, and data tooling. The emphasis is on writing production-quality code, not just prototypes.', 'Open to anyone comfortable reading documentation and writing code in at least one language. Prior open-source or project experience is helpful but not required.', '2026-10-02', 2019, 52, 'Weekly, Saturday afternoons');

INSERT INTO roles_open (id, society_id, title, description)
VALUES
  ('1e3b0d77-597a-4029-ab56-802792b8def3', 'cedd2934-813f-4cd0-a993-74405cbfec16', 'Web Lead', 'Own the front-end architecture for the semester project. Coordinate with designers and back-end contributors to ship a polished interface.'),
  ('50f59c14-7ae7-4283-b785-01e3350259d9', 'cedd2934-813f-4cd0-a993-74405cbfec16', 'ML Contributor', 'Research and implement machine-learning features within the project. Responsible for data pipelines, model selection, and integration testing.'),
  ('025afd78-eca0-4415-b383-6125a13cdb5d', 'cedd2934-813f-4cd0-a993-74405cbfec16', 'Design Systems Volunteer', 'Maintain the shared component library and style guide. Ensure visual consistency across all project surfaces.');

INSERT INTO recruitment_steps (society_id, step_order, title, description)
VALUES
  ('cedd2934-813f-4cd0-a993-74405cbfec16', 1, 'Apply', 'Submit the form on this site before the deadline.'),
  ('cedd2934-813f-4cd0-a993-74405cbfec16', 2, 'Shortlist review', 'The core team reviews applications and shortlists candidates.'),
  ('cedd2934-813f-4cd0-a993-74405cbfec16', 3, 'Interview / trial task', 'Shortlisted applicants complete a small take-home task and a brief interview.'),
  ('cedd2934-813f-4cd0-a993-74405cbfec16', 4, 'Results', 'Accepted members are notified within a week of interviews.');

-- ARES Society --
INSERT INTO societies (id, slug, name, category, tagline, logo_initials, description, criteria, deadline, founded_year, member_count, meeting_cadence)
VALUES ('ac4d9837-2606-4903-bcef-0d074334a694', 'ARES Society', 'ARES Society', 'Technical', 'Machines, from scratch.', 'AR', 'The ARES Guild designs, builds, and programs autonomous machines from raw materials. Teams work through the full hardware-software cycle each semester, ending with a public demo day. Safety training is provided in the first two weeks.', 'Some familiarity with electronics or mechanical design is expected. You should be comfortable working in a workshop environment.', '2026-10-02', 2017, 30, 'Twice a week, Wednesday & Friday evenings');

INSERT INTO roles_open (id, society_id, title, description)
VALUES
  ('85cca315-83ae-46ef-abd2-05b087aca58c', 'ac4d9837-2606-4903-bcef-0d074334a694', 'Mechanical Lead', 'Design the physical chassis and drive train. Manage CAD files, fabrication schedules, and material procurement.'),
  ('90db253f-f169-4ec3-80af-2ea199cbabd5', 'ac4d9837-2606-4903-bcef-0d074334a694', 'Firmware Engineer', 'Write and test embedded code for motor controllers, sensors, and communication modules. Debug hardware-software integration issues on the bench.');

INSERT INTO recruitment_steps (society_id, step_order, title, description)
VALUES
  ('ac4d9837-2606-4903-bcef-0d074334a694', 1, 'Apply', 'Fill out the application form before the deadline.'),
  ('ac4d9837-2606-4903-bcef-0d074334a694', 2, 'Workshop day', 'Attend a hands-on workshop where you''ll work with the team on a small build.'),
  ('ac4d9837-2606-4903-bcef-0d074334a694', 3, 'Team review', 'Leads evaluate workshop performance and application responses.'),
  ('ac4d9837-2606-4903-bcef-0d074334a694', 4, 'Results', 'Selected members are announced within five days.');

-- Ashwamedh --
INSERT INTO societies (id, slug, name, category, tagline, logo_initials, description, criteria, deadline, founded_year, member_count, meeting_cadence)
VALUES ('a178e2a6-099e-415e-b2cc-477b6f298642', 'Ashwamedh', 'Ashwamedh', 'Cultural', 'Every semester, a new act.', 'AS', 'Ashwamedh Society produces one original stage production each semester, from script to curtain call. Members handle every aspect of the show — writing, acting, set design, and technical production. No prior theatre experience is necessary.', 'Anyone willing to commit to rehearsal schedules and contribute to a team-driven creative process. Auditions are held in the first week after recruitment closes.', '2026-10-02', 2015, 40, 'Weekly, Thursday evenings');

INSERT INTO roles_open (id, society_id, title, description)
VALUES
  ('6c3e2eae-a6c9-47cf-84dd-ba4682ca803a', 'a178e2a6-099e-415e-b2cc-477b6f298642', 'Actor', 'Audition for and perform roles in the semester production. Attend all scheduled rehearsals and contribute to character development workshops.'),
  ('f34bcef4-ce0d-43bb-b515-7545a07ef60c', 'a178e2a6-099e-415e-b2cc-477b6f298642', 'Stage Manager', 'Coordinate rehearsal logistics, maintain the prompt book, and call cues during performances. Act as the primary link between the director and all production teams.'),
  ('3ce253d0-765f-4dad-96f8-aa23795a9218', 'a178e2a6-099e-415e-b2cc-477b6f298642', 'Lighting & Sound', 'Design and operate lighting rigs and audio systems for rehearsals and shows. Collaborate with the director on mood, timing, and technical feasibility.');

INSERT INTO recruitment_steps (society_id, step_order, title, description)
VALUES
  ('a178e2a6-099e-415e-b2cc-477b6f298642', 1, 'Apply', 'Submit your application through this site.'),
  ('a178e2a6-099e-415e-b2cc-477b6f298642', 2, 'Audition / portfolio', 'Actors audition in person; backstage roles submit a short portfolio or past work.'),
  ('a178e2a6-099e-415e-b2cc-477b6f298642', 3, 'Callbacks', 'Selected applicants are called back for a second round with the director.'),
  ('a178e2a6-099e-415e-b2cc-477b6f298642', 4, 'Results', 'Cast and crew lists are posted within a week.');

-- Rhythm Collective --
INSERT INTO societies (id, slug, name, category, tagline, logo_initials, description, criteria, deadline, founded_year, member_count, meeting_cadence)
VALUES ('70190a6b-7786-4a7e-9189-d7d595eaae1a', 'rhythm-collective', 'Rhythm Collective', 'Cultural', 'Dance without borders.', 'RC', 'Rhythm Collective brings together dancers across styles — contemporary, street, classical, and everything in between. The group trains weekly and performs at campus-wide events each semester. Workshops by visiting choreographers are a regular feature.', 'All skill levels are welcome. You should enjoy collaborative movement and be available for weekly practice sessions.', '2026-10-02', 2020, 35, 'Weekly, Sunday mornings');

INSERT INTO roles_open (id, society_id, title, description)
VALUES
  ('4a4eb86c-40ae-44aa-80ce-7e3ccbeeef52', '70190a6b-7786-4a7e-9189-d7d595eaae1a', 'Choreographer', 'Create original routines for the group''s semester showcase. Lead rehearsals, give feedback, and adapt pieces based on team strengths.'),
  ('2d1f155c-8012-414c-9887-d6800351b9cd', '70190a6b-7786-4a7e-9189-d7d595eaae1a', 'Performer', 'Learn and perform choreography at campus events. Attend regular practice sessions and contribute ideas during creative workshops.'),
  ('f33badd7-f137-4f0f-9217-20ae1d3e6226', '70190a6b-7786-4a7e-9189-d7d595eaae1a', 'Event Coordinator', 'Handle venue bookings, costume logistics, and event-day scheduling. Serve as the point of contact with campus administration.');

INSERT INTO recruitment_steps (society_id, step_order, title, description)
VALUES
  ('70190a6b-7786-4a7e-9189-d7d595eaae1a', 1, 'Apply', 'Submit the application form on this site.'),
  ('70190a6b-7786-4a7e-9189-d7d595eaae1a', 2, 'Open jam session', 'Attend a casual group session to dance together and meet the team.'),
  ('70190a6b-7786-4a7e-9189-d7d595eaae1a', 3, 'Results', 'Everyone who attends the jam and submits an application is welcomed in.');

-- Court & Field Club --
INSERT INTO societies (id, slug, name, category, tagline, logo_initials, description, criteria, deadline, founded_year, member_count, meeting_cadence)
VALUES ('9f3ca019-f942-4599-ba49-ef78c8c3043f', 'court-and-field-club', 'Court & Field Club', 'Sports', 'Train together, play harder.', 'CF', 'Court & Field Club organises regular training sessions, friendly matches, and inter-campus tournaments across multiple sports. The club supplies shared equipment and coordinates schedules so members can try more than one discipline per semester.', 'Open to all fitness levels. You should be willing to follow a structured training plan and show up consistently.', '2026-10-02', 2018, 60, 'Three sessions per week, flexible schedule');

INSERT INTO roles_open (id, society_id, title, description)
VALUES
  ('9436802d-641d-45c3-9be9-e58fceaccbe0', '9f3ca019-f942-4599-ba49-ef78c8c3043f', 'Team Captain', 'Lead your sport''s training sessions and represent the team in tournament coordination. Communicate schedules and roster decisions to all members.'),
  ('708aaf0e-6267-4272-bbeb-0578df5d1f47', '9f3ca019-f942-4599-ba49-ef78c8c3043f', 'Fitness Coordinator', 'Plan cross-sport conditioning sessions and track attendance. Work with captains to design warm-up and recovery routines.');

INSERT INTO recruitment_steps (society_id, step_order, title, description)
VALUES
  ('9f3ca019-f942-4599-ba49-ef78c8c3043f', 1, 'Apply', 'Fill out the form and indicate your preferred sport(s).'),
  ('9f3ca019-f942-4599-ba49-ef78c8c3043f', 2, 'Trial sessions', 'Attend two trial training sessions with your chosen sport''s squad.'),
  ('9f3ca019-f942-4599-ba49-ef78c8c3043f', 3, 'Results', 'Captains confirm roster spots after trials.');

-- Axiom --
INSERT INTO societies (id, slug, name, category, tagline, logo_initials, description, criteria, deadline, founded_year, member_count, meeting_cadence)
VALUES ('07964d2f-2413-4b63-ac34-0ec546538320', 'Axiom', 'Axiom', 'Literary', 'Words worth arguing about.', 'AX', 'The Axiom publishes a semesterly journal of essays, fiction, poetry, and visual work. The editorial process is collaborative — every submission is workshopped before publication. The group also hosts reading nights and informal writing circles.', 'You should enjoy reading critically and giving constructive feedback. Publication experience is not required.', '2026-10-02', 2016, 25, 'Biweekly, Tuesday evenings');

INSERT INTO roles_open (id, society_id, title, description)
VALUES
  ('7ec29c7f-0b13-4a2c-825f-287def3b6dc7', '07964d2f-2413-4b63-ac34-0ec546538320', 'Editor', 'Review and workshop submitted pieces. Coordinate with writers on revisions, fact-checking, and final copy before layout.'),
  ('6ad9c7bc-4f10-4f71-a81c-a4441ec09522', '07964d2f-2413-4b63-ac34-0ec546538320', 'Writer', 'Contribute original essays, fiction, or poetry to the journal. Participate in peer-review sessions and revision cycles.'),
  ('05425ab9-5fc4-4dc0-8e71-5e5069f2428a', '07964d2f-2413-4b63-ac34-0ec546538320', 'Layout Designer', 'Design the journal''s print and digital layouts. Handle typesetting, image placement, and cover design in collaboration with editors.');

INSERT INTO recruitment_steps (society_id, step_order, title, description)
VALUES
  ('07964d2f-2413-4b63-ac34-0ec546538320', 1, 'Apply', 'Submit the application along with a short writing sample (any genre).'),
  ('07964d2f-2413-4b63-ac34-0ec546538320', 2, 'Editorial review', 'Current editors review samples and application responses.'),
  ('07964d2f-2413-4b63-ac34-0ec546538320', 3, 'Workshop trial', 'Shortlisted applicants join a live workshop session to give and receive feedback.'),
  ('07964d2f-2413-4b63-ac34-0ec546538320', 4, 'Results', 'Accepted members are notified by email within a week.');

