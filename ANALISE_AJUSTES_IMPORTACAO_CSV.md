# Analise de Ajustes - Importacao CSV e Parcelamento

## Analise das alteracoes feitas no arquivo
- A mudanca central foi no requisito de parcelamento com cartao: saiu a regra de "valor do grupo" e entrou a regra de "gerar GUID e preencher `installment_group_id`".
- O ponto de atencao foi alinhado com essa direcao.
- Havia uma inconsistencia no plano anterior: a parte de testes ainda citava distribuicao de valor total. Isso foi corrigido no plano atualizado abaixo.

## Escopo confirmado
1. Remover o componente e o arquivo `InstallmentGrid`.
2. No modal de importacao, usar seletores globais de forma de pagamento, conta e cartao.
3. Replicar as selecoes globais para todos os registros importados.
4. Atualizar o CSV:
- adicionar coluna `Parcelas`
- remover colunas `Forma de pagamento`, `Conta` e `Cartao`
- manter o modelo com cabecalho apenas, sem registros de exemplo
5. Implementar expansao da coluna `Parcelas`:
- `10` gera parcelas de `1` a `10`
- `8-10` gera parcelas de `8` a `10`
6. Se forma de pagamento for `credit`, ignorar `Data de pagamento` e `Conta de pagamento`.
7. Se for cartao com parcelamento acima de 1, gerar GUID e preencher `installment_group_id`.

## Arquivos impactados
- `src/shared/components/transactions/TransactionForm/InstallmentGrid.tsx` (remocao)
- `src/shared/components/transactions/TransactionForm/TransactionAdvancedSection.tsx`
- `src/shared/components/transactions/TransactionFormModal.tsx`
- `src/shared/hooks/useTransactionFormLogic.ts`
- `src/shared/components/transactions/ImportTransactionsModal.tsx`
- `src/shared/components/transactions/import/ImportTransactionsPreviewTable.tsx`
- `src/shared/components/transactions/import/importTransactions.types.ts`
- `src/shared/components/transactions/import/importTransactions.utils.ts`
- `tests/importTransactions.utils.test.ts`

## Plano atualizado de implementacao
1. Remocao do InstallmentGrid
- Excluir `InstallmentGrid.tsx`.
- Remover importacao e uso em `TransactionAdvancedSection`.
- Limpar props/estado relacionados em `TransactionFormModal` e `useTransactionFormLogic`.

2. Estrutura de dados do import
- Atualizar `FileData` para o novo layout de CSV com a coluna `Parcelas`.
- Remover campos de tipo relacionados a `Forma de pagamento`, `Conta` e `Cartao` vindos do CSV.
- Adicionar utilitario para parse de parcelas (`N` e `A-B`).

3. Filtros globais no modal de importacao
- Criar estado global para `paymentMethod`, `accountId` e `cardId`.
- Aplicar esses filtros na etapa de mapeamento para todos os registros.
- Ao trocar para `credit`, habilitar selecao de cartao e aplicar regra de ignorar `Data de pagamento` e `Conta de pagamento`.

4. Regras de expansao por parcelas
- Expandir cada linha do CSV em multiplas transacoes conforme `Parcelas`.
- Preencher `installment_number` e `total_installments` para registros expandidos.
- Em parcelamento de cartao com mais de 1 parcela, gerar `crypto.randomUUID()` e preencher `installment_group_id` igual para as parcelas do mesmo grupo.

5. Template CSV
- Atualizar `handleDownloadTemplate` para gerar somente cabecalho.
- Cabecalho final deve conter apenas as colunas do novo formato.

6. Preview da importacao
- Ajustar a tabela para mostrar o novo formato (incluindo `Parcelas`).
- Remover edicao por linha de metodo/conta/cartao, pois o controle passa a ser global.
- Manter validacoes visuais para valor, data, entidade e formato de parcelas.

7. Testes
- Manter testes existentes de data, valor e tipo.
- Adicionar testes para parse da coluna `Parcelas` com casos validos e invalidos.
- Adicionar testes para geracao de grupo de parcelas (`installment_group_id`) no fluxo de cartao parcelado.

## Criterios de aceite
- O projeto compila sem referencias ao `InstallmentGrid`.
- O import aceita somente o novo formato de CSV.
- Os filtros globais sao aplicados a todos os itens importados.
- A coluna `Parcelas` expande corretamente os registros.
- Em cartao parcelado, os itens do mesmo grupo compartilham `installment_group_id`.
- O template CSV baixa apenas com cabecalho.
