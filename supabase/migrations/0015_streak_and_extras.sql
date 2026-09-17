-- Sequência de dias seguidos entrando no site (streak), usada pra
-- mostrar "🔥 X dias seguidos!" — mecânica de hábito tipo Duolingo.
-- Os outros dois novos recursos (amigos em comum e "relembrando")
-- não precisam de coluna nova: são calculados em cima de dados que já
-- existem (amizades e recados/depoimentos já carregados na página).

alter table public.oldkut_profiles add column if not exists last_login_date date;
alter table public.oldkut_profiles add column if not exists login_streak integer not null default 0;
