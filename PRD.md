# PRD - Sistema de Finanças Pessoais

## 1. VISÃO DO PRODUTO
O Sistema de Finanças Pessoais é uma plataforma web robusta e intuitiva projetada para ajudar indivíduos a gerenciarem sua saúde financeira de ponta a ponta. A aplicação permite o controle rigoroso de contas bancárias, cartões de crédito, transações recorrentes e parceladas, tudo em um ambiente seguro e multiusuário.

## 2. OBJETIVOS DE NEGÓCIO
- Proporcionar uma visão clara e consolidada de todos os saldos e dívidas do usuário.
- Automatizar o acompanhamento de contas recorrentes para evitar esquecimentos e juros.
- Facilitar a análise de padrões de consumo através de categorização e dashboards visuais.
- Garantir a privacidade absoluta dos dados financeiros através de isolamento por usuário.

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
- **Comportamento:** Visual, valoriza gráficos coloridos e facilidade de exportação de dados.

## 4. FUNCIONALIDADES CORE

### 4.1 Autenticação (Supabase Auth)
**Descrição:**
Sistema de login e registro usando Supabase Auth nativo.

**Requisitos:**
- Login com email/senha.
- Login com Google (OAuth).
- Recuperação de senha via email.
- Verificação de email para novos cadastros.
- Sessão persistente (Refresh Token).

**Fluxo do usuário:**
1. Usuário acessa a URL raiz.
2. Se não autenticado, redireciona para `/auth/login`.
3. Usuário faz login ou escolhe "Criar Conta".
4. Após sucesso, redireciona para o `/dashboard`.

### 4.2 Gestão de Contas Bancárias
**Descrição:**
Controle de diferentes fontes de dinheiro (Corrente, Poupança, Carteira, Investimentos).

**Requisitos:**
- Cadastro de conta com nome, tipo, banco e saldo inicial.
- Edição de saldos manuais (se necessário).
- Desativação de contas sem excluir histórico.

**Campos:**
- Nome: String (Ex: "Itaú Corrente").
- Tipo: Enum (checking, savings, investment, wallet, other).
- Saldo Inicial: Decimal.
- Banco: String/Ícone.

**Fluxo do usuário:**
1. Acessa menu "Contas".
2. Clica em "Adicionar Conta".
3. Preenche formulário e salva.
4. Visualiza o novo saldo no balanço geral.

### 4.3 Gestão de Cartões de Crédito
**Descrição:**
Acompanhamento detalhado de limites e faturas.

**Requisitos:**
- Cadastro de limite total.
- Definição de dia de fechamento e dia de vencimento.
- Cálculo automático de limite disponível baseado em transações pendentes/parceladas.

**Campos:**
- Nome: String (Ex: "Nubank Platinum").
- Limite: Decimal.
- Dia de Fechamento: Integer (1-31).
- Dia de Vencimento: Integer (1-31).

### 4.4 Gestão de Categorias
**Descrição:**
Organização hierárquica para receitas e despesas.

**Requisitos:**
- Categorias padrão do sistema (Alimentação, Lazer, Moradia, etc).
- Possibilidade de criar categorias personalizadas por usuário.
- Atribuição de cores e ícones.

### 4.5 Gestão de Transações
**Descrição:**
Lançamento de entradas, saídas e transferências entre contas.

**Tipos de transação:**
- **Receita (entrada):** Aumenta o saldo da conta destino.
- **Despesa (saída):** Diminui o saldo da conta ou ocupa limite do cartão.
- **Transferência:** Movimenta valores entre duas contas diferentes (uma sai, outra entra).

### 4.6 Pagamentos Recorrentes e Parcelas
**Descrição:**
Gestão de gastos fixos mensais (Aluguel, Netflix) e compras parceladas (iPhone em 10x).

**Requisitos:**
- Gerar automaticamente transações futuras baseadas na recorrência.
- Visualizar projeção de gastos para os próximos meses.
- Marcar como "pago" individualmente para efetivar no saldo.

### 4.7 Dashboard e Relatórios
**Descrição:**
Central de comando visual com indicadores rápidos.

**Indicadores:**
- Saldo Total (Soma de todas as contas).
- Receitas do Mês (Entradas efetivadas).
- Despesas do Mês (Saídas + Faturas de cartão).
- Balanço Mensal (Receita - Despesa).

**Gráficos:**
- Evolução de Receitas vs Despesas (Linha ou Barra).
- Gastos por Categoria (Pizza/Donut).
- Fluxo de Caixa Diário.

## 5. REQUISITOS NÃO-FUNCIONAIS
- **Performance:** Painel inicial deve carregar em < 1s; ações CRUD instantâneas com feedback visual.
- **Segurança:** Isolamento rigoroso via RLS por `user_id`; senhas criptografadas via Supabase.
- **Responsividade:** Layout Mobile-first; menus colapsáveis em desktop; tabelas scrolláveis em telas pequenas.
- **Acessibilidade:** Contraste adequado (WCAG 2.1 AA); suporte a navegação por teclado nos formulários.

## 6. FORA DO ESCOPO V1
❌ Conciliação bancária automática (importação via OFX/API).
❌ Gestão de carteira de ações e dividendos (cripto/bolsa).
❌ Análise preditiva baseada em IA para sugestão de economia.

## 7. ONBOARDING
**Fluxo:**
1. Criar conta (Register).
2. Cadastrar a primeira conta bancária (pode ser o "Saldo Inicial").
3. Sugestão de cadastrar cartões de crédito comuns.
4. Primeiro tour guiado pelo Dashboard vazio.

**Checklist de Primeiros Passos:**
- [ ] Criar primeira conta bancária.
- [ ] Cadastrar categorias de interesse.
- [ ] Registrar primeira transação (Ex: Salário ou Aluguel).
- [ ] Configurar um pagamento recorrente.

## 8. MÉTRICAS DE SUCESSO
- **WUA (Weekly Unique Users):** Usuários ativos pelo menos uma vez por semana.
- **Stickiness:** Frequência de lançamentos diários vs mensais.
- **Data Quality:** Média de transações categorizadas vs "Sem Categoria".
