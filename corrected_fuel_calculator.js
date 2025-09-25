// CORRECTED FUEL PRICING CALCULATOR - JAVASCRIPT VERSION
// All calculations done per liter first, then scaled by volume

function calculateFuelPrice(tierLevel, country, gridLocation) {
    /**
     * Calculate fuel pricing with proper per-liter logic
     * 
     * @param {number} tierLevel - Customer pricing tier (1-14)
     * @param {string} country - 'south-africa', 'zimbabwe', 'botswana'
     * @param {string} gridLocation - 'coastal' or 'inland'
     * @returns {Object} Complete price breakdown per liter and total costs
     */
    
    // Base data (all per liter)
    const model = {
        wholesaleBase: {
            'south-africa': 18.50, 
            'zimbabwe': 19.20, 
            'botswana': 18.80
        },
        retailMargins: {
            'south-africa': 3.00, 
            'zimbabwe': 3.60, 
            'botswana': 3.10
        },
        transportCosts: {
            'coastal': 0.25, 
            'inland': 0.45
        },
        tierDiscounts: {
            1: 0.00, 2: 0.02, 3: 0.04, 4: 0.06, 5: 0.08, 6: 0.10,
            7: 0.12, 8: 0.14, 9: 0.16, 10: 0.18, 11: 0.20, 12: 0.22,
            13: 0.24, 14: 0.26
        },
        currencyRisk: {
            'south-africa': 0.02, 
            'zimbabwe': 0.05, 
            'botswana': 0.03
        },
        politicalRisk: {
            'south-africa': 0.01, 
            'zimbabwe': 0.08, 
            'botswana': 0.02
        },
        volumeEstimates: {
            1: 2500, 2: 3200, 3: 4000, 4: 4800, 5: 5600, 6: 6878,
            7: 7500, 8: 8200, 9: 9000, 10: 9800, 11: 10500, 12: 11200,
            13: 12000, 14: 12800
        }
    };
    
    // STEP 1: Get base inputs (all per liter)
    const wholesalePricePerLiter = model.wholesaleBase[country];
    const retailMarginPerLiter = model.retailMargins[country];
    const transportCostPerLiter = model.transportCosts[gridLocation];
    const estimatedVolume = model.volumeEstimates[tierLevel];
    
    // STEP 2: Calculate base retail price per liter
    const baseRetailPricePerLiter = wholesalePricePerLiter + retailMarginPerLiter;
    
    // STEP 3: Apply tier discount (percentage of base retail)
    const tierDiscountPct = model.tierDiscounts[tierLevel];
    const tierDiscountPerLiter = baseRetailPricePerLiter * tierDiscountPct;
    const priceAfterDiscountPerLiter = baseRetailPricePerLiter - tierDiscountPerLiter;
    
    // STEP 4: Add transport cost per liter
    const priceAfterTransportPerLiter = priceAfterDiscountPerLiter + transportCostPerLiter;
    
    // STEP 5: Apply risk premiums as percentages
    const currencyRiskPct = model.currencyRisk[country];
    const politicalRiskPct = model.politicalRisk[country];
    
    const currencyRiskPerLiter = priceAfterTransportPerLiter * currencyRiskPct;
    const politicalRiskPerLiter = priceAfterTransportPerLiter * politicalRiskPct;
    
    // STEP 6: Calculate final retail price per liter
    const finalRetailPricePerLiter = priceAfterTransportPerLiter + 
                                     currencyRiskPerLiter + 
                                     politicalRiskPerLiter;
    
    // STEP 7: Calculate total cost for volume
    const totalCost = finalRetailPricePerLiter * estimatedVolume;
    
    return {
        // Per-liter breakdown
        wholesalePricePerLiter: parseFloat(wholesalePricePerLiter.toFixed(2)),
        retailMarginPerLiter: parseFloat(retailMarginPerLiter.toFixed(2)),
        baseRetailPricePerLiter: parseFloat(baseRetailPricePerLiter.toFixed(2)),
        tierDiscountPerLiter: parseFloat(tierDiscountPerLiter.toFixed(2)),
        priceAfterDiscountPerLiter: parseFloat(priceAfterDiscountPerLiter.toFixed(2)),
        transportCostPerLiter: parseFloat(transportCostPerLiter.toFixed(2)),
        priceAfterTransportPerLiter: parseFloat(priceAfterTransportPerLiter.toFixed(2)),
        currencyRiskPerLiter: parseFloat(currencyRiskPerLiter.toFixed(2)),
        politicalRiskPerLiter: parseFloat(politicalRiskPerLiter.toFixed(2)),
        finalRetailPricePerLiter: parseFloat(finalRetailPricePerLiter.toFixed(2)),
        
        // Volume calculations
        estimatedVolume: estimatedVolume,
        totalCost: parseFloat(totalCost.toFixed(2)),
        
        // Percentages for reference
        tierDiscountPct: tierDiscountPct,
        currencyRiskPct: currencyRiskPct,
        politicalRiskPct: politicalRiskPct
    };
}

