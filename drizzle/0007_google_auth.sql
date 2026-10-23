CREATE TABLE oauth_identities (provider TEXT NOT NULL, subject TEXT NOT NULL, user_id TEXT NOT NULL REFERENCES auth_accounts(user_id) ON DELETE CASCADE, PRIMARY KEY(provider,subject));
CREATE TABLE oauth_states (state_hash TEXT PRIMARY KEY, verifier TEXT NOT NULL, nonce TEXT NOT NULL, return_to TEXT NOT NULL, expires_at INTEGER NOT NULL);
