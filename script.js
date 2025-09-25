// Dynamic Fuel Pricing Calculator - Per Liter Calculations
class DynamicFuelPricingCalculator {
    constructor() {
        this.LITERS_PER_BARREL = 159; // Standard conversion
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const calculateBtn = document.getElementById('calculateBtn');
        calculateBtn.addEventListener('click', () => this.calculatePrice());
        
        // Add real-time input validation
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                // Hide results when inputs change
                const resultsDiv = document.getElementById('results');
                if (resultsDiv.style.display === 'block') {
                    resultsDiv.style.display = 'none';
                }
            });
        });
    }

    // Get customer tier discount percentage
    getTierDiscountPercent(tier) {
        const discounts = {
            1: 25, 2: 22, 3: 20, 4: 18, 5: 15, 6: 12, 7: 10,
            8: 8, 9: 6, 10: 4, 11: 3, 12: 2, 13: 1, 14: 0
        };
        return discounts[parseInt(tier)] || 0;
    }

    // Get country name for display
    getCountryName(factor) {
        const countries = {
            '1.0': 'South Africa',
            '1.15': 'Zimbabwe', 
            '1.08': 'Botswana',
            '1.12': 'Namibia',
            '1.25': 'Zambia',
            '1.35': 'Mozambique'
        };
        return countries[factor] || 'Unknown';
    }

    // Get location name for display
    getLocationName(factor) {
        const locations = {
            '1.0': 'Urban/Major City',
            '1.05': 'Suburban',
            '0.95': 'Coastal/Port',
            '1.15': 'Rural/Inland',
            '1.25': 'Remote/Border'
        };
        return locations[factor] || 'Unknown';
    }

    // Format currency to 2 decimal places
    formatCurrency(amount) {
        return Math.round(amount * 100) / 100;
    }

    // Main calculation function
    calculatePrice() {
        const calculateBtn = document.getElementById('calculateBtn');
        const resultsDiv = document.getElementById('results');
        
        // Show loading state
        calculateBtn.classList.add('loading');
        calculateBtn.textContent = '';
        
        setTimeout(() => {
            try {
                // Get all input values
                const inputs = this.getInputValues();
                
                // Perform step-by-step calculations
                const calculations = this.performCalculations(inputs);
                
                // Update the UI with results
                this.updateResults(calculations, inputs);
                
                // Show results
                resultsDiv.style.display = 'block';
                resultsDiv.scrollIntoView({ behavior: 'smooth' });

            } catch (error) {
                console.error('Calculation error:', error);
                alert('Error calculating price. Please check your inputs and try again.');
            } finally {
                // Reset button
                calculateBtn.classList.remove('loading');
                calculateBtn.textContent = 'Calculate Per-Liter Price';
            }
        }, 1000);
    }

    // Get all input values from the form
    getInputValues() {
        return {
            crudePrice: parseFloat(document.getElementById('crudePrice').value),
            exchangeRate: parseFloat(document.getElementById('exchangeRate').value),
            refiningCost: parseFloat(document.getElementById('refiningCost').value),
            customerTier: parseInt(document.getElementById('customerTier').value),
            partnerDiscount: parseFloat(document.getElementById('partnerDiscount').value),
            countryFactor: parseFloat(document.getElementById('countryFactor').value),
            gridFactor: parseFloat(document.getElementById('gridFactor').value),
            taxesLevies: parseFloat(document.getElementById('taxesLevies').value),
            wholesaleMargin: parseFloat(document.getElementById('wholesaleMargin').value),
            retailMargin: parseFloat(document.getElementById('retailMargin').value)
        };
    }

    // Perform all pricing calculations step by step
    performCalculations(inputs) {
        // Step 1: Base crude cost per liter
        const baseCrudeCost = this.formatCurrency(
            (inputs.crudePrice * inputs.exchangeRate) / this.LITERS_PER_BARREL
        );

        // Step 2: Add refining cost
        const refiningCostAmount = this.formatCurrency(baseCrudeCost * (inputs.refiningCost / 100));
        const baseAfterRefining = this.formatCurrency(baseCrudeCost + refiningCostAmount);

        // Step 3: Calculate taxes & levies
        const taxesAmount = this.formatCurrency(baseAfterRefining * (inputs.taxesLevies / 100));

        // Step 4: Calculate wholesale margin
        const wholesaleAmount = this.formatCurrency(baseAfterRefining * (inputs.wholesaleMargin / 100));
        const wholesalePrice = this.formatCurrency(baseAfterRefining + wholesaleAmount);

        // Step 5: Calculate retail margin
        const retailAmount = this.formatCurrency(
            (baseAfterRefining + wholesaleAmount) * (inputs.retailMargin / 100)
        );
        const preDiscountPrice = this.formatCurrency(
            baseAfterRefining + taxesAmount + wholesaleAmount + retailAmount
        );

        // Step 6: Apply customer tier discount
        const tierDiscountPercent = this.getTierDiscountPercent(inputs.customerTier);
        const tierDiscountAmount = this.formatCurrency(preDiscountPrice * (tierDiscountPercent / 100));
        const afterTierDiscount = this.formatCurrency(preDiscountPrice - tierDiscountAmount);

        // Step 7: Apply partner discount
        const partnerDiscountAmount = this.formatCurrency(afterTierDiscount * (inputs.partnerDiscount / 100));
        const afterPartnerDiscount = this.formatCurrency(afterTierDiscount - partnerDiscountAmount);

        // Step 8: Apply country factor
        const afterCountryFactor = this.formatCurrency(afterPartnerDiscount * inputs.countryFactor);

        // Step 9: Apply grid/location factor
        const finalPrice = this.formatCurrency(afterCountryFactor * inputs.gridFactor);

        return {
            baseCrudeCost,
            refiningCostAmount,
            baseAfterRefining,
            taxesAmount,
            wholesaleAmount,
            wholesalePrice,
            retailAmount,
            preDiscountPrice,
            tierDiscountPercent,
            tierDiscountAmount,
            afterTierDiscount,
            partnerDiscountAmount,
            afterPartnerDiscount,
            afterCountryFactor,
            finalPrice
        };
    }

    // Update the UI with calculation results
    updateResults(calc, inputs) {
        // Update step-by-step calculations
        document.getElementById('crudeInput').textContent = `$${inputs.crudePrice.toFixed(2)}`;
        document.getElementById('exchangeInput').textContent = inputs.exchangeRate.toFixed(2);
        document.getElementById('baseCrudeCost').textContent = `R${calc.baseCrudeCost.toFixed(2)}`;

        document.getElementById('baseCrudeRef').textContent = `R${calc.baseCrudeCost.toFixed(2)}`;
        document.getElementById('refiningInput').textContent = `${inputs.refiningCost.toFixed(1)}%`;
        document.getElementById('refiningCostResult').textContent = `R${calc.refiningCostAmount.toFixed(2)}`;
        document.getElementById('baseAfterRefining').textContent = `R${calc.baseAfterRefining.toFixed(2)}`;

        document.getElementById('baseForTax').textContent = `R${calc.baseAfterRefining.toFixed(2)}`;
        document.getElementById('taxInput').textContent = `${inputs.taxesLevies.toFixed(1)}%`;
        document.getElementById('taxesResult').textContent = `R${calc.taxesAmount.toFixed(2)}`;

        document.getElementById('baseForWholesale').textContent = `R${calc.baseAfterRefining.toFixed(2)}`;
        document.getElementById('wholesaleInput').textContent = `${inputs.wholesaleMargin.toFixed(1)}%`;
        document.getElementById('wholesaleResult').textContent = `R${calc.wholesaleAmount.toFixed(2)}`;
        document.getElementById('wholesalePriceFinal').textContent = `R${calc.wholesalePrice.toFixed(2)}`;

        document.getElementById('baseForRetail').textContent = `R${calc.baseAfterRefining.toFixed(2)}`;
        document.getElementById('wholesaleForRetail').textContent = `R${calc.wholesaleAmount.toFixed(2)}`;
        document.getElementById('retailInput').textContent = `${inputs.retailMargin.toFixed(1)}%`;
        document.getElementById('retailResult').textContent = `R${calc.retailAmount.toFixed(2)}`;
        document.getElementById('preDiscountPrice').textContent = `R${calc.preDiscountPrice.toFixed(2)}`;

        document.getElementById('preDiscountForTier').textContent = `R${calc.preDiscountPrice.toFixed(2)}`;
        document.getElementById('tierDiscountInput').textContent = `${calc.tierDiscountPercent}%`;
        document.getElementById('tierDiscountResult').textContent = `R${calc.tierDiscountAmount.toFixed(2)}`;

        document.getElementById('afterTierDiscount').textContent = `R${calc.afterTierDiscount.toFixed(2)}`;
        document.getElementById('partnerDiscountInput').textContent = `${inputs.partnerDiscount.toFixed(1)}%`;
        document.getElementById('partnerDiscountResult').textContent = `R${calc.partnerDiscountAmount.toFixed(2)}`;

        document.getElementById('afterPartnerDiscount').textContent = `R${calc.afterPartnerDiscount.toFixed(2)}`;
        document.getElementById('countryFactorInput').textContent = inputs.countryFactor.toFixed(1);
        document.getElementById('afterCountryFactor').textContent = `R${calc.afterCountryFactor.toFixed(2)}`;

        document.getElementById('afterCountryForGrid').textContent = `R${calc.afterCountryFactor.toFixed(2)}`;
        document.getElementById('gridFactorInput').textContent = inputs.gridFactor.toFixed(2);
        document.getElementById('afterGridFactor').textContent = `R${calc.finalPrice.toFixed(2)}`;

        // Update cost breakdown
        document.getElementById('breakdownCrude').textContent = `R${calc.baseCrudeCost.toFixed(2)}/L`;
        document.getElementById('breakdownRefining').textContent = `R${calc.refiningCostAmount.toFixed(2)}/L`;
        document.getElementById('breakdownTaxes').textContent = `R${calc.taxesAmount.toFixed(2)}/L`;
        document.getElementById('breakdownWholesale').textContent = `R${calc.wholesaleAmount.toFixed(2)}/L`;
        document.getElementById('breakdownRetail').textContent = `R${calc.retailAmount.toFixed(2)}/L`;
        document.getElementById('breakdownTierDiscount').textContent = `-R${calc.tierDiscountAmount.toFixed(2)}/L`;
        document.getElementById('breakdownPartnerDiscount').textContent = `-R${calc.partnerDiscountAmount.toFixed(2)}/L`;

        // Update final price
        document.getElementById('finalPricePerLiter').textContent = `R${calc.finalPrice.toFixed(2)}/L`;

        // Validate price range
        const priceValidation = document.querySelector('.price-validation');
        if (calc.finalPrice >= 25 && calc.finalPrice <= 35) {
            priceValidation.textContent = '✅ Price within realistic range (R25-R35/L)';
            priceValidation.style.color = '#4CAF50';
        } else if (calc.finalPrice < 25) {
            priceValidation.textContent = '⚠️ Price below typical range (R25-R35/L)';
            priceValidation.style.color = '#FF9800';
        } else {
            priceValidation.textContent = '⚠️ Price above typical range (R25-R35/L)';
            priceValidation.style.color = '#FF9800';
        }
    }
}

