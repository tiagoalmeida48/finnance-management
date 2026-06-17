# 09 — Mapa de Migração, Gaps e Decisões Pendentes (.NET Core)

> Consolida o que precisa virar código .NET, o que está faltando recuperar do cloud, e as decisões que devem ser tomadas **antes** da fase de design/implementação. Este documento NÃO é uma arquitetura — é o índice de migração derivado das regras de negócio.
>
> ✅ **Atualizado após verificação contra o banco cloud real (2026-06-17).** Todos os gaps da §2 foram fechados. Ver o diff completo em `10-db-verification-report.md`.

---

## 1. Inventário RPC/Função → Endpoint .NET proposto

> Endpoints são sugestões de mapeamento, não a API final. A lógica de cada um está nos docs 02–08.

### Transações
| RPC atual | Endpoint .NET sugerido | Regras |
|---|---|---|
| `create_transaction` | `POST /api/transactions` | TX-01..06 |
| `update_transaction` | `PUT /api/transactions/{id}` | TX-07..11 |
| `delete_transaction` | `DELETE /api/transactions/{id}` | TX-12 |
| `batch_pay_transactions` | `POST /api/transactions/batch/pay` | TX-14 |
| `batch_unpay_transactions` | `POST /api/transactions/batch/unpay` | TX-15 |
| `batch_delete_transactions` | `POST /api/transactions/batch/delete` | TX-16 |
| `batch_change_day` | `POST /api/transactions/batch/change-day` | TX-17 |
| `insert_transactions` | `POST /api/transactions/bulk` | TX-19 |
| `delete_transaction_group` | `DELETE /api/transactions/groups/{groupId}?type=` | TX-20 |
| `update_transaction_group` | `PUT /api/transactions/groups/{groupId}?type=` | TX-21/22 |
| `insert_installment_between` | `POST /api/transactions/{id}/insert-installment` | TX-23 |
| `get_transactions_paginated` | `GET /api/transactions` | TX-24 |
| `get_transactions_summaries` | `GET /api/transactions/summaries` | TX-25 |
| `get_transaction_by_id` | `GET /api/transactions/{id}` | TX-26 |
| `get_transactions_by_ids` | `GET /api/transactions?ids=` | TX-27 |
| `get_first_transaction_date` | `GET /api/transactions/first-date` | TX-28 |

### Cartões / Ciclos / Faturas
| RPC atual | Endpoint .NET sugerido | Regras |
|---|---|---|
| `create_card` (+ ciclo) | `POST /api/credit-cards` | RC-01 |
| `update_card` | `PUT /api/credit-cards/{id}` | RC-02 |
| `delete_card` | `DELETE /api/credit-cards/{id}` | RC-03 |
| `get_cards` / view | `GET /api/credit-cards` | RC-04 |
| `get_card_by_id` | `GET /api/credit-cards/{id}` | — |
| `get_cycles_by_card` | `GET /api/credit-cards/{id}/cycles` | RC-05 |
| `create_credit_card_statement_cycle` ⚠️ | `POST /api/credit-cards/{id}/cycles` | RC-06 |
| `update_cycle` | `PUT /api/cycles/{id}` | RC-07 |
| `update_cycle_date_start/end` | (interno) | RC-08 |
| `delete_cycle` | `DELETE /api/cycles/{id}` | RC-09 |
| `recalculate_invoice_total` | (serviço interno) | RC-ALG-02 |
| `reprocess_invoices_for_card` | `POST /api/credit-cards/{id}/reprocess-invoices` | RC-11 |
| `get_invoices_by_card` | `GET /api/credit-cards/{id}/invoices` | RC-12 |
| `get_invoice_by_month` | `GET /api/credit-cards/{id}/invoices/{monthKey}` | RC-13 |
| `get_all_card_stats` | `GET /api/credit-cards/stats` | RC-15 |
| `get_card_stats` | `GET /api/credit-cards/{id}/stats` | RC-16 |
| (trigger) `trg_link_transaction_to_invoice` | (serviço interno) | RC-ALG-01 |

### Contas
| RPC | Endpoint | Regras |
|---|---|---|
| `get_accounts` | `GET /api/accounts` | AC-04 |
| `create_account` | `POST /api/accounts` | AC-01 |
| `update_account` | `PUT /api/accounts/{id}` | AC-02 |
| `delete_account` | `DELETE /api/accounts/{id}` | AC-03 |
| `increment_account_balance` ⚠️ | (interno/ajuste) | AC-05 |
| (trigger) `trg_sync_account_balance` | (serviço interno) | AC-ALG-01 |

