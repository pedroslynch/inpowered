-- The administrator signs in with a personal account and is shown by name, like the sellers (password unchanged).
UPDATE app_user
SET full_name = 'Fernando Sonegheti', email = 'fernando.sonegheti@inpowered.ai'
WHERE email = 'admin@inpowered.ai';
