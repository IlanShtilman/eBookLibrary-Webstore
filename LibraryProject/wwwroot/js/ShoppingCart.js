function updateQuantity(bookId, change) {
    const quantityDisplay = document.getElementById(`quantity-${bookId}`);
    let currentQuantity = parseInt(quantityDisplay.textContent);
    let newQuantity = currentQuantity + change;

    // If trying to reduce below 1, trigger remove item
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
                quantityDisplay.textContent = newQuantity;
                document.getElementById(`price-${bookId}`).textContent = `$${data.newPrice.toFixed(2)}`;
                document.querySelector('.summary-item:first-child span:last-child').textContent = `$${data.newSubtotal.toFixed(2)}`;
                document.querySelector('.summary-item.total-row span:last-child').textContent = `$${data.newTotal.toFixed(2)}`;
                document.querySelector('.checkout-btn span:first-child').textContent = `$${data.newTotal.toFixed(2)}`;

                // Update cart item count
                document.querySelector('.NumberItems').textContent = `You have ${data.itemCount} items in your cart`;
            }
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
                    // Find and remove the item element
                    const itemElement = document.querySelector(`.book-item[data-bookid="${bookId}"]`);
                    itemElement.classList.add('fade-out'); // Optional: add animation

                    setTimeout(() => {
                        itemElement.remove();

                        // Update totals
                        document.querySelector('.summary-item:first-child span:last-child')
                            .textContent = `$${data.newSubtotal.toFixed(2)}`;
                        document.querySelector('.summary-item.total-row span:last-child')
                            .textContent = `$${data.newTotal.toFixed(2)}`;
                        document.querySelector('.checkout-btn span:first-child')
                            .textContent = `$${data.newTotal.toFixed(2)}`;
                        document.querySelector('.NumberItems')
                            .textContent = `You have ${data.itemCount} items in your cart`;
                    }, 300); // Match this to your animation duration
                }
            });
    }
}

function updateAction(bookId, newAction) {
    const selectElement = document.getElementById(`action-${bookId}`);
    const originalValue = selectElement.dataset.originalValue; // Get original value

    fetch(`/ShoppingCart/UpdateAction?bookId=${bookId}&newAction=${newAction}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update quantity display to 1
                const quantityElement = document.getElementById(`quantity-${bookId}`);
                quantityElement.textContent = data.newQuantity;

                // Update price
                document.getElementById(`price-${bookId}`).textContent = `$${data.newPrice.toFixed(2)}`;

                // Update totals
                document.querySelector('.summary-item:first-child span:last-child').textContent = `$${data.newSubtotal.toFixed(2)}`;
                document.querySelector('.summary-item.total-row span:last-child').textContent = `$${data.newTotal.toFixed(2)}`;
                document.querySelector('.checkout-btn span:first-child').textContent = `$${data.newTotal.toFixed(2)}`;

                // Handle quantity buttons based on action
                const plusButton = document.querySelector(`button[onclick="updateQuantity(${bookId}, 1)"]`);
                const minusButton = document.querySelector(`button[onclick="updateQuantity(${bookId}, -1)"]`);

                if (newAction.toLowerCase() === 'borrow') {
                    // Disable both buttons for borrow
                    plusButton.disabled = true;
                    plusButton.classList.add('disabled');
                    minusButton.disabled = true;
                    minusButton.classList.add('disabled');
                } else {
                    // Enable buttons for buy
                    plusButton.disabled = false;
                    plusButton.classList.remove('disabled');
                    minusButton.disabled = false;
                    minusButton.classList.remove('disabled');
                }

                // Update the original value after successful change
                selectElement.dataset.originalValue = newAction;
            } else {
                // Revert to the original value stored in data-original-value
                selectElement.value = originalValue;
                alert(data.message || 'Could not update action. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Revert to the original value on error
            selectElement.value = originalValue;
            alert('An error occurred while updating the action. Please try again.');
        });
}