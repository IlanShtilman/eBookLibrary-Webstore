function updateQuantity(bookId, change) {
    const quantityDisplay = document.getElementById(`quantity-${bookId}`);
    if (!quantityDisplay) return;

    let currentQuantity = parseInt(quantityDisplay.textContent);
    let newQuantity = currentQuantity + change;

    if (newQuantity < 1) {
        if (confirm('Remove this item from cart?')) {
            removeItem(bookId);
        }
        return;
    }

    fetch(`/ShoppingCart/UpdateQuantity?bookId=${bookId}&quantity=${newQuantity}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (quantityDisplay) {
                    quantityDisplay.textContent = newQuantity;
                }

                const priceElement = document.getElementById(`price-${bookId}`);
                if (priceElement) {
                    priceElement.textContent = `$${data.newPrice.toFixed(2)}`;
                }

                const subtotalElement = document.querySelector('.summary-item:first-child span:last-child');
                if (subtotalElement) {
                    subtotalElement.textContent = `$${data.newSubtotal.toFixed(2)}`;
                }

                const totalElement = document.querySelector('.summary-item.total-row span:last-child');
                if (totalElement) {
                    totalElement.textContent = `$${data.newTotal.toFixed(2)}`;
                }

                const checkoutButton = document.querySelector('.checkout-btn span:first-child');
                if (checkoutButton) {
                    checkoutButton.textContent = `$${data.newTotal.toFixed(2)}`;
                }

                const totalAmountInput = document.getElementById('totalAmount');
                if (totalAmountInput) {
                    totalAmountInput.value = data.newTotal.toFixed(2);
                }

                const itemCountElement = document.querySelector('.NumberItems');
                if (itemCountElement) {
                    itemCountElement.textContent = `You have ${data.itemCount} items in your cart`;
                }
            }
        })
        .catch(error => {
            console.error('Error updating quantity:', error);
        });
}


function removeItem(bookId) {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
        fetch(`/ShoppingCart/RemoveItem?bookId=${bookId}`, {
            method: 'POST'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const itemElement = document.querySelector(`.book-item[data-bookid="${bookId}"]`);
                    if (itemElement) {
                        itemElement.classList.add('fade-out');

                        setTimeout(() => {
                            if (itemElement && itemElement.parentNode) {
                                itemElement.remove();
                            }

                            // Safely update all summary elements
                            const subtotalElement = document.querySelector('.summary-item:first-child span:last-child');
                            if (subtotalElement) {
                                subtotalElement.textContent = `$${data.newSubtotal.toFixed(2)}`;
                            }

                            const totalElement = document.querySelector('.summary-item.total-row span:last-child');
                            if (totalElement) {
                                totalElement.textContent = `$${data.newTotal.toFixed(2)}`;
                            }

                            const checkoutButton = document.querySelector('.checkout-btn span:first-child');
                            if (checkoutButton) {
                                checkoutButton.textContent = `$${data.newTotal.toFixed(2)}`;
                            }

                            const totalAmountInput = document.getElementById('totalAmount');
                            if (totalAmountInput) {
                                totalAmountInput.value = data.newTotal.toFixed(2);
                            }

                            const itemCountElement = document.querySelector('.NumberItems');
                            if (itemCountElement) {
                                itemCountElement.textContent = `You have ${data.itemCount} items in your cart`;
                            }
                        }, 300);
                    }
                }
            })
            .catch(error => {
                console.error('Error removing item:', error);
            });
    }
}

function updateAction(bookId, newAction) {
    console.log('Attempting to update action:', { bookId, newAction });

    const selectElement = document.getElementById(`action-${bookId}`);
    if (!selectElement) {
        console.error('Select element not found');
        return;
    }

    const originalValue = selectElement.dataset.originalValue;

    fetch(`/ShoppingCart/UpdateAction?bookId=${bookId}&newAction=${newAction}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(async response => {
            console.log('Response status:', response.status);
            const text = await response.text();
            console.log('Raw response:', text);
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error('JSON parse error:', e);
                throw new Error('Invalid JSON response');
            }
        })
        .then(data => {
            console.log('Parsed response data:', data);
            if (data.success) {
                // Safely update elements with null checks
                const quantityElement = document.getElementById(`quantity-${bookId}`);
                if (quantityElement) {
                    quantityElement.textContent = data.newQuantity;
                }

                const priceElement = document.getElementById(`price-${bookId}`);
                if (priceElement) {
                    priceElement.textContent = `$${data.newPrice.toFixed(2)}`;
                }

                // Safely update summary elements
                const subtotalElement = document.querySelector('.summary-item:first-child span:last-child');
                if (subtotalElement) {
                    subtotalElement.textContent = `$${data.newSubtotal.toFixed(2)}`;
                }

                const totalRowElement = document.querySelector('.summary-item.total-row span:last-child');
                if (totalRowElement) {
                    totalRowElement.textContent = `$${data.newTotal.toFixed(2)}`;
                }

                const checkoutButton = document.querySelector('.checkout-btn span:first-child');
                if (checkoutButton) {
                    checkoutButton.textContent = `$${data.newTotal.toFixed(2)}`;
                }

                const totalAmountInput = document.getElementById('totalAmount');
                if (totalAmountInput) {
                    totalAmountInput.value = data.newTotal.toFixed(2);
                }

                // Safely update quantity buttons
                const plusButton = document.querySelector(`button[onclick="updateQuantity(${bookId}, 1)"]`);
                const minusButton = document.querySelector(`button[onclick="updateQuantity(${bookId}, -1)"]`);

                if (plusButton && minusButton) {
                    if (newAction.toLowerCase() === 'borrow') {
                        plusButton.disabled = true;
                        plusButton.classList.add('disabled');
                        minusButton.disabled = true;
                        minusButton.classList.add('disabled');
                    } else {
                        plusButton.disabled = false;
                        plusButton.classList.remove('disabled');
                        minusButton.disabled = false;
                        minusButton.classList.remove('disabled');
                    }
                }

                if (selectElement) {
                    selectElement.dataset.originalValue = newAction;
                }
            } else {
                if (selectElement) {
                    selectElement.value = originalValue;
                }
                alert(data.message || 'Could not update action. Please try again.');
            }
        })
        .catch(error => {
            console.error('Detailed error:', error);
            if (selectElement) {
                selectElement.value = originalValue;
            }
            alert('An error occurred while updating the action. Please try again.');
        });
}