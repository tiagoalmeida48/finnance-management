# PRD - Sistema de Finanças Pessoais (Finnance)

## 1. VISÃO DO PRODUTO
O Finnance é uma plataforma web para gestão financeira pessoal. Permite controle de contas bancárias, cartões de crédito com ciclos de fatura, transações manuais e por importação CSV, acompanhamento mensal de contas, simulação de salário/holerite, e gestão administrativa de usuários. Focado em uma experiência premium com modo escuro e design ultra-moderno.

## 2. OBJETIVOS DE NEGÓCIO
- Proporcionar uma visão clara e consolidada de todos os saldos e dívidas do usuário.
- Automatizar o acompanhamento de contas recorrentes e parcelas para evitar esquecimentos.
- Facilitar a análise de padrões de consumo através de categorização e dashboards visuais.
- Garantir a privacidade absoluta dos dados financeiros através de isolamento por usuário (RLS).
- Permitir importação em lote de transações via CSV para maior agilidade.
- Oferecer ferramentas de planejamento como simulação de salário/holerite.

## 3. PERSONAS

### Persona Principal
- **Nome:** Carlos Eduardo
- **Perfil:** 32 anos, analista de sistemas, mora sozinho em um apartamento alugado.
- **Dores:** Dificuldade em controlar os gastos no cartão de crédito e frequentemente se perde no valor total das parcelas futuras.
- **Necessidades:** Precisa de um lugar único para ver quanto dinheiro tem sobrando após as contas fixas e quanto de limite ainda tem nos seus 3 cartões.
- **Comportamento:** Técnico, prefere interface limpa em modo escuro, utiliza a web para lançamentos pesados e o celular para conferência rápida.

### Persona Secundária
- **Nome:** Maria Clara
- **Perfil:** 28 anos, profissional autônoma (designer).
- **Dores:** Renda variável que dificulta o planejamento mensal e mistura ocasional de gastos pessoais com pequenos gastos de trabalho.
- **Necessidades:** Categorização detalhada para entender onde pode cortar custos em meses de baixa receita.
- **Comportamento:** Visual, valoriza gráficos coloridos e facilidade de importação de dados.

## 4. FUNCIONALIDADES

### 4.1 Autenticação (Supabase Auth)
Sistema de login e registro usando Supabase Auth nativo.

- Login com email/senha.
- Login com Google (OAuth).
- Recuperação de senha via email.
- Sessão persistente (Refresh Token).
- Perfil de usuário com avatar, nome e preferências.

**Fluxo:**
1. Usuário acessa a URL raiz.
2. Se não autenticado, redireciona para `/auth/login`.
3. Após login, redireciona para `/dashboard`.

### 4.2 Gestão de Contas Bancárias
Controle de diferentes fontes de dinheiro (Corrente, Poupança, Investimento, Carteira, Outros).

- Cadastro de conta com nome, tipo, banco, saldo inicial e cor.
- Cálculo automático de saldo corrente baseado nas transações.
- Desativação de contas sem excluir histórico (soft delete).

### 4.3 Gestão de Cartões de Crédito
Acompanhamento detalhado de limites e faturas com ciclos de faturamento.

- Cadastro de limite total, dia de fechamento e dia de vencimento.
- Vinculação com conta bancária para pagamento da fatura.
- Cálculo automático de limite disponível, fatura corrente e utilização.
- Ciclos de faturamento (Statement Cycles) com períodos de vigência.
- Ranges de período de fatura para cálculos precisos.
- Página de detalhes com histórico de faturas por mês, gráficos de categoria e evolução.

### 4.4 Gestão de Categorias
Organização de receitas e despesas por categorias.

- Categorias com tipo (receita/despesa), cor e ícone.
- CRUD completo com soft delete.

### 4.5 Gestão de Transações
Lançamento de entradas, saídas e transferências entre contas.

**Tipos de transação:**
- **Receita (income):** Aumenta o saldo da conta destino.
- **Despesa (expense):** Diminui o saldo da conta ou ocupa limite do cartão.
- **Transferência (transfer):** Movimenta valores entre duas contas diferentes.

**Funcionalidades:**
- Forma de pagamento: conta bancária, cartão de crédito ou manual.
- Parcelamento com agrupamento por `installment_group_id`.
- Transações recorrentes com agrupamento por `recurring_group_id`.
- Marcação de pagamento (pago/não pago).
- Data de compra e data de pagamento separadas.
- Filtros por período, tipo, categoria, conta e cartão.

### 4.6 Importação de Transações via CSV
Importação em lote de transações através de arquivo CSV.

- Upload e preview dos dados antes da importação.
- Filtros globais de forma de pagamento, conta e cartão aplicados a todos os registros.
- Suporte a coluna de parcelas (formato `N` ou `A-B`).
- Template CSV para download.
- Validações visuais de valor, data e formato.

### 4.7 Dashboard
Central de comando visual com indicadores rápidos.

**Indicadores:**
- Saldo Total (soma de todas as contas).
- Receitas do Período (entradas no período selecionado).
- Despesas do Período (saídas + faturas de cartão).
- Balanço (receita - despesa).

**Gráficos:**
- Evolução de Receitas vs Despesas (Barra) — verde para receitas, vermelho para despesas.
- Gastos por Categoria (Donut Chart com label central).
- Filtro por período com seletor global.
- Filtro "Geral" como padrão.

### 4.8 Acompanhamento Mensal (Tracking)
Monitoramento de contas fixas e recorrentes mês a mês.

- Visualização de contas por mês com totais mensais em cada card.
- Acompanhamento de pagamentos pendentes.

### 4.9 Simulador de Salário/Holerite
Ferramenta de planejamento financeiro para trabalhadores.

- Cadastro de configurações salariais por período (data início/fim).
- Parâmetros: salário base, valor/hora, desconto INSS, taxa administrativa.
- Cálculo de rendimentos e deduções.
- Histórico de configurações.

### 4.10 Perfil do Usuário
Gestão do perfil pessoal do usuário autenticado.

- Upload de avatar.
- Edição de nome, moeda e locale.
- Visualização de informações da conta.

### 4.11 Gestão de Usuários (Admin)
Painel administrativo para gerenciar usuários do sistema.

- Listagem de todos os usuários.
- Acesso restrito via campo `is_admin` no perfil.
- Rota protegida por `AdminRoute`.

## 5. REQUISITOS NÃO-FUNCIONAIS
- **Performance:** Painel deve carregar em < 1s; code-splitting com lazy loading em todas as páginas.
- **Segurança:** Isolamento rigoroso via RLS por `user_id`; rota de admin protegida por guard.
- **Responsividade:** Layout adaptável para desktop; menus colapsáveis; tabelas scrolláveis.
- **Acessibilidade:** Contraste adequado (WCAG 2.1 AA); suporte a navegação por teclado.

## 6. FORA DO ESCOPO
❌ Conciliação bancária automática via API de bancos (Open Finance).
❌ Gestão de carteira de ações, criptomoedas e dividendos.
❌ Análise preditiva baseada em IA para sugestão de economia.
❌ Aplicativo mobile nativo (iOS/Android).
❌ Exportação de relatórios em PDF/Excel.

## 7. MÉTRICAS DE SUCESSO
- **WUA (Weekly Unique Users):** Usuários ativos pelo menos uma vez por semana.
- **Stickiness:** Frequência de lançamentos diários vs mensais.
- **Data Quality:** Média de transações categorizadas vs "Sem Categoria".
- **CSV Adoption:** Percentual de transações criadas via importação.
