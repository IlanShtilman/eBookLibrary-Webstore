document.addEventListener('DOMContentLoaded', function () {
    // Contact Form handler
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = {
                FullName: e.target.Name.value,
                Email: e.target.email.value,
                Message: e.target.message.value,
            };

            try {
                const response = await fetch('/Home/Submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const messageBox = document.getElementById('messageBox');
                const successMessage = document.getElementById('successMessage');

                if (response.ok) {
                    successMessage.textContent = 'Message sent successfully!';
                    e.target.reset();
                } else {
                    successMessage.textContent = 'Failed to send message. Please try again.';
                }

                messageBox.style.display = 'block';

                setTimeout(() => {
                    messageBox.style.display = 'none';
                }, 3000);

            } catch (error) {
                console.error('Error:', error);
            }
        });
    }

    // About Tab functionality
    window.openAboutTab = function(evt, tabName) {
        var tabcontent = document.getElementsByClassName("tab-content");
        for (var i = 0; i < tabcontent.length; i++) {
            tabcontent[i].classList.remove("active");
        }
        var tablinks = document.getElementsByClassName("tab-link");
        for (var i = 0; i < tablinks.length; i++) {
            tablinks[i].classList.remove("active");
        }
        document.getElementById(tabName).classList.add("active");
        evt.currentTarget.classList.add("active");
    }

    // Navigation buttons
    var viewBookNavBtn = document.getElementById('viewBookNavBtn');
    var addBookNavBtn = document.getElementById('addBookNavBtn');
    var viewOrderNavBtn = document.getElementById('viewOrderNavBtn');

    if (viewBookNavBtn) {
        viewBookNavBtn.addEventListener('click', function (event) {
            event.preventDefault();
            window.location.href = '/Book/ViewBook';
        });
    }

    if (addBookNavBtn) {
        addBookNavBtn.addEventListener('click', function (event) {
            event.preventDefault();
            window.location.href = '/Book/AddBook';
        });
    }

    if (viewOrderNavBtn) {
        viewOrderNavBtn.addEventListener('click', function (event) {
            event.preventDefault();
            window.location.href = '/Order/ViewOrderedBooks';
        });
    }

    // Review form handling
    const reviewForm = document.getElementById('siteReviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const title = document.getElementById('reviewTitle').value;
            const content = document.getElementById('reviewContent').value;
            const rating = document.querySelector('input[name="rating"]:checked')?.value;

            if (!rating) {
                alert('Please select a rating');
                return;
            }

            fetch('/Home/AddSiteReview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title,
                    content: content,
                    rating: parseInt(rating)
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.reload();
                    } else {
                        alert(data.message || 'Error submitting review');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error submitting review');
                });
        });
    }

    // Carousel handler
    const carousel = document.getElementById('myCarousel');
    if (carousel) {
        const items = carousel.querySelectorAll('.carousel-item');
        const totalItems = items.length;
        let currentIndex = 0;

        // Initialize first item as active
        items[0].classList.add('active');

        // Function to move to next/previous slide
        function moveSlide(direction) {
            items[currentIndex].classList.remove('active');

            if (direction === 'next') {
                currentIndex = (currentIndex + 1) % totalItems;
            } else {
                currentIndex = (currentIndex - 1 + totalItems) % totalItems;
            }

            items[currentIndex].classList.add('active');
            updateIndicators();
        }

        // Setup click handlers for controls
        const prevButton = carousel.querySelector('.carousel-control-prev');
        const nextButton = carousel.querySelector('.carousel-control-next');

        if (prevButton && nextButton) {
            prevButton.addEventListener('click', (e) => {
                e.preventDefault();
                moveSlide('prev');
            });

            nextButton.addEventListener('click', (e) => {
                e.preventDefault();
                moveSlide('next');
            });
        }

        // Setup indicators
        const indicators = carousel.querySelectorAll('.carousel-indicators li');
        function updateIndicators() {
            indicators.forEach((indicator, index) => {
                if (index === currentIndex) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            });
        }

        // Add click handlers to indicators
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                items[currentIndex].classList.remove('active');
                currentIndex = index;
                items[currentIndex].classList.add('active');
                updateIndicators();
            });
        });
    }
});