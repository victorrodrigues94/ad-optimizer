document.addEventListener('DOMContentLoaded', () => {
    // Sidebar functionality
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const toggleButton = document.querySelector('.toggle-sidebar');
    const logoutButton = document.getElementById('logout');

    // Toggle sidebar
    toggleButton.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    });

    // Handle logout
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });

    // Form submission
    const form = document.getElementById('optimizerForm');
    const results = document.getElementById('results');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            marketplace: document.querySelector('input[name="marketplace"]:checked').value,
            category: document.getElementById('category').value,
            title: document.getElementById('title').value,
            description: document.getElementById('description').value
        };

        try {
            const response = await fetch('/api/optimize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                
                // Update results
                document.getElementById('optimizedTitle').textContent = data.optimizedTitle;
                document.getElementById('optimizedDescription').textContent = data.optimizedDescription;
                document.getElementById('seoScore').textContent = `${data.analysis.seoScore}/10`;
                document.getElementById('conversionScore').textContent = `${data.analysis.conversionScore}/10`;
                
                // Update lists
                const strengthsList = document.getElementById('strengths');
                const weaknessesList = document.getElementById('weaknesses');
                const suggestionsList = document.getElementById('suggestions');
                
                strengthsList.innerHTML = data.analysis.strengths.map(item => `<li>${item}</li>`).join('');
                weaknessesList.innerHTML = data.analysis.weaknesses.map(item => `<li>${item}</li>`).join('');
                suggestionsList.innerHTML = data.analysis.suggestions.map(item => `<li>${item}</li>`).join('');
                
                // Show results
                results.classList.remove('hidden');
                
                // Scroll to results
                results.scrollIntoView({ behavior: 'smooth' });
            } else {
                const error = await response.json();
                alert(error.message || 'Erro ao processar a otimização');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Erro ao processar a otimização. Por favor, tente novamente.');
        }
    });

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