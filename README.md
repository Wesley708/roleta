# 🎄 Roleta Natalina 🎅

Uma aplicação web interativa de página única (SPA), festiva e moderna, criada com **HTML5, CSS3 e JavaScript puro (Vanilla JS)**. Sem dependências externas pesadas ou necessidade de backend, pronta para ser hospedada diretamente no **GitHub Pages**!

---

## ✨ Funcionalidades Principais

1. **Tema Natalino Completo & Rico:**
   - Paleta de cores oficial: Vermelho natalino profundo (`#C41E3A`), Verde pinho (`#165B33`), Dourado festivo (`#D4AF37`) e Branco neve.
   - Neve caindo suavemente ao fundo animada via Canvas HTML5 de alto desempenho.
   - Luzinhas de Natal piscando no topo com efeito de brilho e reflexo.
   - Ponteiro estilizado no topo com estrela natalina dourada e indicador direcionado.

2. **Gerenciamento de Itens Completo:**
   - Adicione qualquer item ou prêmio personalizado.
   - Remova itens individualmente com um clique no botão 🗑️.
   - **Listas Rápidas (Presets Prontos):**
     - 🎁 *Amigo Secreto* (Papai Noel, Mamãe Noel, Duende, etc.)
     - 🍗 *Ceia de Natal* (Peru Assado, Tender, Salpicão, Panetone, etc.)
     - 🎭 *Prendas & Desafios* (Cantar "Então é Natal", imitar o Papai Noel, etc.)
     - 🏆 *Prêmios & Brindes* (Panetone trufado, vale presente, etc.)
   - Botões de **Embaralhar** (🔀) e **Limpar Tudo** (🗑️).
   - **Persistência Automática:** seus itens e preferências ficam salvos no `localStorage` do navegador.

3. **Mecânica de Giro & Efeitos Especiais:**
   - **Gatilhos duplos:** Gire clicando no botão central "GIRAR" / na roleta ou pressionando a tecla **Espaço (`Spacebar`)**.
   - Física de rotação realista com desaceleração gradual (*Ease-out quintic*) gerando suspense até a última fração de segundo.
   - **Áudio Sintetizado Festivo (Web Audio API):**
     - Som mecânico de "tic-tac" a cada fatia percorrida, desacelerando com a roleta.
     - Fanfarra musical natalina quando o vencedor é sorteado.
     - Botão para ativar/desativar som a qualquer momento.
     - *100% sintetizado no navegador:* não depende de arquivos MP3 externos que poderiam falhar ao carregar.
   - **Chuva de Confetes & Fagulhas Douradas** em Canvas com estrelas e fitas festivas.
   - **Modal de Celebração:** revela o sorteado em destaque com opção de "Girar Novamente" ou "Remover Este Item".
   - **Opção de Remoção Automática:** checkbox para remover automaticamente da roleta os itens já sorteados.

---

## 🚀 Como Executar Localmente

Como o projeto é 100% estático (apenas HTML, CSS e JavaScript), você pode executá-lo de qualquer uma das formas abaixo:

### Opção 1: Abrir diretamente no navegador
Basta dar um duplo clique no arquivo `index.html` ou arrastá-lo para dentro do Google Chrome, Firefox, Edge ou Safari.

### Opção 2: Servidor local simples (opcional)
Se tiver o Python instalado:
```bash
# Python 3
python3 -m http.server 8000
```
Acesse em: [http://localhost:8000](http://localhost:8000)

---

## 🌐 Como Publicar no GitHub Pages (Passo a Passo)

1. Crie um novo repositório no [GitHub](https://github.com/new) (ex: `roleta-natalina`).
2. No seu computador, inicialize o Git na pasta do projeto e envie os arquivos:
   ```bash
   git init
   git add .
   git commit -m "feat: Roleta Natalina interativa"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/roleta-natalina.git
   git push -u origin main
   ```
3. No GitHub:
   - Vá em **Settings** (Configurações) do repositório.
   - No menu lateral esquerdo, clique em **Pages**.
   - Em **Build and deployment > Branch**, selecione a branch `main` e a pasta `/ (root)`.
   - Clique em **Save**.
4. Em poucos segundos, sua Roleta Natalina estará no ar no endereço:
   `https://SEU_USUARIO.github.io/roleta-natalina/` 🎄✨

---

## 📁 Estrutura dos Arquivos

```text
├── index.html       # Estrutura semântica, luzinhas, canvas e modais
├── style.css        # Estilos, paleta natalina, efeitos de luz e responsividade
├── script.js        # Física da roleta, Web Audio API, confetes e localStorage
└── README.md        # Documentação e instruções de deploy
```

---

*Boas Festas e Ótimos Sorteios!* 🎅🎁
