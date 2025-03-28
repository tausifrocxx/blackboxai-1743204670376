// Main application script
document.addEventListener('DOMContentLoaded', () => {
  console.log('Aliya Motors application loaded');
  
  // Navigation handling
  const navLinks = document.querySelectorAll('.main-nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute('href').substring(1);
      showSection(sectionId);
    });
  });

  // Show default section (Home)
  showSection('home');
});

function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.page-section').forEach(section => {
    section.style.display = 'none';
  });
  
  // Show requested section
  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.style.display = 'block';
  }

  // Update active nav link
  document.querySelectorAll('.main-nav a').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${sectionId}`) {
      link.classList.add('active');
    }
  });
}

// API functions
async function fetchBikes() {
  try {
    const response = await fetch('/api/bikes');
    return await response.json();
  } catch (error) {
    console.error('Error fetching bikes:', error);
    return [];
  }
}

async function fetchCustomers() {
  try {
    const response = await fetch('/api/customers');
    return await response.json();
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
}

// Utility functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
}