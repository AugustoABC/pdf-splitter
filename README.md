# PDF Splitter - Fragmentador de PDFs

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/seu-usuario/pdf-splitter)

Um site web de código aberto para fragmentação de arquivos PDF diretamente no navegador, com foco em privacidade e segurança. Todos os arquivos são processados localmente, sem envio de dados para servidores externos.

## ✨ Características

- **🔒 100% Privado**: Processamento local no navegador, sem upload para servidores
- **📱 Responsivo**: Interface otimizada para desktop e dispositivos móveis
- **🎯 Simples**: Interface intuitiva com drag-and-drop
- **⚡ Rápido**: Processamento eficiente usando WebAssembly
- **🆓 Gratuito**: Código aberto sob licença MIT
- **🌐 Offline**: Funciona sem conexão com a internet após o carregamento inicial

## 🚀 Funcionalidades

### Upload de Arquivos
- Suporte a drag-and-drop
- Botão de seleção de arquivos
- Validação automática de formato PDF
- Feedback visual durante o upload

### Visualização de PDF
- Miniaturas de todas as páginas
- Navegação por páginas
- Seleção visual de páginas específicas
- Informações detalhadas do documento

### Opções de Fragmentação

#### 1. Por Intervalo de Páginas
- Defina quantas páginas por fragmento
- Divisão automática e sequencial
- Ideal para documentos longos

#### 2. Por Páginas Específicas
- Seleção manual de páginas
- Interface visual com miniaturas
- Controle total sobre o conteúdo

#### 3. Por Tamanho Máximo
- Limite de tamanho em MB por fragmento
- Análise inteligente do tamanho das páginas
- Otimização automática da divisão

### Sistema de Download
- Download individual de fragmentos
- Download em lote como arquivo ZIP
- Nomes de arquivo descritivos
- Informações de tamanho e páginas

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e acessível
- **CSS3 + TailwindCSS**: Estilização responsiva e moderna
- **JavaScript ES6+**: Lógica da aplicação
- **PDF.js**: Renderização e visualização de PDFs
- **PDF-lib**: Manipulação e fragmentação de PDFs
- **JSZip**: Criação de arquivos ZIP para download em lote

## 📦 Instalação e Uso

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Instalação Local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/pdf-splitter.git

# Entre no diretório
cd pdf-splitter

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`.

### Uso Básico

1. **Upload**: Arraste um arquivo PDF para a área de upload ou clique para selecionar
2. **Visualização**: Veja as miniaturas de todas as páginas do documento
3. **Fragmentação**: Escolha o método de divisão desejado:
   - Intervalo: Defina páginas por fragmento
   - Específico: Selecione páginas manualmente
   - Tamanho: Defina limite de MB por fragmento
4. **Download**: Baixe fragmentos individualmente ou todos em ZIP

## 🔧 Configuração

### Personalização da Interface

O projeto usa TailwindCSS para estilização. Para personalizar a aparência:

1. Edite as classes CSS no arquivo `index.html`
2. Modifique as variáveis de cor no arquivo de estilos
3. Ajuste o layout responsivo conforme necessário

### Configuração de Bibliotecas

As bibliotecas são carregadas via CDN por padrão. Para uso local:

1. Baixe as bibliotecas necessárias
2. Coloque na pasta `libs/`
3. Atualize os caminhos no `index.html`

## 🌐 Deploy

### Vercel (Recomendado)

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/seu-usuario/pdf-splitter)

### Netlify

1. Conecte seu repositório GitHub
2. Configure o build command: `npm run build`
3. Defina o publish directory: `./`

### GitHub Pages

1. Ative GitHub Pages nas configurações do repositório
2. Selecione a branch `main` como source
3. O site estará disponível em `https://seu-usuario.github.io/pdf-splitter`

## 🔒 Privacidade e Segurança

Este aplicativo foi desenvolvido com foco na privacidade do usuário:

- **Processamento Local**: Todos os arquivos são processados no navegador do usuário
- **Sem Uploads**: Nenhum dado é enviado para servidores externos
- **Sem Cookies**: Não utilizamos cookies de rastreamento
- **Sem Analytics**: Não coletamos dados de uso
- **Código Aberto**: Todo o código é auditável e transparente

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Diretrizes de Contribuição

- Mantenha o código limpo e bem comentado
- Siga as convenções de nomenclatura existentes
- Teste suas mudanças em diferentes navegadores
- Atualize a documentação conforme necessário

## 📋 Roadmap

- [ ] Suporte a PDFs protegidos por senha
- [ ] Opção de mesclar PDFs
- [ ] Rotação de páginas
- [ ] Extração de texto
- [ ] Suporte a outros formatos (DOCX, PPTX)
- [ ] Modo escuro
- [ ] Internacionalização (i18n)
- [ ] Progressive Web App (PWA)

## 🐛 Problemas Conhecidos

- Arquivos PDF muito grandes (>100MB) podem causar lentidão
- Alguns PDFs com proteção DRM não são suportados
- Navegadores muito antigos podem não funcionar corretamente

## 📞 Suporte

Se você encontrar problemas ou tiver dúvidas:

1. Verifique a seção de [Issues](https://github.com/seu-usuario/pdf-splitter/issues)
2. Crie uma nova issue com detalhes do problema
3. Inclua informações sobre navegador e sistema operacional

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- [PDF.js](https://mozilla.github.io/pdf.js/) - Renderização de PDFs
- [PDF-lib](https://pdf-lib.js.org/) - Manipulação de PDFs
- [TailwindCSS](https://tailwindcss.com/) - Framework CSS
- [JSZip](https://stuk.github.io/jszip/) - Criação de arquivos ZIP
- [Font Awesome](https://fontawesome.com/) - Ícones

---

Desenvolvido com ❤️ para a comunidade open source.

