# RoboBoard Docs — Arquitetura e Diretrizes de Código

O **RoboBoard Docs** é uma aplicação web de engenharia para documentar montagens de robótica em placas perfuradas universais de **5×7 cm** (matriz de 18 colunas × 24 linhas, passo de 2.54 mm).

Este documento estabelece as regras inegociáveis de **Clean Architecture**, **Divisão por Feature** e **Clean Code** do projeto.

---

## 1. Estrutura de Diretórios (Feature-Sliced + Clean Architecture)

```text
src/
├── app/                     # Composição raiz (App.tsx, AppShell, injeção de dependências/providers)
├── core/
│   ├── domain/              # Tipos, interfaces e Value Objects compartilhados (puro TS, zero React)
│   ├── styles/              # tokens.css, reset.css, typography.css (sem arquivo gigante único)
│   └── ui/                  # Componentes genéricos reutilizáveis (Button/, Modal/, IconButton/), cada um com .tsx + .module.css
└── features/
    └── board/               # Feature da placa 5x7
        ├── domain/          # Regras puras: entidades Board, HoleCoordinate, cálculo de espelhamento (mirrorX)
        ├── application/     # Casos de uso e hooks de orquestração (useBoardViewport, useBoardViewMode)
        ├── infrastructure/  # Adaptadores externos (helpers de viewport/DOM, persistência ou exportação)
        └── presentation/    # Componentes React pequenos e focados + seus respectivos .module.css
```

---

## 2. Regras Inegociáveis de Clean Architecture

### 2.1. Regra de Dependência Estrita
O fluxo de dependências aponta sempre para o centro (Domínio):

1. **`domain/` (Puro TypeScript):**
   - Contém entidades, Value Objects, tipos algébricos e funções puras de transformação (como `mirrorX` e `toDisplayCoordinate`).
   - **PROIBIDO** importar `react`, APIs de `DOM`/`window`, `infrastructure/` ou `presentation/`.
2. **`application/` (Casos de Uso e Orquestração):**
   - Orquestra o estado da aplicação e expõe contratos claros (hooks ou serviços de aplicação) para a camada visual.
   - Depende **apenas** de `domain/` (e de interfaces de `infrastructure/` quando aplicável).
   - **PROIBIDO** importar componentes de `presentation/` ou estilização CSS.
3. **`infrastructure/` (Adaptadores Externos):**
   - Isola interações com APIs do navegador, eventos brutos de hardware/DOM, armazenamento local ou geradores de PDF.
4. **`presentation/` (UI Declarativa):**
   - Consome `application/` e `domain/` apenas para renderizar estado e despachar intenções do usuário.
   - Não executa regras de negócio, cálculos geométricos de placa nem lógica de espelhamento.

---

## 3. Regras Inegociáveis de Clean Code Front-End

### 3.1. Zero Lógica de Negócio no JSX
- Componentes React em `presentation/` devem ser **declarativos e enxutos**.
- Fórmulas de coordenadas (`col`, `row`), cálculo de inversão horizontal da vista de solda (`17 - col`), formatação de rótulos (`A1`..`X18`) e validações de limites pertencem exclusivamente a `domain/` ou `application/`.

### 3.2. HTML/JSX Limpo e Legível
- **Sem linhas infinitas:** Nunca escreva elementos com múltiplos atributos acoplados em uma única linha extensa.
- **Quebra de atributos:** Quebre propriedades de componentes e elementos SVG em múltiplas linhas sempre que ultrapassarem ~100 caracteres.
- **Indentação semântica:** Mantenha hierarquia visual clara e extraia subcomponentes focados para manter arquivos enxutos (**limite alvo: ~150 linhas por arquivo**).

### 3.3. CSS Modular e Desacoplado
- **CSS Modules Obrigatório:** Todo componente possui seu próprio arquivo `.module.css` dedicado.
- **Proibido CSS Monolítico:** Nenhum arquivo global de componentes é permitido. Apenas `src/core/styles/tokens.css`, `reset.css` e `typography.css` definem variáveis e normalização base.
- **Proibido Inline Style Extenso:** Estilos inline (`style={{ ... }}`) são restritos exclusivamente a coordenadas dinâmicas inevitáveis (ex.: `transform` de matriz de zoom/pan).
- **Single Source of Truth de Design:** Todas as cores, espaçamentos, bordas e fontes utilizam as variáveis de `src/core/styles/tokens.css`.

---

## 4. Modelo Geométrico e Espelhamento da Placa 5×7 cm

- **Dimensões Físicas e Matriz:** Passo padrão de `2.54 mm` (0.1 polegada), totalizando **18 colunas** (`1` a `18`, índice lógico `0..17`) por **24 linhas** (`A` a `X`, índice lógico `0..23`).
- **Invariante de Estado:** O estado interno armazena **sempre** as coordenadas sob a referência da **Vista Superior (Top View / Componentes)**.
- **Transformação de Exibição (`toDisplayCoordinate`):**
  - Na **Vista Superior (`top`)**: `displayCol = coord.col` (`0..17`, esquerda para direita: `1..18`).
  - Na **Vista Inferior Espelhada (`bottom`)**: `displayCol = (totalCols - 1) - coord.col` (`17 - col`, esquerda para direita: `18..1`).
  - Os textos das coordenadas nas bordas (`A`–`X` e `18`–`1`) jamais são espelhados com `scaleX(-1)` no CSS/SVG; são recalculados matematicamente pelo domínio para permanecerem perfeitamente legíveis enquanto a estética da placa muda para o padrão de cobre/solda.
