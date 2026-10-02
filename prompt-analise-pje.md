# Prompt de Comando — Análise Completa do PJe e Geração de Planilha de Processos e Prazos

> Cole este prompt em uma conversa comigo (com o **Claude em Chrome** conectado e você já autenticado no PJe) para eu executar a análise e montar a planilha automaticamente.

---

## 1. Contexto e papel

Você é meu assistente jurídico de gestão processual. Tenho acesso ao PJe através do navegador (já estou autenticado — **não insira nenhuma credencial**, apenas leia as páginas). Seu trabalho é varrer todo o meu painel de processos, extrair os dados abaixo e consolidar tudo em uma planilha Excel com design profissional.

## 2. Objetivo

1. Mapear **todos os processos** vinculados ao meu perfil no PJe (painel do advogado / "Meus processos" / "Acervo").
2. Extrair os **prazos processuais em aberto** (painel de "Prazos" / "Expedientes" / "Intimações pendentes").
3. Consolidar tudo em **uma única planilha .xlsx**, com abas separadas, formatação condicional e visual sofisticado.

## 3. Escopo de navegação

- Acessar o painel principal do PJe de cada tribunal (ex.: PJe-TJDFT, PJe-JT/TRT10, PJe-TRF1), repetindo a varredura em cada portal, já que login e acervo são independentes entre tribunais.
- Percorrer as listagens paginadas até cobrir **100% dos processos ativos** (não parar na primeira página).
- Abrir cada processo apenas o suficiente para capturar os campos da seção 4 — evitar ações que alterem o processo (nunca peticionar, assinar ou submeter nada).
- Se algum processo exigir login adicional, CAPTCHA ou 2FA, **pare e me avise** em vez de tentar contornar.
- Verificar também o painel de **2º Grau** do PJe (recursos, apelações, agravos, embargos de declaração, agravos de instrumento), incluindo tanto os recursos vinculados a processos já mapeados no 1º grau quanto eventuais processos que tramitem de forma autônoma na instância recursal.

## 4. Campos a extrair por processo

| Campo | Detalhe |
|---|---|
| Número CNJ | Número completo do processo |
| Tribunal / Vara / Juízo | Órgão julgador |
| Classe judicial | Ex.: Execução, Ação de Cobrança, Reclamação Trabalhista |
| Polo ativo | Nome da(s) parte(s) autora(s) |
| Polo passivo | Nome da(s) parte(s) ré(s) |
| Advogados envolvidos | Meu nome/OAB e advogados da parte contrária |
| Valor da causa | Se disponível |
| Fase/situação atual | Ex.: em instrução, aguardando sentença, em execução |
| Data de distribuição | — |
| Última movimentação | Data + resumo da movimentação mais recente |
| Prazo em aberto | Tipo (contestação, recurso, cumprimento, manifestação etc.) |
| Início e término do prazo | Data de início da contagem e data fatal |
| Dias restantes | Calculado a partir da data de hoje |
| Próxima audiência | Data, tipo (una, instrução, conciliação) e modalidade (presencial/virtual) |

### 4.1 Campos adicionais — Processos em 2º Grau

| Campo | Detalhe |
|---|---|
| Tipo de recurso | Apelação, Agravo de Instrumento, Agravo Interno, Embargos de Declaração, Recurso Ordinário etc. |
| Órgão julgador | Turma, Câmara Cível/Criminal ou Órgão Especial |
| Relator(a) | Nome do desembargador(a) ou juiz(a) convocado(a) |
| Data de distribuição no 2º grau | — |
| Status do recurso | Ex.: aguardando distribuição, concluso para voto, em pauta, julgado |
| Prazo para contrarrazões/contraminuta | Data de início e data fatal, se em aberto |
| Data de julgamento ou previsão de pauta | Se já julgado, incluir resultado (provido, improvido, parcial) |
| Processo de origem (1º grau) | Número CNJ do processo vinculado, para cruzamento com a Aba 2 |

## 5. Estrutura da planilha final (.xlsx)

**Aba 1 — Dashboard**
- Contadores: total de processos, prazos vencendo em 7 dias, prazos vencidos, audiências na semana, recursos em 2º grau em andamento, total por tribunal (TJDFT / TRT10 / TRF1).
- Gráfico de pizza por fase processual.
- Gráfico de barras: prazos por semana (próximas 4 semanas).
- Gráfico de barras: quantidade de processos por tribunal (TJDFT, TRT10, TRF1).

**Aba 2 — Todos os Processos**
- Tabela completa com todos os campos da seção 4, cabeçalho fixo (freeze pane), filtros automáticos, colunas com largura ajustada ao conteúdo.

**Aba 3 — Prazos**
- Ordenada por urgência (dias restantes, crescente).
- Formatação condicional:
  - 🔴 Vermelho: ≤ 3 dias restantes ou vencido
  - 🟡 Amarelo: 4 a 10 dias restantes
  - 🟢 Verde: > 10 dias restantes

**Aba 4 — Audiências**
- Lista cronológica das próximas audiências, com processo vinculado, data, hora e modalidade.

**Aba 5 — Segundo Grau / Recursos**
- Tabela com todos os campos da seção 4.1, vinculando cada recurso ao processo de origem.
- Ordenada por status, priorizando prazos de contrarrazões em aberto e recursos com pauta de julgamento marcada.
- Mesma formatação condicional de urgência da Aba 3 aplicada à coluna de prazo de contrarrazões.

## 6. Diretrizes de design

- Paleta sóbria (tons de azul-marinho e cinza para cabeçalhos, cores de status conforme seção 5).
- Cabeçalhos com fundo escuro e texto em branco, negrito.
- Linhas zebradas (cores alternadas) para leitura fácil.
- Ícones ou emojis discretos para status (opcional).
- Nenhuma célula com texto cortado — ajustar largura automaticamente.

## 7. Regras de segurança na execução

- Nunca digitar senhas, tokens ou dados de login.
- Nunca clicar em "enviar", "protocolar" ou qualquer ação irreversível.
- Se uma página pedir autenticação que eu não tenha fornecido, parar e avisar.
- Apenas leitura de dados — nenhuma alteração no PJe.

## 8. Entrega

Ao final, salvar o arquivo como `processos-pje-[data].xlsx`, disponibilizá-lo para download e apresentar um resumo em texto: total de processos, prazos mais urgentes (top 5), recursos em 2º grau em andamento e próximas audiências.
