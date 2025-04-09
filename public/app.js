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

            const response = await fetch('/api/optimize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    marketplace,
                    category,
                    title,
                    description
                })
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