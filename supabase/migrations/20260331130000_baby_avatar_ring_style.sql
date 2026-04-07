alter table public.babies
  add column if not exists avatar_ring_style smallint not null default 0;

comment on column public.babies.avatar_ring_style is '0–4: avatar frame / ring preset';
