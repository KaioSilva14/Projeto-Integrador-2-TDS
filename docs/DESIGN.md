---
name: Eventos Escolares
description: Mural digital de eventos do Colégio Estadual José Luiz Gori — sério, limpo e rápido de usar no celular.
colors:
  primaria: "#2563EB"
  primaria-escura: "#1D4ED8"
  sucesso: "#10B981"
  sucesso-texto: "#047857"
  sucesso-fundo: "#D1FAE5"
  alerta: "#EF4444"
  alerta-texto: "#B91C1C"
  alerta-forte: "#DC2626"
  alerta-fundo: "#FEE2E2"
  neutro-texto: "#475569"
  neutro-fundo: "#F1F5F9"
  fundo: "#F8FAFC"
  superficie: "#FFFFFF"
  texto: "#1E293B"
  texto-suave: "#64748B"
  borda: "#E2E8F0"
  borda-campo: "#8391A5"
  escola-turquesa: "#3BD7C9"
  escola-turquesa-escuro: "#0F8F85"
  escola-azul: "#1E1459"
  destaque-fundo: "#EFF6FF"
typography:
  titulo-pagina:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.25
  titulo-card:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.25
  corpo:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  apoio:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  rotulo:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.05em"
rounded:
  campo: "8px"
  card: "12px"
  pilula: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  botao-primario:
    backgroundColor: "{colors.primaria}"
    textColor: "{colors.superficie}"
    rounded: "{rounded.campo}"
    padding: "10px 18px"
  botao-primario-hover:
    backgroundColor: "{colors.primaria-escura}"
  botao-secundario:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.texto}"
    rounded: "{rounded.campo}"
    padding: "10px 18px"
  botao-perigo:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.alerta-texto}"
    rounded: "{rounded.campo}"
    padding: "10px 18px"
  botao-perigo-hover:
    backgroundColor: "{colors.alerta-fundo}"
  botao-presenca:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.texto}"
    rounded: "{rounded.campo}"
    padding: "8px 14px"
  botao-presenca-presente:
    backgroundColor: "{colors.sucesso-fundo}"
    textColor: "{colors.sucesso-texto}"
  card:
    backgroundColor: "{colors.superficie}"
    rounded: "{rounded.card}"
    padding: "20px"
  campo:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.texto}"
    rounded: "{rounded.campo}"
    padding: "8px 12px"
  badge-disponivel:
    backgroundColor: "{colors.sucesso-fundo}"
    textColor: "{colors.sucesso-texto}"
    rounded: "{rounded.pilula}"
    padding: "4px 12px"
  badge-esgotado:
    backgroundColor: "{colors.alerta-fundo}"
    textColor: "{colors.alerta-texto}"
    rounded: "{rounded.pilula}"
    padding: "4px 12px"
  badge-encerrado:
    backgroundColor: "{colors.neutro-fundo}"
    textColor: "{colors.neutro-texto}"
    rounded: "{rounded.pilula}"
    padding: "4px 12px"
---

# Design — Eventos Escolares