// Initialize the calculator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DynamicFuelPricingCalculator();
    
    // Add input validation
    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Ensure positive values
            if (parseFloat(this.value) < 0) {
                this.value = 0;
            }
            
            // Enforce min/max constraints
            const min = parseFloat(this.getAttribute('min'));
            const max = parseFloat(this.getAttribute('max'));
            
            if (min !== null && parseFloat(this.value) < min) {
                this.value = min;
            }
            if (max !== null && parseFloat(this.value) > max) {
                this.value = max;
            }
        });
    });
    
    // Add preset buttons for quick testing
    addPresetButtons();
});

// Add preset configuration buttons
function addPresetButtons() {
    const form = document.querySelector('.calculator-form');
    const presetContainer = document.createElement('div');
    presetContainer.className = 'preset-container';
    presetContainer.innerHTML = `
        <h3>Quick Presets:</h3>
        <div class="preset-buttons">
            <button type="button" class="preset-btn" onclick="loadPreset('southAfrica')">South Africa Standard</button>
            <button type="button" class="preset-btn" onclick="loadPreset('zimbabwe')">Zimbabwe High Risk</button>
            <button type="button" class="preset-btn" onclick="loadPreset('premium')">Premium Customer</button>
        </div>
    `;
    
    form.insertBefore(presetContainer, form.querySelector('.calculate-btn'));
}

