// Minimal Dynamic Fuel Pricing Calculator
class SimpleFuelCalculator {
    constructor() {
        this.WHOLESALE_PRICE = 18.00;
        this.RETAIL_PRICE = 20.00;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.setupEventListeners();
        this.calculate();
    }

    setupEventListeners() {
        // Calculate button
        const calculateBtn = document.getElementById('calculateBtn');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.calculate());
        }
        
        // Auto-calculate on input changes
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
            select.addEventListener('change', () => this.calculate());
        });
    }

    getTierDiscount(tier) {
        return tier * 2; // 2% per tier
    }

    getCountryFactor(country) {
        const factors = {
            'south-africa': 1.0,
            'zimbabwe': 1.2,
            'botswana': 1.1
        };
        return factors[country] || 1.0;
    }

    getGridFactor(location) {
        const factors = {
            'coastal': 1.0,
            'inland': 1.1
        };
        return factors[location] || 1.0;
    }

    calculate() {
        try {
            // Get inputs
            const tierElement = document.getElementById('customerTier');
            const countryElement = document.getElementById('country');
            const gridElement = document.getElementById('gridLocation');

            if (!tierElement || !countryElement || !gridElement) {
                console.log('Waiting for DOM elements...');
                return;
            }

            const tier = parseInt(tierElement.value);
            const country = countryElement.value;
            const grid = gridElement.value;

            // Calculate
            const tierDiscount = this.getTierDiscount(tier);
            const countryFactor = this.getCountryFactor(country);
            const gridFactor = this.getGridFactor(grid);

            const adjustedPrice = this.RETAIL_PRICE * countryFactor * gridFactor;
            const finalPrice = adjustedPrice * (1 - tierDiscount / 100);

            // Update display - only the essential elements
            this.updateDisplay(finalPrice, tier, country, grid);

        } catch (error) {
            console.error('Calculation error:', error);
        }
    }

    updateDisplay(finalPrice, tier, country, grid) {
        // Show results section
        const resultsDiv = document.getElementById('results');
        if (resultsDiv) {
            resultsDiv.style.display = 'block';
        }

        // Update final price - this is the most important element
        const finalPriceElement = document.getElementById('finalPrice');
        if (finalPriceElement) {
            finalPriceElement.textContent = `R${finalPrice.toFixed(2)}/L`;
        }

        // Create results section if it doesn't exist
        if (!resultsDiv) {
            this.createResultsSection(finalPrice);
        }
    }

    createResultsSection(finalPrice) {
        const container = document.querySelector('.container');
        if (container) {
            const resultsHTML = `
                <div id="results" class="results-container" style="margin-top: 30px;">
                    <div class="final-price-display">
                        <h2>Final Price per Liter: <span id="finalPrice">R${finalPrice.toFixed(2)}/L</span></h2>
                        <p class="calculation-status">✅ Dynamically calculated</p>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', resultsHTML);
        }
    }
}

// Start when page loads
window.addEventListener('load', () => {
    new SimpleFuelCalculator();
});