> Sistema visual do projeto, no formato [DESIGN.md](https://github.com/google-labs-code/design.md): os **tokens** no topo (YAML) são a regra; o texto abaixo explica como aplicá-los.
> Implementação: um único arquivo, [`public/css/style.css`](../public/css/style.css). Cada token acima tem uma variável `--cor-…` / `--raio-…` lá. Mudou um, muda o outro.

## Overview

**Um mural de secretaria escolar, só que organizado.** Sério e confiável como um documento da escola, mas rápido como um app: o aluno abre o link no celular, bate o olho, vê a data e quantas vagas restam, e se inscreve.

Personalidade: **clara, calma, institucional.** Não é um app de balada nem um painel corporativo. O azul transmite "oficial da escola"; o verde e o vermelho só aparecem quando carregam uma informação (tem vaga / acabou / deu certo / deu erro).

Duas situações de uso definem as prioridades:
- **Aluno, no celular, com pressa** → a informação que decide (data, vagas) tem que ser lida sem rolar nem dar zoom.
- **Coordenação, no PC, fazendo chamada** → a lista de inscritos precisa ser escaneável e o check-in não pode fazer perder a posição na lista.

## Colors

**Cores da escola (logo):** turquesa `#3BD7C9` e azul-marinho `#1E1459`, medidas direto na imagem do logo. O azul-marinho é usado no nome do site, no título da home e no `theme-color`; o turquesa só no logo e em detalhes decorativos (contraste baixo para texto). `escola-turquesa-escuro` (3.8:1) só em texto **grande**, como o "404".

**Logo:** redesenhado em vetor (`public/img/logo-gori.svg`) a partir da imagem original — nítido em qualquer tamanho. O ícone (`favicon.svg`, ícones PNG) usa só o "G" em espiral, que continua reconhecível em 16 px.

A paleta da identidade (CLAUDE.md, seção 9) foi mantida e completada com os tons que faltavam para **texto legível**. Contraste medido (WCAG):

| Combinação | Contraste | Uso |
|---|---|---|
| `texto` sobre `fundo` | 13.98 : 1 ✅ | todo texto principal |
| `primaria` sobre `superficie` (e o inverso) | 5.17 : 1 ✅ | links, botão primário |
| `texto-suave` sobre `superficie` / `fundo` | 4.76 / 4.55 : 1 ✅ | informação secundária — **no limite, não clarear** |
| `sucesso-texto` sobre `sucesso-fundo` | 4.84 : 1 ✅ | badge "vagas" |
| `alerta-texto` sobre `alerta-fundo` | 5.30 : 1 ✅ | badge "Esgotado", mensagens de erro |
| branco sobre `alerta-forte` | 4.83 : 1 ✅ | reservado para um futuro botão de confirmação destrutiva |
| `borda-campo` sobre `superficie` | 3.20 : 1 ✅ | contorno de campos de formulário (mínimo 3:1 — WCAG 1.4.11) |
| `borda` sobre `superficie` | 1.23 : 1 | só divisórias e cards — **nunca** como único contorno de um campo |
| branco sobre `alerta` (`#EF4444`) | 3.76 : 1 ❌ | **não usar para texto** |
| `sucesso` (`#10B981`) sobre branco | 2.54 : 1 ❌ | **não usar para texto** |

Por isso: `sucesso` e `alerta` (as cores "da marca") ficam para **bordas, ícones e barras**; texto verde usa `sucesso-texto`, texto vermelho usa `alerta-texto`.

Significado fixo — não usar a cor para outra coisa:
- **Azul** = ação e navegação.
- **Verde** = tem vaga / deu certo / presente.
- **Vermelho** = esgotado / erro / ação destrutiva.
- **Cinza** = encerrado / inativo.

## Typography

- **Poppins** só em títulos (`h1`–`h3`, nome do sistema no topo). **Inter** em todo o resto.
- Carregadas do Google Fonts no `header.ejs`, só os pesos usados (Inter 400/500/600, Poppins 600/700). Sem internet, cai para a fonte do sistema e continua legível.
- Tamanho mínimo de texto: **15 px** (`apoio`). O único menor é o `rotulo` (12 px, maiúsculas, negrito) — só para categoria e cabeçalho de tabela.
- Datas `dd/mm/aaaa`, horas `19:00`. Números que se comparam em coluna (vagas, inscritos) com `font-variant-numeric: tabular-nums`.

## Layout

- Conteúdo centralizado, **máx. 960 px**, margem lateral de 16 px no celular.
- Espaçamento só pela escala `spacing` (4 · 8 · 16 · 24 · 32 · 48). Entre seções: 24–32 px; dentro de um card: 8 px.
- **Mobile first.** A lista de eventos é uma grade que vira uma coluna abaixo de ~600 px (`minmax(280px, 1fr)`).
- Tabelas do admin: em telas estreitas, rolam **dentro** de um contêiner (`overflow-x: auto`) — a página nunca rola para o lado.
- Estrutura de toda página: topo (marca + link do organizador) → título da página → conteúdo → rodapé com o nome da escola.

### As 8 telas (CLAUDE.md, seção 8)

| Tela | O que tem que saltar aos olhos |
|---|---|
| Home | Data e vagas restantes de cada evento; filtro de categoria no topo |
| Detalhes | Botão "Inscrever-se" (ou o motivo de não poder); data, horário, local em destaque |
| Inscrição | 3 campos, um por linha, rótulo sempre visível; botão largo no celular |
| Confirmação | Sinal claro de sucesso (verde) + resumo do evento; link "ver outros eventos" |
| Login | Formulário curto e centralizado; erro acima dos campos |
| Eventos (admin) | Tabela: título, data, inscritos/capacidade, status; ações por linha |
| Criar/editar evento | Campos agrupados: o quê (título, categoria, descrição) → quando → onde/quantos |
| Inscritos + check-in | Contador "X presentes de Y inscritos"; botão de presença grande em cada linha |

## Elevation & Depth

Quase plano. Profundidade só para dizer "isto é clicável":

- **Card em repouso:** borda `borda` + sombra leve (`0 1px 3px` com 8% de preto).
- **Card no hover:** sombra um pouco maior + sobe 2 px.
- Nada de sombra em botão, campo ou tabela. Nada de gradiente, blur ou vidro fosco.

## Shapes

- `rounded.card` (12 px): cards, caixas de aviso, estado vazio.
- `rounded.campo` (8 px): botões, campos de formulário.
- `rounded.pilula`: badges de status.
- Bordas de 1 px em `borda`. Estado vazio usa borda **tracejada** (sinaliza "ainda não tem nada aqui").

## Components

Cada componente é uma classe no `style.css`. Todos já existem.

| Componente | Classe | Notas |
|---|---|---|
| Botão primário | `.botao` | Uma ação principal por tela |
| Botão secundário | `.botao .botao-secundario` | Cancelar, voltar, ações de linha de tabela |
| Botão de perigo | `.botao .botao-perigo` | **Contornado** (texto vermelho, fundo branco): numa tabela com 7 eventos, 7 botões vermelhos cheios seriam a coisa mais chamativa da tela. Sempre com `data-confirmar` |
| Botão largo | `.botao-largo` | Largura total no celular, normal a partir de 600 px |
| Botão pequeno | `.botao-pequeno` | Ações dentro de tabela |
| Card de evento | `.card` + `.card-link` | O card inteiro é o link (área de toque grande) |
| Badge de status | `partials/badge-evento.ejs` → `.badge-disponivel` / `-esgotado` / `-encerrado` | Texto sempre junto da cor (não depender só da cor). Usar o partial, não repetir a lógica |
| Estado vazio | `.vazio` | Diz o que falta **e** o que vai aparecer ali |
| Grupo de campo | `.campo` (rótulo + campo + `.erro-campo`) | Rótulo sempre visível acima; erro em `alerta-texto` logo abaixo; campo com erro ganha `aria-invalid` e borda vermelha |
| Linha de campos | `.campos-linha`, `.campo-largo` | Data/início/término lado a lado no PC, empilhados no celular |
| Aviso | `.aviso .aviso-sucesso` / `.aviso-erro` | Faixa no topo do conteúdo, borda esquerda de 4 px |
| Números do painel | `.numeros` + `.numero` | Um número grande por caixa |
| Tabela | `.tabela-rolagem` > `.tabela` | Rola dentro da caixa no celular; `span.info` = 2ª linha da célula; `.numero-coluna` à direita |
| Botão de presença | `.botao-presenca` (+ `.presente`) | Ausente: contornado. Presente: `sucesso-fundo` + "✓ Presente". Fica na **2ª coluna**, logo após o nome, para caber no celular |
| Detalhes do evento | `.detalhe-dados` (`dl`) | 2 colunas no celular, 4 no PC |
| Destaque da home | `.destaque` | Primeira seção: título, descrição e a chamada principal ("Ver próximos eventos") |
| Breadcrumbs | `.trilha` (via `trilha` no include do header) | Em páginas internas; o último item é a página atual |
| Perguntas | `.pergunta` (`details`/`summary`) | Abre e fecha sem JavaScript |
| Páginas de erro | `.pagina-erro` | Código grande + o que aconteceu + caminhos para seguir |
| Mensagem (painel) | `.mensagem` (+ `.mensagem-lida`) | Borda azul à esquerda quando não lida |
| Contador de caracteres | `data-contador` + `maxlength` | Criado pelo `site.js`; fica vermelho perto do limite |
| Rodapé | `.rodape-grade` | Logo, links internos e acesso da coordenação |

### Estados obrigatórios

Todo elemento interativo tem **hover**, **foco visível** (teclado) e, se aplicável, **desabilitado**. Toda lista tem **estado vazio**. Todo formulário tem **estado de erro** que mantém o que foi digitado.

### Movimento

Pouco e rápido — interface de trabalho, não vitrine.
- Só `transform` e `opacity`, **150–200 ms**, curva de saída suave (`cubic-bezier(0.23, 1, 0.32, 1)`).
- Hover do card: sobe 2 px. Botão pressionado: `scale(0.97)`, para o clique "responder".
- **Nada animado no check-in** — o organizador clica dezenas de vezes seguidas; a resposta tem que ser instantânea.
- Tudo desliga com `prefers-reduced-motion: reduce`.

## Do's and Don'ts

**Fazer**
- ✅ Mostrar vagas como número ("3 vagas"), não só como cor.
- ✅ Escrever botões com verbo e objeto: "Inscrever-se", "Criar evento", "Marcar presença".
- ✅ Mensagens de erro que dizem **o que fazer**: "Informe um e-mail válido." (lista completa em [RULES.md](RULES.md) §2).
- ✅ Área de toque de pelo menos 44 × 44 px em botões e links no celular.
- ✅ Usar as variáveis do `:root` — nunca repetir um hex solto no CSS.

**Evitar**
- ❌ Texto em `#EF4444` ou `#10B981` puros (contraste insuficiente — ver Colors).
- ❌ Gradientes, sombras fortes, vidro fosco, fundos com textura — o "visual de template".
- ❌ Emoji como ícone de interface (exceto o ✓ da confirmação e do check-in).
- ❌ Mais de um botão primário azul na mesma tela.
- ❌ Vermelho cheio repetido em listas (usar o `.botao-perigo` contornado).
- ❌ Esconder o rótulo do campo e usar só o `placeholder`.
- ❌ Framework de CSS (Bootstrap, Tailwind) — decisão do projeto (CLAUDE.md, seção 4).
- ❌ Animação em ação repetitiva (check-in, filtro).