### Categorias
| RPC | Endpoint |
|---|---|
| `get_categories` | `GET /api/categories` |
| `create_category` | `POST /api/categories` |
| `update_category` | `PUT /api/categories/{id}` |
| `delete_category` (soft) | `DELETE /api/categories/{id}` |

### Salário
| RPC | Endpoint | Regras |
|---|---|---|
| `get_salary_history` | `GET /api/salary-settings` | SAL |
| `get_salary_current` | `GET /api/salary-settings/current` | |
| `get_salary_open` | `GET /api/salary-settings/open` | |
| `create_salary_setting` (+validade) | `POST /api/salary-settings` | SAL-01/02 |
| `update_salary_setting` | `PUT /api/salary-settings` | SAL-03 |
| `close/reopen/delete_salary_setting` | endpoints/serviço | SAL-04 |
| (cálculo payroll) | front ou `POST /api/payroll/simulate` | SAL-ALG-01 |

### Dashboard
| RPC | Endpoint | Regras |
|---|---|---|
| `get_dashboard_stats` | `GET /api/dashboard/stats` | DS-01 |
| `get_chart_data` | `GET /api/dashboard/charts` | DS-02 |
| `get_category_distribution` | `GET /api/dashboard/categories` | DS-03 |

### Auth / Admin / Config
| RPC | Endpoint | Regras |
|---|---|---|
| `get_profile` | `GET /api/auth/me` | AU-05 |
| `upsert_profile` | `PUT /api/profile` | AU-06 |
| `admin_list_users` | `GET /api/admin/users` | AD-01 |
| `admin_create_user` | `POST /api/admin/users` | AD-02 |
| `admin_update_user` | `PUT /api/admin/users/{id}` | AD-03 |
| `admin_update_user_password` | `PUT /api/admin/users/{id}/password` | AD-04 |
| `admin_delete_user` | `DELETE /api/admin/users/{id}` | AD-05 |
| `is_current_user_admin` ⚠️ | (policy/serviço) | — |
| `get_system_config` | `GET /api/config/{key}` | — |

### Integrações
| Origem | Endpoint | Regras |
|---|---|---|
| Edge `pluggy-token` | `POST /api/pluggy/token` | PL-01 |
| Edge `pluggy-sync` | `POST /api/pluggy/sync/preview` | PL-02..04 |
| commit client / `commit_pluggy_transactions` | `POST /api/pluggy/sync/commit` | PL-05 |
| import CSV | client + `insert_transactions` ou `POST /api/transactions/import` | IM-* |

---

## 2. ✅ Gaps do cloud — TODOS FECHADOS (2026-06-17)

Verificação completa feita via MCP do Supabase. Resultado (detalhe no doc 10):

1. ✅ `is_current_user_admin()` + `is_admin(uuid)` — confirmadas.
2. ✅ `increment_account_balance` — confirmada (**não filtra user_id**; ver doc 04 AC-05).
3. ✅ `create_credit_card_statement_cycle` — confirmada (faz split de ciclo no servidor).
4. ✅ `commit_pluggy_transactions` — confirmada.
5. ✅ `pluggy_items` — existe (DDL no doc 01 §1.12).
6. ✅ Status `closed`/`overdue` — **nenhuma função os produz**; só open/partial/paid existem na prática. Decidir se implementa (job de vencimento) ou descarta.
7. ✅ `pluggy_account_id` em `bank_accounts` — existe.
8. ✅ `v_credit_cards_with_cycles` — definição real confirmada (doc 01 §4.1).

➕ **Descobertas extras:** trigger `on_auth_user_created`/`handle_new_user` (cria perfil), `set_updated_at` (várias tabelas), `get_installment_group_summary`, trigger de não-sobreposição de ciclos, índice de 1-vigência-aberta, bucket de storage `avatars`, e a função **morta** `sync_credit_card_cycle_days` (não portar).

> **Pendente apenas o plano de DADOS** (não schema): exportar `transactions`, `pluggy_items`, conteúdo do bucket `avatars`, e usuários de `auth.users` (com hashes bcrypt).

---

## 3. Algoritmos críticos a portar com testes (maior risco de regressão)

