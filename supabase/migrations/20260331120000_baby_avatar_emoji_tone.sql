alter table public.babies
  add column if not exists avatar_emoji_tone smallint not null default 0;

comment on column public.babies.avatar_emoji_tone is '0 default baby emoji, 1-5 Fitzpatrick skin-tone variants';
