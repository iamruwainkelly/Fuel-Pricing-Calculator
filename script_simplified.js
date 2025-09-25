// Simplified Dynamic Fuel Pricing Calculator - Clean Results Focus
class SimplifiedFuelPricingCalculator {
    constructor() {
        this.LITERS_PER_BARREL = 159; // Standard conversion
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const calculateBtn = document.getElementById('calculateBtn');
        calculateBtn.addEventListener('click', () => this.calculatePrice());
        
        // Toggle detailed breakdown
        const toggleBtn = document.getElementById('toggleDetails');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleDetailedView());
        }
        
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

    // Toggle detailed calculation view
    toggleDetailedView() {
        const detailedBreakdown = document.querySelector('.detailed-breakdown');
        const toggleBtn = document.getElementById('toggleDetails');
        
        if (detailedBreakdown.style.display === 'none') {
            detailedBreakdown.style.display = 'block';
            toggleBtn.textContent = '🔼 Hide Detailed Calculation Steps';
        } else {
            detailedBreakdown.style.display = 'none';
            toggleBtn.textContent = '🔍 View Detailed Calculation Steps';
        }
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

    // Get location factor and name
    getLocationConfig(location) {
        const configs = {
            'coastal': { factor: 0.95, name: 'Coastal' },
            'urban': { factor: 1.0, name: 'Urban' },
            'suburban': { factor: 1.05, name: 'Suburban' },
            'inland': { factor: 1.15, name: 'Inland' },
            'remote': { factor: 1.25, name: 'Remote' }
        };
        return configs[location] || configs['urban'];
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
        }, 800); // Faster response for clean output
    }

    // Get all input values from the form
    getInputValues() {
        return {
            wholesalePrice: parseFloat(document.getElementById('wholesalePrice').value),
            retailPrice: parseFloat(document.getElementById('retailPrice').value),
            customerTier: parseInt(document.getElementById('customerTier').value),
            exchangeRate: parseFloat(document.getElementById('exchangeRate').value),
            countryFactor: parseFloat(document.getElementById('countryFactor').value),
            gridLocation: document.getElementById('gridLocation').value
        };
    }

    // Perform all pricing calculations step by step
    performCalculations(inputs) {
        // Get location configuration
        const locationConfig = this.getLocationConfig(inputs.gridLocation);
        
        // Step 1: Start with retail price as base
        let currentPrice = inputs.retailPrice;

        // Step 2: Apply customer tier discount to retail price
        const tierDiscountPercent = this.getTierDiscountPercent(inputs.customerTier);
        const tierDiscountAmount = this.formatCurrency(currentPrice * (tierDiscountPercent / 100));
        currentPrice = this.formatCurrency(currentPrice - tierDiscountAmount);

        // Step 3: Apply exchange rate adjustment (simulate currency impact)
        // Use a normalized exchange rate effect (baseline 18.0, current rate creates adjustment)
        const baselineRate = 18.0;
        const exchangeAdjustment = this.formatCurrency((inputs.exchangeRate - baselineRate) * 0.1);
        currentPrice = this.formatCurrency(currentPrice + exchangeAdjustment);

        // Step 4: Apply country factor
        currentPrice = this.formatCurrency(currentPrice * inputs.countryFactor);

        // Step 5: Apply grid/location factor
        const finalPrice = this.formatCurrency(currentPrice * locationConfig.factor);

        return {
            wholesalePrice: inputs.wholesalePrice,
            retailPrice: inputs.retailPrice,
            tierDiscountPercent,
            tierDiscountAmount,
            exchangeAdjustment,
            countryFactor: inputs.countryFactor,
            gridFactor: locationConfig.factor,
            gridName: locationConfig.name,
            finalPrice
        };
    }

    // Update the UI with calculation results - SIMPLIFIED VERSION
    updateResults(calc, inputs) {
        // Main price display
        document.getElementById('finalPricePerLiter').textContent = `R${calc.finalPrice.toFixed(2)}/L`;

        // Pricing breakdown (simplified)
        document.getElementById('wholesaleDisplay').textContent = `R${calc.wholesalePrice.toFixed(2)}/L`;
        document.getElementById('retailDisplay').textContent = `R${calc.retailPrice.toFixed(2)}/L`;
        document.getElementById('tierDiscountDisplay').textContent = `-R${calc.tierDiscountAmount.toFixed(2)}/L (${calc.tierDiscountPercent}%)`;
        document.getElementById('exchangeAdjustment').textContent = `Applied (${inputs.exchangeRate.toFixed(2)} ZAR/USD)`;
        document.getElementById('countryAdjustment').textContent = `${this.getCountryName(inputs.countryFactor.toString())} (${inputs.countryFactor.toFixed(1)}x)`;
        document.getElementById('gridAdjustment').textContent = `${calc.gridName} (${calc.gridFactor.toFixed(2)}x)`;

        // Dynamic features summary
        document.getElementById('currentWholesale').textContent = calc.wholesalePrice.toFixed(2);
        document.getElementById('currentRetail').textContent = calc.retailPrice.toFixed(2);
        document.getElementById('currentTier').textContent = inputs.customerTier;
        document.getElementById('tierDiscountPercent').textContent = `${calc.tierDiscountPercent}%`;
        document.getElementById('countryName').textContent = this.getCountryName(inputs.countryFactor.toString());
        document.getElementById('countryMultiplier').textContent = `${inputs.countryFactor.toFixed(1)}x`;
        document.getElementById('locationName').textContent = calc.gridName;
        document.getElementById('gridMultiplier').textContent = `${calc.gridFactor.toFixed(2)}x`;
        document.getElementById('currentRate').textContent = inputs.exchangeRate.toFixed(2);

        // Detailed breakdown (hidden by default) - simplified for new structure
        if (document.getElementById('retailInput')) {
            document.getElementById('retailInput').textContent = calc.retailPrice.toFixed(2);
            document.getElementById('retailForDiscount').textContent = calc.retailPrice.toFixed(2);
            document.getElementById('tierDiscountInput').textContent = `${calc.tierDiscountPercent}%`;
            document.getElementById('tierDiscountResult').textContent = calc.tierDiscountAmount.toFixed(2);
            document.getElementById('exchangeRateInput').textContent = inputs.exchangeRate.toFixed(2);
            document.getElementById('countryFactorInput').textContent = inputs.countryFactor.toFixed(1);
            document.getElementById('gridFactorInput').textContent = calc.gridFactor.toFixed(2);
        }

        // Validate price range
        const priceValidation = document.querySelector('.price-validation');
        if (calc.finalPrice >= 15 && calc.finalPrice <= 30) {
            priceValidation.textContent = '✅ Price within realistic range (R15-R30/L)';
            priceValidation.style.color = '#4CAF50';
        } else if (calc.finalPrice < 15) {
            priceValidation.textContent = '⚠️ Price below typical range (R15-R30/L)';
            priceValidation.style.color = '#FF9800';
        } else {
            priceValidation.textContent = '⚠️ Price above typical range (R15-R30/L)';
            priceValidation.style.color = '#FF9800';
        }
    }
}

// Initialize the calculator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SimplifiedFuelPricingCalculator();
    
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
            wholesalePrice: 18.00,
            retailPrice: 20.00,
            customerTier: 6,
            exchangeRate: 18.75,
            countryFactor: '1.0',
            gridLocation: 'urban'
        },
        zimbabwe: {
            wholesalePrice: 19.50,
            retailPrice: 22.00,
            customerTier: 8,
            exchangeRate: 19.25,
            countryFactor: '1.15',
            gridLocation: 'inland'
        },
        premium: {
            wholesalePrice: 17.50,
            retailPrice: 19.50,
            customerTier: 1,
            exchangeRate: 18.50,
            countryFactor: '1.0',
            gridLocation: 'coastal'
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
    module.exports = SimplifiedFuelPricingCalculator;
}