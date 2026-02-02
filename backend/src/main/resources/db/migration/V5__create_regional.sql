create table if not exists regional (
    id bigserial primary key,
    external_id bigint not null,
    nome varchar(200) not null,
    ativo boolean not null default true,
    created_at timestamp default now()
);

create index if not exists idx_regional_external_id on regional(external_id);
create index if not exists idx_regional_ativo on regional(ativo);
