# Fizgo Digital · Propostas & Contratos

Sistema da Fizgo para criar **propostas comerciais com a identidade da marca** e transformá-las em **contrato com 1 clique** — sem digitar nada duas vezes.

## 🚀 Como Executar o Projeto na Nova Máquina

### 1. Pré-requisitos
* **Python 3.9+** (usa apenas a biblioteca padrão, não precisa de `pip install`)
* (Opcional) **Node.js 18+** se for usar `npm start` ou editar os vídeos em `video-explicativo/`

### 2. Iniciar o Servidor
Você pode iniciar via Python direto ou via npm:

```bash
# Opção 1: Via Python direto (porta padrão 3005)
python3 server.py 3005

# Opção 2: Via npm
npm start
```

Acesse no navegador:
👉 **http://localhost:3005**

---

## 💾 Migração dos Dados entre Máquinas (Backup & Restore)
Os dados do sistema (clientes, propostas geradas, contratos, colaboradores e configurações) são armazenados no navegador (IndexedDB). Para transferir tudo para a nova máquina:

1. **Na máquina atual:**
   * Acesse `http://localhost:3005/#/config` (ou clique no menu lateral em *Configurações*).
   * Vá na aba **Backup** e clique em **"Baixar backup"** (será gerado um arquivo `.json` completo com todos os dados).
2. **Na nova máquina:**
   * Abra o sistema no navegador (`http://localhost:3005/#/config`).
   * Vá na aba **Backup**, clique em **"Restaurar backup"** e selecione o arquivo `.json` salvo.
   * Pronto! Todos os seus contratos e propostas estarão imediatamente disponíveis.

*(Dica: se for a primeira vez testando o sistema, clique em "Carregar exemplos" para ver propostas reais e contratos demonstrativos).*

---

## ⚙️ Variáveis de Ambiente (.env)
O sistema aceita um arquivo `.env` opcional na raiz:
```bash
cp .env.example .env
```
Variáveis disponíveis:
* `PORT`: Porta do servidor local (padrão: `3005`).
* `AUTENTIQUE_TOKEN`: Token de API da Autentique (pode ser configurado aqui ou direto na interface em *Configurações → Autentique*).
* `AUTENTIQUE_URL`: Endpoint da API GraphQL (padrão: `https://api.autentique.com.br/v2/graphql`).

---

## O fluxo

1. **Cliente** — cadastre pelo CNPJ (busca razão social e endereço automaticamente) ou CEP.
2. **Proposta** — escolha um plano pronto ou monte na **calculadora** (quantidade × preço de tabela). Ofereça até 4 opções; o comparativo é gerado sozinho.
3. **Estratégia** (opcional) — diagnóstico do cliente e projeção de resultados (leads, clientes, faturamento, ROI).
4. **Enviar** — baixe o PDF ou abra o WhatsApp com mensagem pronta. O sistema avisa quando a proposta está para vencer.
5. **Aprovar → Contrato** — escolha a opção aprovada, complete os dados que faltarem e o contrato sai preenchido: plano, valores, kickoff, pontualidade e valores por extenso.
6. **Assinatura** — status, testemunhas, kickoff recebido e anexo da via assinada. O painel avisa fim do período sem fidelidade, renovação e reajuste.

## Deixando a proposta mais bonita e persuasiva

- **Portfólio** (menu lateral): cadastre a página "Quem somos", números, equipe com foto, cases com resultados, depoimentos e logos de clientes. Essas páginas só entram na proposta quando têm conteúdo.
- **Modelos por segmento** (Portfólio → Modelos por segmento): ao escolher o segmento do cliente, a proposta já sai com diagnóstico, projeção, plano sugerido e os cases do mesmo segmento.
- **Vídeo**: cole o link de um vídeo explicando a proposta (aba Conteúdo); vira um QR code clicável na página final.

## Lembretes e WhatsApp

O painel avisa follow-up de proposta sem resposta, proposta vencendo, kickoff pendente, renovação e reajuste anual, cada um com um botão de WhatsApp com a mensagem pronta. Os textos ficam em *Configurações → Mensagens WhatsApp*.

## Assinatura pelo Autentique

1. Gere um token em [painel.autentique.com.br/perfil/api](https://painel.autentique.com.br/perfil/api) e cole em *Configurações → Autentique* (clique em "Testar conexão").
2. Comece com o **modo teste** ligado (documentos sem validade, sem gastar créditos). Depois desligue.
3. Na aba *Assinatura* do contrato, clique em **Enviar para assinatura**: o PDF vai para o contratante (e-mail, ou WhatsApp se não houver e-mail), para a Fizgo e para as testemunhas com e-mail.
4. O sistema confere o Autentique ao abrir e a cada 15 minutos. Quando todos assinam, o contrato vira "Assinado" e a via assinada fica anexada. Recusas aparecem no painel.

O Autentique não aceita chamadas direto do navegador, por isso o sistema precisa ser aberto pelo `server.py` (ele repassa as chamadas). Sem token, a aba mostra o passo a passo manual.

> Depois de uma atualização do sistema, recarregue a página com **Cmd + Shift + R** para o navegador pegar os arquivos novos.

## Regras que o sistema aplica sozinho

Editáveis em *Configurações → Regras comerciais*:

- Kickoff de 60% (100% para mensalidades abaixo de R$ 1.000), não reembolsável
- Desconto de R$ 100 por pontualidade (pagamento até o dia 5; vencimento dia 8)
- Contrato de 12 meses, 3 primeiros sem fidelidade, renovação de 6 meses, aviso prévio de 30 dias
- Multa rescisória de 50% das mensalidades restantes
- Material visual: 50% de entrada + 50% na entrega
- Proposta válida por 7 dias

Os avisos [1]–[6] do rodapé da proposta usam essas regras, então mudar um valor atualiza tudo.

## Estrutura

```
index.html            app (sem build; módulos ES)
css/app.css           interface
css/doc.css           páginas A4 da proposta e do contrato + impressão
js/defaults.js        dados da Fizgo, catálogo, planos, avisos e cláusulas
js/calc.js            motor de preços (proposta e contrato usam o mesmo cálculo)
js/render-proposta.js páginas da proposta
js/render-proposta.js páginas da proposta
js/render-contrato.js contrato com variáveis, numeração automática e paginação
js/flow.js            proposta → contrato, avisos do painel, contratos MEI
js/views/             telas (painel, propostas, contratos, colaboradores, clientes, etc.)
```
