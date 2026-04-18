(function() {
  let fuse = null;
  let data = null;

  // Load index
  fetch('/search-index.json')
    .then(r => r.json())
    .then(d => {
      data = d;
      fuse = new Fuse(d, {
        keys: [
          { name: 'title', weight: 0.6 },
          { name: 'excerpt', weight: 0.3 },
          { name: 'category_title', weight: 0.1 },
        ],
        threshold: 0.3,
        includeScore: true,
        minMatchCharLength: 2,
      });
      // Check URL params
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) {
        document.getElementById('search-input').value = q;
        doSearch(q);
      }
    });

  function doSearch(query) {
    const results = document.getElementById('search-results');
    const count = document.getElementById('search-count');
    if (!fuse || !query || query.length < 2) {
      results.innerHTML = '';
      if (count) count.textContent = '';
      return;
    }
    const hits = fuse.search(query).slice(0, 12);
    if (count) count.textContent = hits.length > 0 
      ? hits.length + ' résultat' + (hits.length > 1 ? 's' : '') + ' pour « ' + query + ' »'
      : 'Aucun résultat pour « ' + query + ' »';
    
    results.innerHTML = hits.map(h => {
      const a = h.item;
      const img = a.image 
        ? '<img class="card-img" src="' + a.image + '" alt="" loading="lazy">' 
        : '';
      return '<article class="card">' + img +
        '<div class="card-body">' +
        '<h3><a href="/' + a.category + '/' + a.slug + '/">' + a.title + '</a></h3>' +
        (a.excerpt ? '<p>' + a.excerpt + '</p>' : '') +
        (a.date ? '<time>' + a.date + '</time>' : '') +
        '</div></article>';
    }).join('');
  }

  // Bind input
  document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('search-input');
    if (input) {
      let timeout;
      input.addEventListener('input', function() {
        clearTimeout(timeout);
        timeout = setTimeout(function() { doSearch(input.value); }, 200);
      });
    }
  });
})();