| ID | Algoritmo | Doc | Por que é arriscado |
|---|---|---|---|
| **RC-ALG-01** | Vinculação transação→fatura (month shift) | 03 §4 | Lógica de calendário; bordas (dia de fechamento, closing==due, meses curtos) |
| **RC-ALG-02** | Recálculo de total/status de fatura | 03 §5 | income negativo no total; regra de status |
| **AC-ALG-01** | Sincronização de saldo (delta reverter/aplicar) | 04 §3 | Transfer 2 contas; toggle pago; mudança de conta |
| **SAL-ALG-01** | Cálculo de payroll | 05 §2 | Bases diferentes (INSS=base, admin=bruto); teto; sinais |
| **RC-ALG-03** | Plano de inserção de ciclo | 03 §6 | Validações de continuidade temporal |
| **TX (grupos)** | Shift de parcelas / regen de sufixo | 02 §8 | Ordem de operações; preservar mês/ano trocando só o dia |

Recomendação: extrair cada um como **serviço puro/sem I/O** + suite de testes unitários que reproduza os casos da spec, antes de plugar no banco. Os 3 testes existentes do projeto (card-statement-cycle, payroll-calculations, transactionsGroup) são ponto de partida — portá-los para xUnit.

---

## 4. Regras transversais a garantir na plataforma .NET

| Regra | Implementação sugerida |
|---|---|
| RT-01 Multi-tenancy | EF Core global query filter por `UserId` + checagem de ownership em mutações; nunca confiar em ID do cliente |
| RT-02 Soft-delete | Global query filter `deleted_at IS NULL`; método `SoftDelete` |
| RT-03 Saldo derivado | `BalanceSyncService` em toda mutação de tx (mesma transação DB) |
| RT-04 Recálculo de fatura | Orquestração pós-mutação (fatura antiga + nova) |
| RT-05 Vinculação de fatura | `InvoiceLinkingService` em create/update com cartão |
| RT-06 Imutabilidade closing/due | Validação no `CardService.Update` |
| RT-07 Atomicidade | Transação DB explícita por operação composta |
| RT-08 Monetário | `decimal` + precisão `(15,2)` no EF Core |
| RT-09 amount > 0 | Validação DTO + CHECK |
| RT-10 Datas | `DateOnly` (negócio) / `DateTimeOffset` (auditoria) |
| RT-11 pt-BR | Mensagens de erro em português; cultura pt-BR |
| RT-12 Auditoria | Interceptor de `SaveChanges` → `audit_log` |

---

## 5. Decisões pendentes (precisam de definição do dono do projeto)

> Estas decisões mudam o desenho da implementação. Devem ser respondidas antes da fase de arquitetura. (Não fazem parte das regras de negócio — são escolhas de migração.)

1. **Banco:** manter **PostgreSQL** local (recomendado — preserva tipos `NUMERIC`, `UUID`, `JSONB`, constraints parciais, e permite reusar views/triggers) ou migrar para **SQL Server**?
2. **Lógica de negócio:** reimplementar tudo em **C#** (recomendado — testável, portável) ou **manter funções/triggers no Postgres** (menos reescrita, acopla ao banco)? Híbrido?
3. **Identidade:** **ASP.NET Core Identity** vs. **JWT próprio**. Como migrar usuários existentes (hashes bcrypt)?
4. **Commit Pluggy:** manter no cliente ou **mover para o servidor** (recomendado por segurança)? Unificar com `commit_pluggy_transactions`?
5. **Import CSV:** parse no cliente (atual) ou endpoint no servidor?
6. **Grupos (parcela/recorrência):** manter como colunas Guid (atual) ou promover a entidades próprias?
7. **Estratégia de saldo:** delta incremental (espelha o trigger) ou recálculo do zero por conta (mais robusto)?
8. **Hospedagem/runtime:** onde roda o .NET local? (desktop, container, serviço Windows?) — afeta config de secrets e deploy.

---

## 6. Próximos passos sugeridos (após aprovação desta spec)

1. ✅ ~~Fechar os gaps do cloud~~ — **CONCLUÍDO** (doc 10). Schema 100% verificado.
2. Decidir os 8 pontos da §5.
3. Produzir o documento de **arquitetura alvo .NET** (camadas, projetos, EF Core model, identidade, padrão de transação/serviço).
4. Definir o **plano de migração de dados** (export do Supabase → import no banco local), preservando IDs (Guids), saldos e vínculos de fatura.
5. Portar os algoritmos críticos (§3) como serviços + testes primeiro (TDD), depois CRUD e integrações.
6. Validar paridade com um conjunto de cenários de aceitação derivados dos IDs de regra desta spec.