// Load preset configurations
function loadPreset(presetName) {
    const presets = {
        southAfrica: {
            crudePrice: 85.50,
            exchangeRate: 18.75,
            refiningCost: 12.5,
            customerTier: 6,
            partnerDiscount: 5.0,
            countryFactor: '1.0',
            gridFactor: '1.0',
            taxesLevies: 28.5,
            wholesaleMargin: 8.5,
            retailMargin: 12.0
        },
        zimbabwe: {
            crudePrice: 87.20,
            exchangeRate: 19.25,
            refiningCost: 15.0,
            customerTier: 8,
            partnerDiscount: 3.0,
            countryFactor: '1.15',
            gridFactor: '1.15',
            taxesLevies: 32.0,
            wholesaleMargin: 10.0,
            retailMargin: 15.0
        },
        premium: {
            crudePrice: 84.00,
            exchangeRate: 18.50,
            refiningCost: 11.0,
            customerTier: 1,
            partnerDiscount: 8.0,
            countryFactor: '1.0',
            gridFactor: '0.95',
            taxesLevies: 26.0,
            wholesaleMargin: 7.5,
            retailMargin: 10.0
        }
    };
    
    const preset = presets[presetName];
    if (preset) {
        Object.keys(preset).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.value = preset[key];
            }
        });
        
        // Hide results to encourage recalculation
        const resultsDiv = document.getElementById('results');
        if (resultsDiv.style.display === 'block') {
            resultsDiv.style.display = 'none';
        }
    }
}

// Utility functions
function formatCurrency(amount, currency = 'ZAR') {
    const symbol = currency === 'USD' ? '$' : 'R';
    return `${symbol}${amount.toFixed(2)}`;
}

function formatPercentage(value) {
    return `${value.toFixed(1)}%`;
}

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DynamicFuelPricingCalculator;
}