function printCalculationTable(result) {
    /**
     * Print a clean table of the calculation breakdown to console
     */
    console.log("\n" + "=".repeat(60));
    console.log("FUEL PRICING CALCULATION BREAKDOWN");
    console.log("=".repeat(60));
    
    const table = {
        'Wholesale Price/L': `R${result.wholesalePricePerLiter.toFixed(2)}`,
        'Retail Margin/L': `R${result.retailMarginPerLiter.toFixed(2)}`,
        'Base Retail/L': `R${result.baseRetailPricePerLiter.toFixed(2)}`,
        'Tier Discount/L': `-R${result.tierDiscountPerLiter.toFixed(2)} (${(result.tierDiscountPct*100).toFixed(1)}%)`,
        'After Discount/L': `R${result.priceAfterDiscountPerLiter.toFixed(2)}`,
        'Transport Cost/L': `R${result.transportCostPerLiter.toFixed(2)}`,
        'After Transport/L': `R${result.priceAfterTransportPerLiter.toFixed(2)}`,
        'Currency Risk/L': `R${result.currencyRiskPerLiter.toFixed(2)} (${(result.currencyRiskPct*100).toFixed(1)}%)`,
        'Political Risk/L': `R${result.politicalRiskPerLiter.toFixed(2)} (${(result.politicalRiskPct*100).toFixed(1)}%)`,
        'FINAL PRICE/L': `R${result.finalRetailPricePerLiter.toFixed(2)}`,
        'Volume (L)': result.estimatedVolume.toLocaleString(),
        'TOTAL COST': `R${result.totalCost.toFixed(2)}`
    };
    
    console.table(table);
}

// Example usage:
if (typeof window === 'undefined') {
    // Node.js environment
    const result = calculateFuelPrice(6, 'zimbabwe', 'inland');
    printCalculationTable(result);
    
    // Test scenarios
    const scenarios = [
        [1, 'south-africa', 'coastal'],
        [6, 'zimbabwe', 'inland'],
        [14, 'botswana', 'coastal']
    ];
    
    console.log("\nSCENARIO COMPARISONS:");
    console.log("-".repeat(80));
    console.log("Tier".padEnd(6) + "Country".padEnd(12) + "Location".padEnd(8) + 
                "Final Price/L".padEnd(15) + "Volume".padEnd(8) + "Total Cost");
    console.log("-".repeat(80));
    
    scenarios.forEach(([tier, country, location]) => {
        const result = calculateFuelPrice(tier, country, location);
        console.log(
            tier.toString().padEnd(6) + 
            country.padEnd(12) + 
            location.padEnd(8) + 
            `R${result.finalRetailPricePerLiter.toFixed(2)}`.padEnd(15) + 
            result.estimatedVolume.toLocaleString().padEnd(8) + 
            `R${result.totalCost.toFixed(2)}`
        );
    });
}

// For browser usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculateFuelPrice, printCalculationTable };
}