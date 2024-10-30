document.addEventListener('DOMContentLoaded', function() {
  const countriesList = document.getElementById('countries-list');
  const searchInput = document.getElementById('search');
  const loadingIndicator = document.getElementById('loading');
  let countriesData = [];
  let currentPage = 1;
  const itemsPerPage = 10;
  const debounceDelay = 300;
  let debounceTimeout;

  const apiUrl = 'https://restcountries.com/v3.1/all';

  function showLoading() {
    loadingIndicator.style.display = 'block';
  }

  function hideLoading() {
    loadingIndicator.style.display = 'none';
  }

  async function getCountries() {
    showLoading();
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      const data = await response.json();
      countriesData = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
      displayCountries(countriesData);
    } catch (error) {
      console.error('Fetch operation failed: ', error);
      countriesList.innerHTML = '<p>Error fetching data</p>';
    } finally {
      hideLoading();
    }
  }

  function displayCountries(countries) {
    countriesList.innerHTML = '';
    const paginatedCountries = countries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (paginatedCountries.length === 0) {
      countriesList.innerHTML = '<p>No se encontraron países</p>';
      return;
    }

    paginatedCountries.forEach(country => {
      const countryDiv = document.createElement('div');
      countryDiv.classList.add('country');

      const capital = country.capital ? country.capital[0] : 'N/A';
      const languages = country.languages ? Object.values(country.languages).join(', ') : 'N/A';

      countryDiv.innerHTML = `
        <div class="country-header">
          <button class="copy-button" data-country="${country.name.common}">Copy</button>
          <h2>${country.name.common}</h2>
        </div>
        <img src="${country.flags.png}" alt="Bandera de ${country.name.common}" class="flag">
        <p>Capital: ${capital}</p>
        <p>Región: ${country.region}</p>
        <p>Población: ${country.population.toLocaleString()}</p>
        <p>Área: ${country.area.toLocaleString()} km²</p>
        <p>Idiomas: ${languages}</p>
      `;
      countriesList.appendChild(countryDiv);
    });

    // Añadir evento de click para copiar contenido
    document.querySelectorAll('.copy-button').forEach(button => {
      button.addEventListener('click', function() {
        const countryDiv = this.closest('.country');
        const countryInfo = countryDiv.innerText;
        copyToClipboard(countryInfo);
        
        // Mensaje de sweetAlert
        Swal.fire({
          icon: "success",
          title: "Información copiada al portapapeles",
          showConfirmButton: false,
          timer: 1500,
          customClass: {
            title: 'titulo-swal'
          }
        });
      });
    });

    displayPagination(countries.length);
  }

  function copyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }

  function displayPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationDiv = document.querySelector('.pagination');

    if (paginationDiv) {
      paginationDiv.remove();
    }

    const newPaginationDiv = document.createElement('div');
    newPaginationDiv.classList.add('pagination');

    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i;
      if (i === currentPage) {
        pageButton.classList.add('active');
      }
      pageButton.addEventListener('click', () => {
        currentPage = i;
        displayCountries(countriesData);
      });
      newPaginationDiv.appendChild(pageButton);
    }

    // Añadir la paginación después de la lista de países
    countriesList.appendChild(newPaginationDiv);
  }

  function filterCountries(searchTerm) {
    const filteredCountries = countriesData.filter(country => 
      country.name.common.toLowerCase().startsWith(searchTerm)
    );
    currentPage = 1;
    displayCountries(filteredCountries);
  }

  function debounce(func, delay) {
    return function(...args) {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  searchInput.addEventListener('input', debounce(event => {
    const searchTerm = event.target.value.toLowerCase();
    filterCountries(searchTerm);
  }, debounceDelay));

  getCountries();
});

