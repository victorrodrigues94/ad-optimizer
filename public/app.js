document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('optimizerForm');
    const results = document.getElementById('results');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Otimizando...';
        submitButton.disabled = true;

        try {
            const formData = {
                marketplace: form.querySelector('input[name="marketplace"]:checked').value,
                category: document.getElementById('category').value,
                title: document.getElementById('title').value,
                description: document.getElementById('description').value
            };

            // Fazer a chamada para a API
            const response = await fetch('/api/optimize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Erro ao otimizar anúncio');
            }

            const data = await response.json();

            // Atualizar a interface com os resultados
            document.getElementById('optimizedTitle').textContent = data.optimizedTitle;
            document.getElementById('optimizedDescription').textContent = data.optimizedDescription;
            
            // Atualizar scores
            document.getElementById('seoScore').textContent = data.analysis.seoScore;
            document.getElementById('conversionScore').textContent = data.analysis.conversionScore;

            // Atualizar listas de análise
            updateList('strengths', data.analysis.strengths);
            updateList('weaknesses', data.analysis.weaknesses);
            updateList('suggestions', data.analysis.suggestions);

            // Mostrar resultados
            results.classList.remove('hidden');
            
            // Scroll suave até os resultados
            results.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Erro:', error);
            alert('Ocorreu um erro ao otimizar o anúncio. Por favor, tente novamente.');
        } finally {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });

    function updateList(elementId, items) {
        const ul = document.getElementById(elementId);
        ul.innerHTML = '';
        items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            ul.appendChild(li);
        });
    }

    // Adicionar efeito hover nos cards de marketplace
    const marketplaceCards = document.querySelectorAll('.marketplace-card');
    marketplaceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (!card.previousElementSibling.checked) {
                card.style.transform = 'translateY(-2px)';
                card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }
        });

        card.addEventListener('mouseleave', () => {
            if (!card.previousElementSibling.checked) {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = 'none';
            }
        });
    });
}); 