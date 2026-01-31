insert into users (username, password_hash, enabled)
values ('admin', '$2a$10$kQqJmLZf1QfZ5hXqv7uXlOQ4r5xjA1nN3X7vQ8sHn8gQJH7o0mQxS', true)
on conflict (username) do nothing;

insert into user_roles (user_id, role)
select u.id, 'ROLE_ADMIN' from users u where u.username = 'admin'
on conflict do nothing;

