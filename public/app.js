document.addEventListener('DOMContentLoaded', () => {
    // Sidebar functionality
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const toggleButton = document.querySelector('.toggle-sidebar');
    const logoutButton = document.getElementById('logout');

    // Toggle sidebar
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        });
    }

    // Handle logout
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }

    // Form submission
    const form = document.getElementById('optimizerForm');
    const results = document.getElementById('results');
    const submitButton = form?.querySelector('.submit-button');

    if (!form || !results || !submitButton) {
        console.error('Elementos do formulário não encontrados');
        return;
    }

    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay hidden';
    loadingOverlay.innerHTML = `
        <div class="loading-content">
            <div class="spinner"></div>
            <p>Processando sua solicitação...</p>
            <p class="loading-status">Iniciando otimização...</p>
        </div>
    `;
    document.body.appendChild(loadingOverlay);

    // Image Upload Functionality
    const MAX_IMAGES = 12;
    const dropzone = document.getElementById('imageDropzone');
    const imageInput = document.getElementById('imageInput');
    const imagePreviewGrid = document.getElementById('imagePreviewGrid');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = uploadProgress.querySelector('.progress-fill');
    const progressText = uploadProgress.querySelector('.progress-text');
    let uploadedImages = [];

    // Handle click on dropzone
    dropzone.addEventListener('click', () => {
        imageInput.click();
    });

    // Handle file selection
    imageInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Handle drag and drop
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    function handleFiles(files) {
        const remainingSlots = MAX_IMAGES - uploadedImages.length;
        if (remainingSlots <= 0) {
            showError('Você já atingiu o limite máximo de 12 imagens.');
            return;
        }

        const validFiles = Array.from(files)
            .filter(file => file.type.startsWith('image/'))
            .slice(0, remainingSlots);

        if (validFiles.length === 0) {
            showError('Por favor, selecione apenas arquivos de imagem.');
            return;
        }

        uploadProgress.classList.add('visible');
        let uploadedCount = 0;

        validFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target.result;
                uploadedImages.push({
                    file,
                    url: imageUrl
                });
                addImagePreview(imageUrl, uploadedImages.length - 1);
                
                uploadedCount++;
                const progress = (uploadedCount / validFiles.length) * 100;
                updateProgress(progress);
                
                if (uploadedCount === validFiles.length) {
                    setTimeout(() => {
                        uploadProgress.classList.remove('visible');
                        progressFill.style.width = '0%';
                        progressText.textContent = '0%';
                    }, 500);
                }
            };
            reader.readAsDataURL(file);
        });
    }

    function addImagePreview(imageUrl, index) {
        const preview = document.createElement('div');
        preview.className = 'image-preview';
        preview.innerHTML = `
            <img src="${imageUrl}" alt="Preview">
            <div class="image-actions">
                <button class="image-action download" title="Download">
                    <i class="fas fa-download"></i>
                </button>
                <button class="image-action remove" title="Remover">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="upscale-options">
                <select class="upscale-scale">
                    <option value="2">2x</option>
                    <option value="3">3x</option>
                    <option value="4">4x</option>
                </select>
                <button class="upscale-button">Upscale</button>
            </div>
            <div class="upscale-progress">
                <div class="upscale-progress-fill"></div>
            </div>
        `;
        
        const removeButton = preview.querySelector('.remove');
        const downloadButton = preview.querySelector('.download');
        const upscaleButton = preview.querySelector('.upscale-button');
        const scaleSelect = preview.querySelector('.upscale-scale');
        const progressFill = preview.querySelector('.upscale-progress-fill');
        
        removeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const indexToRemove = parseInt(e.target.closest('.remove').dataset.index);
            uploadedImages.splice(indexToRemove, 1);
            updateImagePreviews();
        });
        
        downloadButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const image = uploadedImages[index];
            const link = document.createElement('a');
            link.href = image.url;
            link.download = `upscaled_image_${index + 1}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
        
        upscaleButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            const image = uploadedImages[index];
            const scale = parseInt(scaleSelect.value);
            
            try {
                upscaleButton.disabled = true;
                progressFill.style.width = '0%';
                
                const response = await fetch('/api/upscale', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        imageUrl: image.url,
                        scale: scale
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Erro ao fazer upscale da imagem');
                }
                
                const data = await response.json();
                
                // Update the image with the upscaled version
                uploadedImages[index].url = data.url;
                preview.querySelector('img').src = data.url;
                
                progressFill.style.width = '100%';
                setTimeout(() => {
                    progressFill.style.width = '0%';
                }, 1000);
                
            } catch (error) {
                console.error('Erro no upscale:', error);
                showError('Erro ao fazer upscale da imagem. Por favor, tente novamente.');
            } finally {
                upscaleButton.disabled = false;
            }
        });
        
        imagePreviewGrid.appendChild(preview);
    }

    function updateImagePreviews() {
        imagePreviewGrid.innerHTML = '';
        uploadedImages.forEach((image, index) => {
            addImagePreview(image.url, index);
        });
    }

    function updateProgress(progress) {
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
    }

    function showError(message) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        `;
        
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        dropzone.parentNode.insertBefore(errorMessage, dropzone);
        
        setTimeout(() => {
            errorMessage.remove();
        }, 3000);
    }

    // Modify form submission to include images
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            console.log('Iniciando processo de otimização...');
            
            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                Processando...
            `;
            loadingOverlay.classList.remove('hidden');
            loadingOverlay.querySelector('.loading-status').textContent = 'Iniciando otimização...';
            
            // Get form data
            const marketplace = "Mercado Livre"; // Set Mercado Livre as default
            const category = document.getElementById('category')?.value;
            if (!category) {
                throw new Error('Por favor, selecione uma categoria');
            }
            
            const title = document.getElementById('title')?.value;
            const description = document.getElementById('description')?.value;
            
            if (!title || !description) {
                throw new Error('Por favor, preencha o título e a descrição');
            }
            
            console.log('Dados do anúncio:', {
                marketplace,
                category,
                title,
                description
            });

            loadingOverlay.querySelector('.loading-status').textContent = 'Enviando dados para otimização...';
            console.log('Enviando requisição para o servidor...');

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
            }

            // Add images to form data
            const formData = new FormData();
            uploadedImages.forEach((image, index) => {
                formData.append(`images[${index}]`, image.file);
            });
            
            // Add other form data
            formData.append('marketplace', marketplace);
            formData.append('category', category);
            formData.append('title', title);
            formData.append('description', description);
            
            // Update fetch call to use FormData
            const response = await fetch('/api/optimize', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            console.log('Resposta recebida:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Erro na resposta:', errorData);
                throw new Error(errorData.message || 'Erro ao processar a otimização');
            }

            loadingOverlay.querySelector('.loading-status').textContent = 'Processando resultados...';
            const data = await response.json();
            console.log('Dados recebidos:', data);
            
            // Update results
            const optimizedTitle = document.getElementById('optimizedTitle');
            const optimizedDescription = document.getElementById('optimizedDescription');
            const seoScore = document.getElementById('seoScore');
            const conversionScore = document.getElementById('conversionScore');
            
            if (optimizedTitle) optimizedTitle.textContent = data.optimizedTitle;
            if (optimizedDescription) {
                // Preserve line breaks and formatting
                optimizedDescription.innerHTML = data.optimizedDescription
                    .replace(/\n/g, '<br>')
                    .replace(/- /g, '• ');
            }
            if (seoScore) seoScore.textContent = `${data.analysis.seoScore}/10`;
            if (conversionScore) conversionScore.textContent = `${data.analysis.conversionScore}/10`;
            
            // Update lists
            const strengthsList = document.getElementById('strengths');
            const weaknessesList = document.getElementById('weaknesses');
            const suggestionsList = document.getElementById('suggestions');
            
            if (strengthsList) strengthsList.innerHTML = data.analysis.strengths.map(item => `<li>${item}</li>`).join('');
            if (weaknessesList) weaknessesList.innerHTML = data.analysis.weaknesses.map(item => `<li>${item}</li>`).join('');
            if (suggestionsList) suggestionsList.innerHTML = data.analysis.suggestions.map(item => `<li>${item}</li>`).join('');

            // Update image analysis if available
            if (data.imageAnalysis) {
                console.log('Análise de imagens disponível:', data.imageAnalysis);
                const imageAnalysisSection = document.createElement('div');
                imageAnalysisSection.className = 'result-section';
                imageAnalysisSection.innerHTML = `
                    <h3>
                        <i class="fas fa-images"></i>
                        Análise das Imagens
                    </h3>
                    <div class="result-content">
                        <p><strong>Análise Geral:</strong> ${data.imageAnalysis.analysis}</p>
                        <div class="image-suggestions">
                            <h4>Sugestões de Melhorias:</h4>
                            <ul>
                                ${data.imageAnalysis.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="image-sequence">
                            <h4>Sequência Ideal das Fotos:</h4>
                            <ol>
                                ${data.imageAnalysis.idealSequence.map(sequence => `<li>${sequence}</li>`).join('')}
                            </ol>
                        </div>
                    </div>
                `;
                results.insertBefore(imageAnalysisSection, results.firstChild);
            }
            
            // Show results
            results.classList.remove('hidden');
            
            // Scroll to results
            results.scrollIntoView({ behavior: 'smooth' });

            console.log('Processo de otimização concluído com sucesso!');
            
        } catch (error) {
            console.error('Erro durante o processo:', error);
            
            // Show error message to user
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                <p>${error.message || 'Ocorreu um erro durante a otimização. Por favor, tente novamente.'}</p>
            `;
            
            // Remove any existing error message
            const existingError = document.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            
            // Insert error message before the form
            form.parentNode.insertBefore(errorMessage, form);
            
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = `
                <i class="fas fa-magic"></i>
                Otimizar Anúncio
            `;
            
            // Hide loading overlay
            loadingOverlay.classList.add('hidden');
        }
    });

    // Remove marketplace card hover effects since they're no longer needed
}); 