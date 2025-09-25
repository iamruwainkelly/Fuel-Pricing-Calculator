# CORRECTED FUEL PRICING CALCULATOR - PYTHON VERSION
# All calculations done per liter first, then scaled by volume

def calculate_fuel_price(tier_level, country, grid_location):
    """
    Calculate fuel pricing with proper per-liter logic
    
    Args:
        tier_level: int (1-14) - Customer pricing tier
        country: str - 'south-africa', 'zimbabwe', 'botswana'
        grid_location: str - 'coastal' or 'inland'
    
    Returns:
        dict: Complete price breakdown per liter and total costs
    """
    
    # Base data (all per liter)
    model = {
        'wholesale_base': {
            'south-africa': 18.50, 
            'zimbabwe': 19.20, 
            'botswana': 18.80
        },
        'retail_margins': {
            'south-africa': 3.00, 
            'zimbabwe': 3.60, 
            'botswana': 3.10
        },
        'transport_costs': {
            'coastal': 0.25, 
            'inland': 0.45
        },
        'tier_discounts': {
            1: 0.00, 2: 0.02, 3: 0.04, 4: 0.06, 5: 0.08, 6: 0.10,
            7: 0.12, 8: 0.14, 9: 0.16, 10: 0.18, 11: 0.20, 12: 0.22,
            13: 0.24, 14: 0.26
        },
        'currency_risk': {
            'south-africa': 0.02, 
            'zimbabwe': 0.05, 
            'botswana': 0.03
        },
        'political_risk': {
            'south-africa': 0.01, 
            'zimbabwe': 0.08, 
            'botswana': 0.02
        },
        'volume_estimates': {
            1: 2500, 2: 3200, 3: 4000, 4: 4800, 5: 5600, 6: 6878,
            7: 7500, 8: 8200, 9: 9000, 10: 9800, 11: 10500, 12: 11200,
            13: 12000, 14: 12800
        }
    }
    
    # STEP 1: Get base inputs (all per liter)
    wholesale_price_per_liter = model['wholesale_base'][country]
    retail_margin_per_liter = model['retail_margins'][country]
    transport_cost_per_liter = model['transport_costs'][grid_location]
    estimated_volume = model['volume_estimates'][tier_level]
    
    # STEP 2: Calculate base retail price per liter
    base_retail_price_per_liter = wholesale_price_per_liter + retail_margin_per_liter
    
    # STEP 3: Apply tier discount (percentage of base retail)
    tier_discount_pct = model['tier_discounts'][tier_level]
    tier_discount_per_liter = base_retail_price_per_liter * tier_discount_pct
    price_after_discount_per_liter = base_retail_price_per_liter - tier_discount_per_liter
    
    # STEP 4: Add transport cost per liter
    price_after_transport_per_liter = price_after_discount_per_liter + transport_cost_per_liter
    
    # STEP 5: Apply risk premiums as percentages
    currency_risk_pct = model['currency_risk'][country]
    political_risk_pct = model['political_risk'][country]
    
    currency_risk_per_liter = price_after_transport_per_liter * currency_risk_pct
    political_risk_per_liter = price_after_transport_per_liter * political_risk_pct
    
    # STEP 6: Calculate final retail price per liter
    final_retail_price_per_liter = (price_after_transport_per_liter + 
                                    currency_risk_per_liter + 
                                    political_risk_per_liter)
    
    # STEP 7: Calculate total cost for volume
    total_cost = final_retail_price_per_liter * estimated_volume
    
    return {
        # Per-liter breakdown
        'wholesale_price_per_liter': round(wholesale_price_per_liter, 2),
        'retail_margin_per_liter': round(retail_margin_per_liter, 2),
        'base_retail_price_per_liter': round(base_retail_price_per_liter, 2),
        'tier_discount_per_liter': round(tier_discount_per_liter, 2),
        'price_after_discount_per_liter': round(price_after_discount_per_liter, 2),
        'transport_cost_per_liter': round(transport_cost_per_liter, 2),
        'price_after_transport_per_liter': round(price_after_transport_per_liter, 2),
        'currency_risk_per_liter': round(currency_risk_per_liter, 2),
        'political_risk_per_liter': round(political_risk_per_liter, 2),
        'final_retail_price_per_liter': round(final_retail_price_per_liter, 2),
        
        # Volume calculations
        'estimated_volume': estimated_volume,
        'total_cost': round(total_cost, 2),
        
        # Percentages for reference
        'tier_discount_pct': tier_discount_pct,
        'currency_risk_pct': currency_risk_pct,
        'political_risk_pct': political_risk_pct
    }

def print_calculation_table(result):
    """Print a clean table of the calculation breakdown"""
    print("\n" + "="*60)
    print("FUEL PRICING CALCULATION BREAKDOWN")
    print("="*60)
    print(f"{'Component':<25} {'Per Liter':<15} {'Details':<20}")
    print("-"*60)
    print(f"{'Wholesale Price':<25} R{result['wholesale_price_per_liter']:<14.2f}")
    print(f"{'+ Retail Margin':<25} R{result['retail_margin_per_liter']:<14.2f}")
    print(f"{'= Base Retail':<25} R{result['base_retail_price_per_liter']:<14.2f}")
    print(f"{'- Tier Discount':<25} -R{result['tier_discount_per_liter']:<13.2f} ({result['tier_discount_pct']*100:.1f}%)")
    print(f"{'= After Discount':<25} R{result['price_after_discount_per_liter']:<14.2f}")
    print(f"{'+ Transport Cost':<25} R{result['transport_cost_per_liter']:<14.2f}")
    print(f"{'= After Transport':<25} R{result['price_after_transport_per_liter']:<14.2f}")
    print(f"{'+ Currency Risk':<25} R{result['currency_risk_per_liter']:<14.2f} ({result['currency_risk_pct']*100:.1f}%)")
    print(f"{'+ Political Risk':<25} R{result['political_risk_per_liter']:<14.2f} ({result['political_risk_pct']*100:.1f}%)")
    print("-"*60)
    print(f"{'FINAL PRICE/LITER':<25} R{result['final_retail_price_per_liter']:<14.2f}")
    print(f"{'Volume (Liters)':<25} {result['estimated_volume']:<14,}")
    print(f"{'TOTAL COST':<25} R{result['total_cost']:<14.2f}")
    print("="*60)

# Example usage:
if __name__ == "__main__":
    # Test the corrected calculation
    result = calculate_fuel_price(
        tier_level=6, 
        country='zimbabwe', 
        grid_location='inland'
    )
    
    print_calculation_table(result)
    
    # Test different scenarios
    scenarios = [
        (1, 'south-africa', 'coastal'),
        (6, 'zimbabwe', 'inland'),
        (14, 'botswana', 'coastal')
    ]
    
    print("\nSCENARIO COMPARISONS:")
    print("-"*80)
    print(f"{'Tier':<6} {'Country':<12} {'Location':<8} {'Final Price/L':<15} {'Volume':<8} {'Total Cost':<12}")
    print("-"*80)
    
    for tier, country, location in scenarios:
        result = calculate_fuel_price(tier, country, location)
        print(f"{tier:<6} {country:<12} {location:<8} R{result['final_retail_price_per_liter']:<14.2f} {result['estimated_volume']:<8,} R{result['total_cost']:<11,.2f}")