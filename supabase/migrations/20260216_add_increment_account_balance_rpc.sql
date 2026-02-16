CREATE OR REPLACE FUNCTION increment_account_balance(p_account_id UUID, p_amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE bank_accounts
  SET current_balance = COALESCE(current_balance, 0) + p_amount,
      updated_at = NOW()
  WHERE id = p_account_id;
END;
$$ LANGUAGE plpgsql;
