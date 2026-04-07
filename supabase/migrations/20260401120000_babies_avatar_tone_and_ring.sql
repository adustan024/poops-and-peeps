alter table public.babies
  add column if not exists avatar_emoji_tone smallint not null default 0;

alter table public.babies
  add column if not exists avatar_ring_style smallint not null default 0;

comment on column public.babies.avatar_emoji_tone is '0 default baby emoji, 1-5 Fitzpatrick skin-tone variants';
comment on column public.babies.avatar_ring_style is '0–4: avatar frame / ring preset';

notify pgrst, 'reload schema';
