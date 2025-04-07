document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');

    // Toggle password visibility
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.parentElement.querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            button.querySelector('i').classList.toggle('fa-eye');
            button.querySelector('i').classList.toggle('fa-eye-slash');
        });
    });

    // Handle form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const phone = document.getElementById('phone').value;

        // Validate password match
        if (password !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        // Validate password strength
        if (password.length < 8) {
            alert('A senha deve ter pelo menos 8 caracteres!');
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    phone
                })
            });

            if (response.ok) {
                alert('Cadastro realizado com sucesso!');
                window.location.href = 'login.html';
            } else {
                const error = await response.json();
                alert(error.message || 'Erro ao realizar cadastro. Por favor, tente novamente.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Erro ao realizar cadastro. Por favor, tente novamente.');
        }
    });
}); 