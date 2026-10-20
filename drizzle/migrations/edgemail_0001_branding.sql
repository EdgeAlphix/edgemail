UPDATE app_settings
SET app_name = 'EdgeMail'
WHERE id = 'default' AND app_name = 'Mailflare' AND icon_key IS NULL;
