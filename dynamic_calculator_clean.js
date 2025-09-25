// Dynamic Fuel Pricing Calculator - Clean Version
class DynamicFuelCalculator {
    constructor() {
        // Base prices (mock values as specified)
        this.WHOLESALE_PRICE = 18.00;
        this.RETAIL_PRICE = 20.00;
        
        this.initializeEventListeners();
        this.calculatePrice(); // Calculate on page load
    }

    initializeEventListeners() {
        const calculateBtn = document.getElementById('calculateBtn');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.calculatePrice());
        }
        
        // Auto-calculate when inputs change
        const inputs = document.querySelectorAll('select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.calculatePrice();
            });
        });
    }

    // Get tier discount percentage (2% for Tier 1, 28% for Tier 14)
    getTierDiscountPercent(tier) {
        return tier * 2;
    }

    // Get country factor multiplier
    getCountryFactor(country) {
        const factors = {
            'south-africa': 1.0,
            'zimbabwe': 1.2,
            'botswana': 1.1
        };
        return factors[country] || 1.0;
    }

    // Get country display name
    getCountryName(country) {
        const names = {
            'south-africa': 'South Africa',
            'zimbabwe': 'Zimbabwe',
            'botswana': 'Botswana'
        };
        return names[country] || 'Unknown';
    }

    // Get grid factor (Coastal = 1.0, Inland = 1.1 for +10%)
    getGridFactor(location) {
        const factors = {
            'coastal': 1.0,
            'inland': 1.1
        };
        return factors[location] || 1.0;
    }

    // Get grid display name and adjustment
    getGridDisplay(location) {
        const displays = {
            'coastal': { name: 'Coastal', adjustment: '0%' },
            'inland': { name: 'Inland', adjustment: '+10%' }
        };
        return displays[location] || { name: 'Unknown', adjustment: '0%' };
    }

    // Format currency to 2 decimal places
    formatCurrency(amount) {
        return Math.round(amount * 100) / 100;
    }

    // Get all input values
    getInputValues() {
        const customerTierElement = document.getElementById('customerTier');
        const countryElement = document.getElementById('country');
        const gridLocationElement = document.getElementById('gridLocation');
        
        if (!customerTierElement || !countryElement || !gridLocationElement) {
            throw new Error('Input elements not found');
        }
        
        return {
            customerTier: parseInt(customerTierElement.value),
            country: countryElement.value,
            gridLocation: gridLocationElement.value
        };
    }

    // Main calculation function
    calculatePrice() {
        try {
            // Get input values
            const inputs = this.getInputValues();
            
            // Validate inputs
            if (!inputs.customerTier || !inputs.country || !inputs.gridLocation) {
                console.warn('Invalid input values:', inputs);
                return;
            }
            
            // Calculate all factors
            const tierDiscountPercent = this.getTierDiscountPercent(inputs.customerTier);
            const countryFactor = this.getCountryFactor(inputs.country);
            const gridFactor = this.getGridFactor(inputs.gridLocation);
            
            // Apply the formula: Final Price = (Retail × Country Factor × Grid Factor) × (1 - Tier Discount)
            const tierDiscountDecimal = tierDiscountPercent / 100;
            const adjustedRetailPrice = this.RETAIL_PRICE * countryFactor * gridFactor;
            const finalPrice = this.formatCurrency(adjustedRetailPrice * (1 - tierDiscountDecimal));
            
            // Prepare display data
            const calculationData = {
                inputs,
                wholesale: this.WHOLESALE_PRICE,
                retail: this.RETAIL_PRICE,
                tierDiscountPercent,
                countryFactor,
                gridFactor,
                adjustedRetailPrice,
                finalPrice
            };
            
            // Update the UI
            this.updateDisplay(calculationData);
            
            // Show results
            const resultsElement = document.getElementById('results');
            if (resultsElement) {
                resultsElement.style.display = 'block';
            }
            
        } catch (error) {
            console.error('Calculation error:', error);
            // Don't show alert for initialization errors
            if (!error.message.includes('Input elements not found')) {
                alert('Calculation error occurred. Please refresh the page.');
            }
        }
    }

    // Update the display with calculation results
    updateDisplay(data) {
        // Final price display
        const finalPriceElement = document.getElementById('finalPrice');
        if (finalPriceElement) {
            finalPriceElement.textContent = `R${data.finalPrice.toFixed(2)}/L`;
        }
        
        // Base prices - these elements might not exist, so check first
        const displayWholesaleElement = document.getElementById('displayWholesale');
        if (displayWholesaleElement) {
            displayWholesaleElement.textContent = `R${data.wholesale.toFixed(2)}/L`;
        }
        
        const displayRetailElement = document.getElementById('displayRetail');
        if (displayRetailElement) {
            displayRetailElement.textContent = `R${data.retail.toFixed(2)}/L`;
        }
        
        // Applied adjustments - only update if elements exist
        const tierDiscountDisplayElement = document.getElementById('tierDiscountDisplay');
        if (tierDiscountDisplayElement) {
            tierDiscountDisplayElement.textContent = 
                `-${data.tierDiscountPercent}% (Tier ${data.inputs.customerTier})`;
        }
        
        const countryFactorDisplayElement = document.getElementById('countryFactorDisplay');
        if (countryFactorDisplayElement) {
            countryFactorDisplayElement.textContent = 
                `${this.getCountryName(data.inputs.country)} (${data.countryFactor.toFixed(1)}x)`;
        }
        
        const gridAdjustmentDisplayElement = document.getElementById('gridAdjustmentDisplay');
        if (gridAdjustmentDisplayElement) {
            const gridDisplay = this.getGridDisplay(data.inputs.gridLocation);
            gridAdjustmentDisplayElement.textContent = 
                `${gridDisplay.name} (${gridDisplay.adjustment})`;
        }
        
        // Formula example - only update if element exists
        const formulaExampleElement = document.querySelector('.formula-example');
        if (formulaExampleElement) {
            const formulaExample = `(R${data.retail.toFixed(2)} × ${data.countryFactor.toFixed(1)} × ${data.gridFactor.toFixed(1)}) × (1 - ${(data.tierDiscountPercent/100).toFixed(2)}) = R${data.adjustedRetailPrice.toFixed(2)} × ${(1 - data.tierDiscountPercent/100).toFixed(2)} = R${data.finalPrice.toFixed(2)}/L`;
            formulaExampleElement.innerHTML = `Example: ${formulaExample}`;
        }
        
        const formulaResultElement = document.getElementById('formulaResult');
        if (formulaResultElement) {
            formulaResultElement.textContent = `R${data.finalPrice.toFixed(2)}/L`;
        }
    }
}

// Initialize when page loads
window.addEventListener('load', function() {
    new DynamicFuelCalculator();
});