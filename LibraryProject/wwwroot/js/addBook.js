document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('addBookForm');
    const inputs = form.querySelectorAll('input[type="number"]');

    // Add animation class to form groups on focus
    document.querySelectorAll('.form-group').forEach(group => {
        const input = group.querySelector('.form-control');
        if (input) {
            input.addEventListener('focus', () => {
                group.classList.add('focused');
            });

            input.addEventListener('blur', () => {
                if (!input.value) {
                    group.classList.remove('focused');
                }
            });
        }
    });

    // Validate number inputs
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            const min = parseFloat(this.min);
            const max = parseFloat(this.max);
            let value = parseFloat(this.value);

            if (this.value === '') return;

            if (min !== undefined && !isNaN(min) && value < min) {
                value = min;
            }
            if (max !== undefined && !isNaN(max) && value > max) {
                value = max;
            }

            this.value = value;
        });
    });

    // Ensure Available Copies doesn't exceed Total Copies
    const totalCopiesInput = form.querySelector('[name="TotalCopies"]');
    const availableCopiesInput = form.querySelector('[name="AvailableCopies"]');

    if (totalCopiesInput && availableCopiesInput) {
        availableCopiesInput.addEventListener('input', function() {
            const totalCopies = parseInt(totalCopiesInput.value) || 0;
            const availableCopies = parseInt(this.value) || 0;

            if (availableCopies > totalCopies) {
                this.value = totalCopies;
            }
        });

        totalCopiesInput.addEventListener('input', function() {
            const totalCopies = parseInt(this.value) || 0;
            const availableCopies = parseInt(availableCopiesInput.value) || 0;

            if (availableCopies > totalCopies) {
                availableCopiesInput.value = totalCopies;
            }
        });
    }

    // Form submission handling
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Basic validation
        let isValid = true;
        const requiredFields = ['Title', 'Author', 'Genre', 'Publisher'];

        requiredFields.forEach(field => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input && !input.value.trim()) {
                isValid = false;
                input.classList.add('invalid');
            }
        });

        if (!isValid) {
            showMessage('Please fill in all required fields', 'error');
            return;
        }

        // If validation passes, submit the form
        this.submit();
    });

    // Helper function to show messages
    function showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = message;

        const container = document.querySelector('.form-container');
        container.insertBefore(messageDiv, form);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
});
