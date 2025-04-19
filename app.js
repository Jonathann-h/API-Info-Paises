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

  const regionFilter = document.getElementById('region-filter');

  regionFilter.addEventListener('change', function() {
    const selectedRegion = this.value;
    filterCountriesByRegion(selectedRegion);
  });


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


  function filterCountriesByRegion(region) {
    let filteredCountries;
    
    // Si no hay una región seleccionada, muestra todos los países
    if (!region) {
      filteredCountries = countriesData;
    } else {
      filteredCountries = countriesData.filter(country => country.region === region);
    }
    
    // Reiniciar la página actual y mostrar los países filtrados
    currentPage = 1;
    displayCountries(filteredCountries);
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
          <button class="copy-button" data-country="${country.name.common}">Copiar info</button>
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

    document.querySelectorAll('.copy-button').forEach(button => {
      button.addEventListener('click', function() {
        const countryDiv = this.closest('.country');
        const countryInfo = countryDiv.innerText;
        copyToClipboard(countryInfo);

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
    const paginationContainer = document.getElementById('pagination-container');
    paginationContainer.innerHTML = '';
    
    const pagination = document.createElement('div');
    pagination.classList.add('pagination');
    paginationContainer.appendChild(pagination);
    
    // Siempre mostrar 7 botones de página
    let startPage, endPage;
    
    if (totalPages <= 7) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= 4) {
        startPage = 1;
        endPage = 7;
      } else if (currentPage >= totalPages - 3) {
        startPage = totalPages - 6;
        endPage = totalPages;
      } else {
        startPage = currentPage - 3;
        endPage = currentPage + 3;
      }
    }
    
    // Botón "Anterior"
    if (currentPage > 1) {
      const prevButton = document.createElement('button');
      prevButton.innerHTML = '&laquo;';
      prevButton.addEventListener('click', () => {
        currentPage--;
        displayCountries(countriesData);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      pagination.appendChild(prevButton);
    }
    
    // Botones de página numéricos
    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i;
      if (i === currentPage) {
        pageButton.classList.add('active');
      }
      pageButton.addEventListener('click', () => {
        currentPage = i;
        displayCountries(countriesData);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      pagination.appendChild(pageButton);
    }
    
    // Botón "Siguiente"
    if (currentPage < totalPages) {
      const nextButton = document.createElement('button');
      nextButton.innerHTML = '&raquo;';
      nextButton.addEventListener('click', () => {
        currentPage++;
        displayCountries(countriesData);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      pagination.appendChild(nextButton);
    }
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