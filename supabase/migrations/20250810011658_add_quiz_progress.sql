create table if not exists quiz_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lecture int not null,
  score int not null,
  passed boolean not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, lecture)
);

alter table quiz_progress enable row level security;

create policy "read own"   on quiz_progress for select using (auth.uid() = user_id);
create policy "write own"  on quiz_progress for insert with check (auth.uid() = user_id);
create policy "update own" on quiz_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
