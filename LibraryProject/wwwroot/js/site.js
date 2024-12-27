document.getElementById('contact-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    try {
        const response = await fetch('/Home/Submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                FullName: e.target.Name.value,
                Email: e.target.email.value,
                Message: e.target.message.value
            })
        });

        if (response.ok) {
            document.getElementById('successMessage').textContent = 'Message sent successfully!';
            document.getElementById('messageBox').style.display = 'block';
            e.target.reset();
        } else {
            throw new Error('Failed to send message');
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('successMessage').textContent = 'Failed to send message. Please try again.';
        document.getElementById('messageBox').style.display = 'block';
    }
});

function openAboutTab(evt, tabName) {
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

document.addEventListener('DOMContentLoaded', function () {
    // Previous navigation button code remains the same
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

    // Carousel code
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
