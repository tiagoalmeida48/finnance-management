# PRD - Finnance Management

## 1. Visao do Produto

Finnance Management e uma aplicacao web para controle financeiro pessoal. O produto centraliza contas, transacoes, cartoes de credito, faturas, categorias, acompanhamento mensal, simulacao salarial e administracao de usuarios.

O foco do produto e dar ao usuario uma leitura rapida de quanto dinheiro possui, quanto deve, quais contas estao pendentes e como seus gastos se distribuem ao longo do tempo.

## 2. Objetivos

- Consolidar saldos, receitas, despesas e limite de cartao em uma visao unica.
- Reduzir erro manual com transacoes em lote, importacao CSV e integracao Pluggy.
- Controlar parcelas, recorrencias e faturas de cartao com historico de ciclos.
- Isolar dados financeiros por usuario usando Supabase Auth e RLS.
- Dar suporte a gestao administrativa de usuarios.
- Manter uma experiencia visual escura, densa e orientada a produtividade.

## 3. Usuarios

### Usuario principal

Pessoa que organiza financas pessoais em uma interface web, com volume relevante de transacoes, cartoes e contas recorrentes.

Necessidades:

- ver saldo total e despesas do periodo;
- cadastrar e revisar transacoes rapidamente;
- entender faturas atuais e futuras;
- acompanhar contas fixas;
- importar ou sincronizar movimentacoes.

### Usuario administrador

Usuario com `profile.is_admin = true`.

Necessidades:

- listar usuarios;
- criar, editar, redefinir senha e remover usuarios;
- acessar rotas restritas de administracao.

## 4. Funcionalidades Atuais

### 4.1 Autenticacao

- Login com Supabase Auth.
- Sessao persistente.
- Rotas protegidas para usuario autenticado.
- Rota admin protegida por `is_admin`.
- `/auth/register` redireciona para login; nao ha pagina dedicada de cadastro neste estado do codigo.

### 4.2 Dashboard

- Cards de resumo financeiro.
- Filtro de periodo.
- Grafico de fluxo de caixa.
- Grafico de categorias.
- Lista de transacoes recentes.
- Botao/fluxo Pluggy para buscar previa de transacoes e confirmar importacao.

### 4.3 Contas

- Listagem de contas.
- Criacao, edicao e exclusao logica.
- Saldo inicial e saldo atual.
- Tipo, cor e icone.
- Campo `pluggy_account_id` para vinculo com integracao Pluggy.

### 4.4 Categorias

- CRUD de categorias.
- Tipo `income` ou `expense`.
- Cor e icone.
- Exclusao logica.

### 4.5 Transacoes

- Receitas, despesas e transferencias.
- Datas de pagamento e compra.
- Conta, conta destino, cartao e categoria.
- Parcelas por `installment_group_id`.
- Recorrencias por `recurring_group_id`.
- Marcacao de pago/nao pago.
- Acoes em lote: pagar, desfazer pagamento, excluir e alterar dia.
- Filtros, paginacao, selecao e resumo.
- Importacao CSV com preview.
- Importacao/sincronizacao Pluggy com revisao antes de gravar.

### 4.6 Cartoes de Credito

- CRUD de cartoes.
- Limite, cor, conta bancaria vinculada e notas.
- Ciclos de fechamento/vencimento em `credit_card_statement_cycles`.
- Detalhe do cartao com estatisticas, faturas, transacoes e historico de ciclos.
- Reprocessamento de faturas quando ciclos mudam.

### 4.7 Faturas

- Faturas por cartao e mes (`month_key`).
- Valores total e pago.
- Status `open`, `closed`, `partial`, `paid` e/ou estados definidos em migration.
- Reconciliacao por RPC.
- Pagamento de fatura pelo fluxo de cartao.

### 4.8 Acompanhamento Mensal

- Visualizacao mensal de itens financeiros.
- Progresso e pendencias.
- Modal de pagamento.

### 4.9 Simulador Salarial

- Configuracoes salariais por periodo.
- Historico, criacao, edicao, fechamento, reabertura e exclusao.
- Calculos puros de folha no frontend.
- Lancamento financeiro a partir do resultado.

### 4.10 Perfil

- Exibicao e edicao de dados pessoais suportados pelo perfil.
- Atualizacao via RPC `upsert_profile`.

### 4.11 Administracao de Usuarios

- Listagem de usuarios.
- Criacao de usuario.
- Edicao de usuario.
- Alteracao de senha.
- Exclusao de usuario.
- Acesso restrito via `AdminRoute`.

## 5. Requisitos Nao Funcionais

- Segurança: todo dado sensivel deve ser isolado por usuario.
- Backend: operacoes com regra de negocio devem preferir RPCs com filtro por `auth.uid()`.
- Frontend: paginas devem usar lazy loading.
- Estado remoto: React Query deve centralizar cache e invalidacao.
- Validacao: entradas de formulario devem passar por Zod/React Hook Form quando aplicavel.
- UI: usar tokens globais de `src/App.css` e componentes compartilhados.

## 6. Fora do Escopo Atual

- Aplicativo mobile nativo.
- Exportacao formal de relatorios PDF/Excel.
- Cadastro publico completo em pagina separada.
- Open Finance completo; ha integracao Pluggy especifica.
- Previsao financeira com IA.
- Suite automatizada de testes, removida no estado atual do projeto.

## 7. Metricas de Sucesso

- Frequencia de uso semanal.
- Quantidade de transacoes cadastradas/importadas.
- Percentual de transacoes categorizadas.
- Reducao de faturas/transacoes pendentes sem revisao.
- Uso da importacao CSV e Pluggy.
- Tempo percebido para abrir dashboard e transacoes.
