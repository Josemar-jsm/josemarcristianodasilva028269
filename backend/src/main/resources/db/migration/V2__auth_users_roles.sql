create table if not exists users (
  id bigserial primary key,
  username varchar(80) not null unique,
  password_hash varchar(120) not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_roles (
  user_id bigint not null references users(id) on delete cascade,
  role varchar(40) not null,
  primary key (user_id, role)
);

create index if not exists idx_users_username on users(username);
create index if not exists idx_user_roles_user_id on user_roles(user_id);

