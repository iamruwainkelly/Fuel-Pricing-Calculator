// Dynamic Fuel Pricing Calculator - Variable-Driven Calculations
class DynamicFuelCalculator {
    constructor() {
        // Base prices (mock values as specified)
        this.WHOLESALE_PRICE = 18.00;
        this.RETAIL_PRICE = 20.00;
        
        this.initializeEventListeners();
        
        // Only calculate if all elements are present
        try {
            this.calculatePrice(); // Calculate on page load
        } catch (error) {
            console.warn('Initial calculation skipped:', error.message);
        }
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
        // Linear progression: Tier 1 = 2%, incrementing by 2% per tier
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
            'inland': 1.1  // +10%
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
            throw new Error('Required input elements not found');
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
            if (error.message.includes('Required input elements not found')) {
                console.error('DOM elements not ready yet');
                return; // Don't show alert for initialization issues
            }
            alert(`Error calculating price: ${error.message}`);
        }
    }

    // Update the display with calculation results
    updateDisplay(data) {
        // Final price display
        document.getElementById('finalPrice').textContent = `R${data.finalPrice.toFixed(2)}/L`;
        
        // Base prices
        document.getElementById('displayWholesale').textContent = `R${data.wholesale.toFixed(2)}/L`;
        document.getElementById('displayRetail').textContent = `R${data.retail.toFixed(2)}/L`;
        
        // Applied adjustments
        document.getElementById('tierDiscountDisplay').textContent = 
            `-${data.tierDiscountPercent}% (Tier ${data.inputs.customerTier})`;
        
        document.getElementById('countryFactorDisplay').textContent = 
            `${this.getCountryName(data.inputs.country)} (${data.countryFactor.toFixed(1)}x)`;
        
        const gridDisplay = this.getGridDisplay(data.inputs.gridLocation);
        document.getElementById('gridAdjustmentDisplay').textContent = 
            `${gridDisplay.name} (${gridDisplay.adjustment})`;
        
        // Formula example
        const formulaExample = `(R${data.retail.toFixed(2)} × ${data.countryFactor.toFixed(1)} × ${data.gridFactor.toFixed(1)}) × (1 - ${(data.tierDiscountPercent/100).toFixed(2)}) = R${data.adjustedRetailPrice.toFixed(2)} × ${(1 - data.tierDiscountPercent/100).toFixed(2)} = R${data.finalPrice.toFixed(2)}/L`;
        
        const formulaExampleElement = document.querySelector('.formula-example');
        if (formulaExampleElement) {
            formulaExampleElement.innerHTML = `Example: ${formulaExample}`;
        }
        
        document.getElementById('formulaResult').textContent = `R${data.finalPrice.toFixed(2)}/L`;
    }
}

// Initialize the calculator when the page loads
function initCalculator() {
    try {
        new DynamicFuelCalculator();
    } catch (error) {
        console.error('Failed to initialize calculator:', error);
        // Try again in 100ms
        setTimeout(initCalculator, 100);
    }
}

// Try multiple ways to initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalculator);
} else {
    initCalculator();
}

// Utility functions
function formatCurrency(amount) {
    return `R${amount.toFixed(2)}`;
}

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DynamicFuelCalculator;
}