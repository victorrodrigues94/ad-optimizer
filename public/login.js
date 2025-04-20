document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const googleButton = document.querySelector('.social-button.google');
    const facebookButton = document.querySelector('.social-button.facebook');
    const registerLink = document.querySelector('.register');
    const forgotPasswordLink = document.querySelector('.forgot-password');

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.querySelector('i').classList.toggle('fa-eye');
        togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // Handle form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.querySelector('input[name="remember"]').checked;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    remember
                })
            });

            if (response.ok) {
                const data = await response.json();
                // Store token in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                const error = await response.json();
                alert(error.message || 'Email ou senha inválidos');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Erro ao fazer login. Por favor, tente novamente.');
        }
    });

    // Handle Google login
    googleButton.addEventListener('click', () => {
        // TODO: Implement Google OAuth
        console.log('Google login clicked');
    });

    // Handle Facebook login
    facebookButton.addEventListener('click', () => {
        // TODO: Implement Facebook OAuth
        console.log('Facebook login clicked');
    });

    // Handle register link
    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'register.html';
    });

    // Handle forgot password link
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        // TODO: Show forgot password modal/form
        console.log('Forgot password clicked');
    });
}); 