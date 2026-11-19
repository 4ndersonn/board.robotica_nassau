# RoboBoard Docs

![React](https://img.shields.io/badge/React-18.3-149eca?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-6.0-646cff?style=flat-square)

**RoboBoard Docs** é uma aplicação web de CAD de bancada desenvolvida para documentar montagens eletrônicas de robótica em placas perfuradas universais de **5x7 cm** (matriz de 18 colunas por 24 linhas, passo de 2.54 mm).

A ferramenta resolve o problema recorrente de manutenção e montagem em equipes de robótica: ao virar a placa física para soldar no verso, a ordem das colunas se inverte horizontalmente, dificultando a conferência de pinos e trilhas. O RoboBoard Docs mantém o modelo lógico unificado e projeta matematicamente a **Vista Superior (Componentes)** e a **Vista Inferior Espelhada (Soldas/Cobre)**, gerando automaticamente a tabela de conexões (Netlist), a Lista de Materiais (BOM), o cabeçalho `#define` em C++ para o firmware e o relatório técnico vetorial em folha A4 para impressão ou exportação em PDF.

---

## Preview (Screenshots)

<!-- Adicione as capturas de tela da aplicação nos caminhos abaixo quando disponíveis -->

| Visão Geral do Editor CAD | Vista Inferior Espelhada e Fiação | Relatório Técnico A4 Vetorial (PDF) |
| :---: | :---: | :---: |
| `docs/screenshots/editor-top-view.png` | `docs/screenshots/editor-bottom-mirrored.png` | `docs/screenshots/technical-report-a4.png` |

---

## Arquitetura do Projeto

O código segue estritamente **Clean Architecture combinada com divisão por Feature** (Feature-Sliced Design), conforme documentado em [ARCHITECTURE.md](./ARCHITECTURE.md).

### Regras de Dependência e Isolamento
1. **`domain/` (TypeScript Puro)**: Contém entidades, Value Objects, validadores, cálculos matriciais de rotação, espelhamento horizontal (`mirrorX`, `toDisplayCoordinate`), roteamento de fios, resolução de Netlist, geração de BOM e geração de código C++. Não importa React, APIs de DOM, `infrastructure/` ou `presentation/`.
2. **`application/` (Casos de Uso e Orquestração)**: Contém casos de uso puros e hooks de controle de estado que dependem apenas de `domain/` (e de portas definidas no domínio).
3. **`infrastructure/` (Adaptadores Externos)**: Implementa portas de persistência (`LocalStorage`, arquivos `.roboboard.json` e `biblioteca-equipe.json`), catálogo estático, área de transferência e acionamento de impressão vetorial (`window.print()`).
4. **`presentation/` (UI Declarativa e CSS Modules)**: Componentes React pequenos e focados, sem lógica de negócio no JSX, estilizados exclusivamente via CSS Modules (`.module.css`) consumindo tokens centralizados em `src/core/styles/tokens.css`.

### Árvore de Diretórios (`src/`)

```text
src/
├── app/                              # Composição raiz e injeção de dependências
│   ├── App.tsx
│   └── AppShell/                     # Layout base (TopBar, painéis laterais e área central)
├── core/
│   ├── domain/                       # Value Objects geométricos compartilhados (Point2D, ViewportTransform)
│   ├── styles/                       # tokens.css, reset.css e typography.css
│   └── ui/                           # Componentes genéricos reutilizáveis (Button, IconButton, Modal)
└── features/
    ├── board/                        # Matriz 5x7 cm (18x24), espelhamento X, zoom/pan e eixos A-X / 1-18
    │   ├── domain/
    │   ├── application/
    │   ├── infrastructure/
    │   └── presentation/
    ├── components-catalog/           # Catálogo de módulos, rotação 90°, colisão, modo Raio-X e inspetor
    │   ├── domain/
    │   ├── application/
    │   ├── infrastructure/
    │   └── presentation/
    ├── custom-components/            # Criador visual de módulos customizados e biblioteca .json da equipe
    │   ├── domain/
    │   ├── application/
    │   ├── infrastructure/
    │   └── presentation/
    ├── wiring/                       # Traçado de fios frente/verso, dobras 90°/livre e Netlist automática
    │   ├── domain/
    │   ├── application/
    │   ├── infrastructure/
    │   └── presentation/
    ├── project-persistence/          # Salvamento LocalStorage, Undo/Redo, metadados e .roboboard.json
    │   ├── domain/
    │   ├── application/
    │   ├── infrastructure/
    │   └── presentation/
    ├── firmware-export/              # Geração automática de cabeçalho C++ (#define) a partir da Netlist
    │   ├── domain/
    │   ├── application/
    │   ├── infrastructure/
    │   └── presentation/
    └── pdf-export/                   # Montagem de BOM e folha técnica A4 vetorial para impressão/PDF
        ├── domain/
        ├── application/
        ├── infrastructure/
        └── presentation/
```

---

## Stack Tecnológica

Dependências e ferramentas configuradas no [package.json](./package.json):

- **React** (`^18.3.1`) e **React DOM** (`^18.3.1`)
- **TypeScript** (`~5.6.2`) com verificação estrita (`strict: true`)
- **Vite** (`^6.0.1`) com `@vitejs/plugin-react`
- **CSS Modules** nativo + Custom Properties (`tokens.css` e `@media print` A4)
- **ESLint** (`^9.15.0`) com `typescript-eslint`, `eslint-plugin-react-hooks` e `eslint-plugin-react-refresh`

---

## Como Rodar Localmente

### Pré-requisitos
- **Node.js** (versão 18+ ou 20+ recomendada) e **npm**

### Instalação e Execução

1. Instale as dependências do projeto:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   Acesse o endereço exibido no terminal (por padrão, `http://localhost:5173`).

### Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento Vite com Hot Module Replacement (HMR). |
| `npm run build` | Executa a checagem de tipos (`tsc -b`) e gera o pacote otimizado de produção na pasta `dist/`. |
| `npm run lint` | Executa a análise estática de código com ESLint em todos os arquivos `.ts` e `.tsx`. |
| `npm run preview` | Serve localmente o build gerado em `dist/` para validação antes do deploy. |

---

## Fluxo Básico de Uso

1. **Configurar o Projeto**: Clique em **Projeto** na barra superior para preencher o nome do robô, categoria, versão de hardware, responsável e notas de montagem.
2. **Posicionar Componentes**: No painel esquerdo, busque um módulo (ou crie um novo em **+ Novo Componente**), clique nele para ativar o preview no grid, ajuste a rotação com a tecla `R` e clique no furo de destino para encaixar.
3. **Alternar Vistas (Frente / Verso Espelhado)**: Use o seletor **Superior** | **Inferior** na barra superior para visualizar a placa pela face dos componentes (`1 -> 18`) ou pela face de solda espelhada (`18 -> 1`).
4. **Traçar Fios e Gerar Netlist**: Pressione `W` (modo Fio), escolha a cor e o estilo de dobra (Ortogonal 90° ou Livre), clique no furo/pino de origem, adicione dobras intermediárias se necessário e clique no pino de destino (ou pressione `Enter`) para concluir. A conexão aparecerá imediatamente na **Netlist Automática** à direita.
5. **Exportar Documentação e Código**:
   - Clique em **`</> C++`** para copiar ou baixar o arquivo `.h` com os `#define` de pinos do ESP32.
   - Clique em **JSON** para baixar o arquivo `.roboboard.json` do projeto.
   - Clique em **Exportar PDF** para abrir a folha técnica A4 vetorial e imprimi-la ou salvá-la como PDF pelo navegador.

---

## Próximos Passos (Roadmap)

- [ ] Arrastar componentes já posicionados diretamente no canvas sem precisar removê-los e reposicioná-los.
- [ ] Edição interativa de vértices (waypoints) de um fio já traçado via drag-and-drop.
- [ ] Verificação elétrica de curto-circuito direto entre barramentos `VCC` e `GND` na mesma trilha/rede.
- [ ] Templates prontos de placas iniciais para categorias comuns (Seguidor de Linha, Sumô Mini, Hockey).
- [ ] Testes unitários automatizados para os serviços puros da camada `domain/`.
