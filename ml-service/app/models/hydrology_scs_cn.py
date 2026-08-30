def calculate_scs_cn_runoff(
    rainfall_3h_mm: float,
    soil_moisture_pct: float,
    curve_number_base: float = 75.0
) -> dict:
    """
    SCS Curve Number (SCS-CN) method adapted for antecedent soil moisture condition (AMC).
    AMC I (dry, soil_moisture < 50%) -> CN lower
    AMC II (normal, 50% <= soil_moisture < 75%) -> CN base
    AMC III (saturated, soil_moisture >= 75%) -> CN higher
    """
    cn_base = curve_number_base
    
    if soil_moisture_pct >= 80.0:
        # AMC III: Wet/Saturated
        cn = (4.2 * cn_base) / (10.0 + (0.042 * cn_base))
    elif soil_moisture_pct < 45.0:
        # AMC I: Dry
        cn = (0.42 * cn_base) / (10.0 - (0.058 * cn_base))
    else:
        # AMC II: Normal
        cn = cn_base
        
    cn = max(min(cn, 98.0), 30.0)
    
    # Potential maximum retention after runoff begins S (in mm)
    S = (25400.0 / cn) - 254.0
    
    # Initial abstraction I_a (typically 0.2 * S)
    I_a = 0.2 * S
    
    P = max(rainfall_3h_mm, 0.0)
    
    if P <= I_a:
        runoff_mm = 0.0
    else:
        runoff_mm = ((P - I_a) ** 2) / (P - I_a + S)
        
    # Runoff ratio
    runoff_ratio = (runoff_mm / P) if P > 0 else 0.0
    
    return {
        "cn_adjusted": round(float(cn), 1),
        "potential_retention_s_mm": round(float(S), 1),
        "initial_abstraction_ia_mm": round(float(I_a), 1),
        "runoff_depth_mm": round(float(runoff_mm), 2),
        "runoff_ratio": round(float(runoff_ratio), 3)
    }
