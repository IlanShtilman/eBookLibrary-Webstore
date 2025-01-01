document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('addBookForm');
    const inputs = form.querySelectorAll('input[type="number"]');
    const buyPriceInput = document.getElementById('buyPrice');
    const discountedPriceInput = document.getElementById('discountedBuyPrice');

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

    // Enhanced discount price validation
    if (discountedPriceInput && buyPriceInput) {
        function validateDiscountPrice() {
            const buyPrice = parseFloat(buyPriceInput.value) || 0;
            const discountPrice = parseFloat(discountedPriceInput.value) || 0;

            if (discountPrice > 0 && discountPrice >= buyPrice) {
                discountedPriceInput.setCustomValidity('Discounted price must be lower than the buy price');
                showMessage('Discounted price must be lower than the buy price', 'error');
                return false;
            } else {
                discountedPriceInput.setCustomValidity('');
                return true;
            }
        }

        discountedPriceInput.addEventListener('input', validateDiscountPrice);
        discountedPriceInput.addEventListener('change', validateDiscountPrice);
        buyPriceInput.addEventListener('change', validateDiscountPrice);
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
                showMessage(`Please enter a ${field.toLowerCase()}`, 'error');
            }
        });

        if (!isValid) {
            return;
        }

        // Enhanced discount price validation before submission
        const buyPrice = parseFloat(buyPriceInput.value) || 0;
        const discountPrice = parseFloat(discountedPriceInput.value) || 0;

        if (discountPrice > 0 && discountPrice >= buyPrice) {
            showMessage('Discounted price must be lower than the buy price', 'error');
            return;
        }

        // Validate image URL if provided
        const imageUrlInput = form.querySelector('[name="ImageUrl"]');
        if (imageUrlInput && imageUrlInput.value) {
            try {
                new URL(imageUrlInput.value);
            } catch (e) {
                showMessage('Please enter a valid image URL', 'error');
                return;
            }
        }

        // If validation passes, submit the form
        this.submit();
    });

    // Helper function to show messages
    function showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.textContent = message;

        const container = document.querySelector('.form-container');
        container.insertBefore(messageDiv, form);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
});