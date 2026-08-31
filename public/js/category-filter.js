// Client-side category filtering
(function() {
	const filterLinks = document.querySelectorAll('.category-filter__link');
	const articleLinks = document.querySelectorAll('.article-card-link');

	// Check URL query param on page load
	const urlParams = new URLSearchParams(window.location.search);
	const initialCategory = urlParams.get('category') || 'all';

	// Set initial active state based on URL param
	filterLinks.forEach(link => {
		if (link.dataset.category === initialCategory) {
			link.classList.add('active');
		} else {
			link.classList.remove('active');
		}
	});

	// Filter on click
	filterLinks.forEach(link => {
		link.addEventListener('click', function(e) {
			// Update active state
			filterLinks.forEach(l => l.classList.remove('active'));
			this.classList.add('active');

			const category = this.dataset.category;

			// Update URL (no page reload)
			const url = new URL(window.location);
			if (category === 'all') {
				url.searchParams.delete('category');
			} else {
				url.searchParams.set('category', category);
			}
			window.history.pushState({}, '', url);

			// Filter articles
			articleLinks.forEach(cardLink => {
				const card = cardLink.querySelector('.article-card');
				if (category === 'all' || card.dataset.category === category) {
					cardLink.style.display = '';
				} else {
					cardLink.style.display = 'none';
				}
			});
		});
	});

	// Apply initial filter on page load
	if (initialCategory !== 'all') {
		articleLinks.forEach(cardLink => {
			const card = cardLink.querySelector('.article-card');
			if (card.dataset.category !== initialCategory) {
				cardLink.style.display = 'none';
			}
		});
	}
})();
