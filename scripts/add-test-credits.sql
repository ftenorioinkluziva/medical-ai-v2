-- Script para adicionar créditos de teste a um usuário
-- Uso: psql $DATABASE_URL -f scripts/add-test-credits.sql

-- Primeiro, veja seus usuários
SELECT id, name, email FROM users LIMIT 5;

-- Substitua USER_ID_HERE pelo ID do seu usuário
-- Exemplo de adição de 1000 créditos de teste:

-- 1. Criar/atualizar registro de créditos
INSERT INTO user_credits (id, user_id, balance, total_purchased, total_used)
VALUES (gen_random_uuid(), 'USER_ID_HERE', 1000, 1000, 0)
ON CONFLICT (user_id)
DO UPDATE SET
  balance = user_credits.balance + 1000,
  total_purchased = user_credits.total_purchased + 1000;

-- 2. Criar transação de compra
INSERT INTO credit_transactions (id, user_id, type, amount, balance_after, description, metadata)
SELECT
  gen_random_uuid(),
  'USER_ID_HERE',
  'admin_adjustment',
  1000,
  (SELECT balance FROM user_credits WHERE user_id = 'USER_ID_HERE'),
  'Créditos de teste adicionados manualmente',
  '{"test": true, "reason": "manual_testing"}';
