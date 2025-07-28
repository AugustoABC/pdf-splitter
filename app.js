// PDF Splitter - Aplicação JavaScript
class PDFSplitter {
    constructor() {
        this.currentPDF = null;
        this.pdfDocument = null;
        this.selectedPages = new Set();
        this.fragments = [];
        
        this.initializeEventListeners();
        this.setupPDFJS();
    }

    setupPDFJS() {
        // Configurar PDF.js para usar worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    initializeEventListeners() {
        // Upload elements
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const uploadBtn = document.getElementById('upload-btn');

        // Split method radio buttons
        const splitMethodRadios = document.querySelectorAll('input[name="split-method"]');
        
        // Action buttons
        const splitBtn = document.getElementById('split-btn');
        const clearSelectionBtn = document.getElementById('clear-selection');
        const downloadAllBtn = document.getElementById('download-all-btn');

        // File upload events
        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));

        // Drag and drop events
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type === 'application/pdf') {
                this.handleFileSelect(files[0]);
            } else {
                this.showError('Por favor, selecione um arquivo PDF válido.');
            }
        });

        // Split method change events
        splitMethodRadios.forEach(radio => {
            radio.addEventListener('change', () => this.handleSplitMethodChange());
        });

        // Action button events
        splitBtn.addEventListener('click', () => this.splitPDF());
        clearSelectionBtn.addEventListener('click', () => this.clearPageSelection());
        downloadAllBtn.addEventListener('click', () => this.downloadAllFragments());
    }

    async handleFileSelect(file) {
        if (!file || file.type !== 'application/pdf') {
            this.showError('Por favor, selecione um arquivo PDF válido.');
            return;
        }

        this.showLoading(true);
        
        try {
            // Ler o arquivo como ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();
            this.currentPDF = arrayBuffer;
            
            // Carregar o PDF com PDF.js para visualização
            this.pdfDocument = await pdfjsLib.getDocument(arrayBuffer).promise;
            
            // Mostrar informações do PDF
            await this.displayPDFPreview();
            
            // Mostrar seções relevantes
            this.showSection('preview-section');
            this.showSection('split-section');
            
        } catch (error) {
            console.error('Erro ao carregar PDF:', error);
            this.showError('Erro ao carregar o arquivo PDF. Verifique se o arquivo não está corrompido.');
        } finally {
            this.showLoading(false);
        }
    }

    async displayPDFPreview() {
        const thumbnailsContainer = document.getElementById('thumbnails-container');
        const pageCountElement = document.getElementById('page-count');
        
        // Limpar container
        thumbnailsContainer.innerHTML = '';
        this.selectedPages.clear();
        
        // Atualizar contador de páginas
        const numPages = this.pdfDocument.numPages;
        pageCountElement.textContent = numPages;
        
        // Gerar miniaturas para cada página
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            await this.createThumbnail(pageNum, thumbnailsContainer);
        }
    }

    async createThumbnail(pageNum, container) {
        try {
            const page = await this.pdfDocument.getPage(pageNum);
            
            // Configurar canvas para thumbnail
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            // Calcular escala para thumbnail (150px de largura máxima)
            const viewport = page.getViewport({ scale: 1 });
            const scale = Math.min(150 / viewport.width, 200 / viewport.height);
            const scaledViewport = page.getViewport({ scale });
            
            canvas.width = scaledViewport.width;
            canvas.height = scaledViewport.height;
            
            // Renderizar página no canvas
            await page.render({
                canvasContext: context,
                viewport: scaledViewport
            }).promise;
            
            // Criar elemento thumbnail
            const thumbnailDiv = document.createElement('div');
            thumbnailDiv.className = 'thumbnail border-2 border-gray-200 rounded-lg p-2 cursor-pointer hover:shadow-md';
            thumbnailDiv.dataset.pageNum = pageNum;
            
            thumbnailDiv.innerHTML = `
                <div class="text-center">
                    <div class="mb-2">
                        ${canvas.outerHTML}
                    </div>
                    <div class="text-xs text-gray-600">Página ${pageNum}</div>
                </div>
            `;
            
            // Adicionar evento de clique para seleção
            thumbnailDiv.addEventListener('click', () => this.togglePageSelection(pageNum, thumbnailDiv));
            
            container.appendChild(thumbnailDiv);
            
        } catch (error) {
            console.error(`Erro ao criar thumbnail da página ${pageNum}:`, error);
        }
    }

    togglePageSelection(pageNum, thumbnailElement) {
        const splitMethod = document.querySelector('input[name="split-method"]:checked').value;
        
        if (splitMethod !== 'specific') {
            // Se não estiver no modo de seleção específica, mudar para esse modo
            document.querySelector('input[name="split-method"][value="specific"]').checked = true;
            this.handleSplitMethodChange();
        }
        
        if (this.selectedPages.has(pageNum)) {
            this.selectedPages.delete(pageNum);
            thumbnailElement.classList.remove('page-selected');
        } else {
            this.selectedPages.add(pageNum);
            thumbnailElement.classList.add('page-selected');
        }
        
        this.updateSelectionInfo();
    }

    clearPageSelection() {
        this.selectedPages.clear();
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.classList.remove('page-selected');
        });
        this.updateSelectionInfo();
    }

    updateSelectionInfo() {
        const selectionInfo = document.getElementById('selection-info');
        const selectedPagesText = document.getElementById('selected-pages-text');
        
        if (this.selectedPages.size > 0) {
            const sortedPages = Array.from(this.selectedPages).sort((a, b) => a - b);
            selectedPagesText.textContent = `Páginas selecionadas: ${sortedPages.join(', ')}`;
            selectionInfo.classList.remove('hidden');
        } else {
            selectedPagesText.textContent = 'Nenhuma página selecionada';
            selectionInfo.classList.add('hidden');
        }
    }

    handleSplitMethodChange() {
        const splitMethod = document.querySelector('input[name="split-method"]:checked').value;
        
        // Esconder todas as opções
        document.getElementById('range-options').classList.add('hidden');
        document.getElementById('specific-options').classList.add('hidden');
        document.getElementById('size-options').classList.add('hidden');
        
        // Mostrar opção selecionada
        switch (splitMethod) {
            case 'range':
                document.getElementById('range-options').classList.remove('hidden');
                break;
            case 'specific':
                document.getElementById('specific-options').classList.remove('hidden');
                break;
            case 'size':
                document.getElementById('size-options').classList.remove('hidden');
                break;
        }
    }

    async splitPDF() {
        if (!this.currentPDF || !this.pdfDocument) {
            this.showError('Nenhum PDF carregado.');
            return;
        }

        // Validar entradas do usuário
        if (!this.validateInputs()) {
            return;
        }

        this.showLoading(true);
        this.updateProgress('Preparando fragmentação...');
        
        try {
            const splitMethod = document.querySelector('input[name="split-method"]:checked').value;
            let splitRanges = [];
            
            switch (splitMethod) {
                case 'range':
                    this.updateProgress('Calculando intervalos de páginas...');
                    splitRanges = this.calculateRangeSplit();
                    break;
                case 'specific':
                    this.updateProgress('Preparando páginas selecionadas...');
                    splitRanges = this.calculateSpecificSplit();
                    break;
                case 'size':
                    this.updateProgress('Analisando tamanho das páginas...');
                    splitRanges = await this.calculateSizeSplit();
                    break;
            }
            
            if (splitRanges.length === 0) {
                this.showError('Nenhuma página selecionada para fragmentação.');
                return;
            }
            
            // Gerar fragmentos
            this.fragments = [];
            for (let i = 0; i < splitRanges.length; i++) {
                const range = splitRanges[i];
                const progress = ((i + 1) / splitRanges.length) * 100;
                this.updateProgress(`Gerando fragmento ${i + 1} de ${splitRanges.length}...`, progress);
                
                const fragment = await this.createPDFFragment(range, i + 1);
                this.fragments.push(fragment);
            }
            
            // Mostrar resultados
            this.displayResults();
            this.showSection('results-section');
            
            // Scroll para os resultados
            document.getElementById('results-section').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
            
        } catch (error) {
            console.error('Erro ao fragmentar PDF:', error);
            const errorMessage = this.handleSpecificErrors(error);
            this.showError(errorMessage);
        } finally {
            this.showLoading(false);
        }
    }

    calculateRangeSplit() {
        const pagesPerSplit = parseInt(document.getElementById('pages-per-split').value) || 1;
        const totalPages = this.pdfDocument.numPages;
        const ranges = [];
        
        for (let start = 1; start <= totalPages; start += pagesPerSplit) {
            const end = Math.min(start + pagesPerSplit - 1, totalPages);
            ranges.push({ start, end, pages: this.generatePageRange(start, end) });
        }
        
        return ranges;
    }

    calculateSpecificSplit() {
        if (this.selectedPages.size === 0) {
            return [];
        }
        
        const sortedPages = Array.from(this.selectedPages).sort((a, b) => a - b);
        return [{ start: sortedPages[0], end: sortedPages[sortedPages.length - 1], pages: sortedPages }];
    }

    async calculateSizeSplit() {
        const maxSizeMB = parseFloat(document.getElementById('max-size-mb').value) || 5;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        const totalPages = this.pdfDocument.numPages;
        
        // Carregar PDF com PDF-lib para análise de tamanho
        const pdfDoc = await PDFLib.PDFDocument.load(this.currentPDF);
        const ranges = [];
        let currentRange = [];
        let currentSize = 0;
        
        for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
            // Criar PDF temporário com a página atual para medir o tamanho
            const tempDoc = await PDFLib.PDFDocument.create();
            const [copiedPage] = await tempDoc.copyPages(pdfDoc, [pageIndex]);
            tempDoc.addPage(copiedPage);
            
            const pageBytes = await tempDoc.save();
            const pageSize = pageBytes.length;
            
            // Se adicionar esta página exceder o limite e já temos páginas no range atual
            if (currentSize + pageSize > maxSizeBytes && currentRange.length > 0) {
                // Finalizar range atual
                ranges.push({
                    start: currentRange[0],
                    end: currentRange[currentRange.length - 1],
                    pages: [...currentRange]
                });
                
                // Iniciar novo range
                currentRange = [pageIndex + 1];
                currentSize = pageSize;
            } else {
                // Adicionar página ao range atual
                currentRange.push(pageIndex + 1);
                currentSize += pageSize;
            }
        }
        
        // Adicionar último range se não estiver vazio
        if (currentRange.length > 0) {
            ranges.push({
                start: currentRange[0],
                end: currentRange[currentRange.length - 1],
                pages: [...currentRange]
            });
        }
        
        return ranges;
    }

    generatePageRange(start, end) {
        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    }

    async createPDFFragment(range, fragmentIndex) {
        try {
            // Usar PDF-lib para criar novo PDF com páginas selecionadas
            const pdfDoc = await PDFLib.PDFDocument.load(this.currentPDF);
            const newPdfDoc = await PDFLib.PDFDocument.create();
            
            // Copiar páginas selecionadas
            const pageIndices = range.pages.map(p => p - 1); // PDF-lib usa índices baseados em 0
            const copiedPages = await newPdfDoc.copyPages(pdfDoc, pageIndices);
            
            copiedPages.forEach(page => {
                newPdfDoc.addPage(page);
            });
            
            // Gerar PDF como bytes
            const pdfBytes = await newPdfDoc.save();
            
            // Criar nome do arquivo
            const fileName = `fragmento_${fragmentIndex}_paginas_${range.pages.join('-')}.pdf`;
            
            return {
                name: fileName,
                bytes: pdfBytes,
                pages: range.pages,
                size: pdfBytes.length
            };
            
        } catch (error) {
            console.error('Erro ao criar fragmento:', error);
            throw error;
        }
    }

    displayResults() {
        const container = document.getElementById('fragments-container');
        container.innerHTML = '';
        
        this.fragments.forEach((fragment, index) => {
            const fragmentDiv = document.createElement('div');
            fragmentDiv.className = 'flex items-center justify-between p-4 border border-gray-200 rounded-lg';
            
            const sizeKB = (fragment.size / 1024).toFixed(1);
            const sizeMB = (fragment.size / (1024 * 1024)).toFixed(2);
            const sizeText = fragment.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;
            
            fragmentDiv.innerHTML = `
                <div class="flex items-center space-x-4">
                    <i class="fas fa-file-pdf text-red-500 text-xl"></i>
                    <div>
                        <div class="font-medium text-gray-800">${fragment.name}</div>
                        <div class="text-sm text-gray-600">
                            Páginas: ${fragment.pages.join(', ')} | Tamanho: ${sizeText}
                        </div>
                    </div>
                </div>
                <button class="download-fragment-btn bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200" 
                        data-fragment-index="${index}">
                    <i class="fas fa-download mr-2"></i>
                    Baixar
                </button>
            `;
            
            container.appendChild(fragmentDiv);
        });
        
        // Adicionar eventos de download individual
        document.querySelectorAll('.download-fragment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const fragmentIndex = parseInt(e.target.dataset.fragmentIndex);
                this.downloadFragment(fragmentIndex);
            });
        });
    }

    downloadFragment(index) {
        if (index < 0 || index >= this.fragments.length) return;
        
        const fragment = this.fragments[index];
        const blob = new Blob([fragment.bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fragment.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async downloadAllFragments() {
        if (this.fragments.length === 0) return;
        
        this.showLoading(true);
        
        try {
            const zip = new JSZip();
            
            // Adicionar todos os fragmentos ao ZIP
            this.fragments.forEach(fragment => {
                zip.file(fragment.name, fragment.bytes);
            });
            
            // Gerar ZIP
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            
            // Fazer download do ZIP
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'fragmentos_pdf.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Erro ao criar ZIP:', error);
            this.showError('Erro ao criar arquivo ZIP.');
        } finally {
            this.showLoading(false);
        }
    }

    showSection(sectionId) {
        document.getElementById(sectionId).classList.remove('hidden');
    }

    hideSection(sectionId) {
        document.getElementById(sectionId).classList.add('hidden');
    }

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }

    showError(message) {
        // Criar notificação de erro
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50';
        errorDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-exclamation-triangle mr-3"></i>
                <span>${message}</span>
                <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Remover automaticamente após 5 segundos
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }
}

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Verificar suporte do navegador
    checkBrowserSupport();
    
    // Inicializar aplicação
    const app = new PDFSplitter();
    app.initializeKeyboardSupport();
});



    // Função para resetar a aplicação
    resetApplication() {
        this.currentPDF = null;
        this.pdfDocument = null;
        this.selectedPages.clear();
        this.fragments = [];
        
        // Esconder seções
        this.hideSection('preview-section');
        this.hideSection('split-section');
        this.hideSection('results-section');
        
        // Limpar containers
        document.getElementById('thumbnails-container').innerHTML = '';
        document.getElementById('fragments-container').innerHTML = '';
        document.getElementById('page-count').textContent = '0';
        
        // Resetar formulário
        document.getElementById('file-input').value = '';
        document.querySelector('input[name="split-method"][value="range"]').checked = true;
        this.handleSplitMethodChange();
    }

    // Função para validar entrada do usuário
    validateInputs() {
        const splitMethod = document.querySelector('input[name="split-method"]:checked').value;
        
        switch (splitMethod) {
            case 'range':
                const pagesPerSplit = parseInt(document.getElementById('pages-per-split').value);
                if (!pagesPerSplit || pagesPerSplit < 1) {
                    this.showError('Por favor, insira um número válido de páginas por fragmento.');
                    return false;
                }
                break;
                
            case 'specific':
                if (this.selectedPages.size === 0) {
                    this.showError('Por favor, selecione pelo menos uma página.');
                    return false;
                }
                break;
                
            case 'size':
                const maxSize = parseFloat(document.getElementById('max-size-mb').value);
                if (!maxSize || maxSize <= 0) {
                    this.showError('Por favor, insira um tamanho máximo válido.');
                    return false;
                }
                break;
        }
        
        return true;
    }

    // Função para mostrar progresso durante operações longas
    updateProgress(message, percentage = null) {
        const overlay = document.getElementById('loading-overlay');
        const existingMessage = overlay.querySelector('p');
        if (existingMessage) {
            existingMessage.textContent = message;
        }
        
        if (percentage !== null) {
            let progressBar = overlay.querySelector('.progress-bar');
            if (!progressBar) {
                progressBar = document.createElement('div');
                progressBar.className = 'progress-bar w-full bg-gray-200 rounded-full h-2 mt-4';
                progressBar.innerHTML = '<div class="bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>';
                overlay.querySelector('.bg-white').appendChild(progressBar);
            }
            
            const progressFill = progressBar.querySelector('div');
            progressFill.style.width = `${percentage}%`;
        }
    }

    // Função para formatar tamanho de arquivo
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Função para mostrar informações detalhadas do PDF
    showPDFInfo() {
        if (!this.pdfDocument) return;
        
        const info = {
            pages: this.pdfDocument.numPages,
            size: this.formatFileSize(this.currentPDF.byteLength)
        };
        
        // Adicionar informações à interface se necessário
        console.log('PDF Info:', info);
    }

    // Função para detectar e tratar erros específicos
    handleSpecificErrors(error) {
        if (error.message.includes('Invalid PDF')) {
            return 'O arquivo selecionado não é um PDF válido.';
        } else if (error.message.includes('Password')) {
            return 'Este PDF está protegido por senha. Por favor, use um PDF sem proteção.';
        } else if (error.message.includes('Corrupted')) {
            return 'O arquivo PDF parece estar corrompido.';
        } else if (error.message.includes('Memory')) {
            return 'Arquivo muito grande para processar. Tente um PDF menor.';
        }
        
        return 'Erro inesperado ao processar o PDF.';
    }

    // Função para adicionar suporte a teclado
    initializeKeyboardSupport() {
        document.addEventListener('keydown', (e) => {
            // Esc para limpar seleção
            if (e.key === 'Escape') {
                this.clearPageSelection();
            }
            
            // Ctrl+A para selecionar todas as páginas (no modo específico)
            if (e.ctrlKey && e.key === 'a' && this.pdfDocument) {
                e.preventDefault();
                document.querySelector('input[name="split-method"][value="specific"]').checked = true;
                this.handleSplitMethodChange();
                
                // Selecionar todas as páginas
                for (let i = 1; i <= this.pdfDocument.numPages; i++) {
                    this.selectedPages.add(i);
                    const thumbnail = document.querySelector(`[data-page-num="${i}"]`);
                    if (thumbnail) {
                        thumbnail.classList.add('page-selected');
                    }
                }
                this.updateSelectionInfo();
            }
        });
    }
}

// Adicionar suporte para Service Worker (para funcionamento offline)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Registrar service worker se disponível
        console.log('Service Worker support detected');
    });
}

// Função utilitária para detectar recursos do navegador
function checkBrowserSupport() {
    const features = {
        fileAPI: !!(window.File && window.FileReader && window.FileList && window.Blob),
        dragDrop: 'draggable' in document.createElement('div'),
        canvas: !!document.createElement('canvas').getContext,
        webAssembly: typeof WebAssembly === 'object'
    };
    
    const unsupported = Object.entries(features)
        .filter(([key, supported]) => !supported)
        .map(([key]) => key);
    
    if (unsupported.length > 0) {
        console.warn('Recursos não suportados:', unsupported);
        // Mostrar aviso ao usuário se necessário
    }
    
    return features;
}

