import math

def calculate_factor_of_safety(
    slope_angle_deg: float,
    soil_moisture_pct: float,
    cohesion_kpa: float = 12.0,
    friction_angle_deg: float = 28.0,
    soil_depth_m: float = 2.0,
    tilt_mm_m: float = 0.0
) -> float:
    """
    Computes the Factor of Safety (FoS) for infinite slope stability in hilly terrain.
    FoS < 1.0 indicates unstable/landslide prone state.
    """
    # Convert degrees to radians
    theta = math.radians(max(slope_angle_deg, 5.0))
    phi = math.radians(friction_angle_deg)
    
    # Soil physical constants
    gamma_dry = 18.0   # kN/m3 (Soil unit weight)
    gamma_w = 9.81     # kN/m3 (Water unit weight)
    
    # Saturation ratio m (0.0 to 1.0)
    m = min(max(soil_moisture_pct / 100.0, 0.05), 1.0)
    
    # Total unit weight of moist soil
    gamma_sat = gamma_dry + (m * 2.0)
    
    # Effective cohesion reduction due to tilt/structural shearing
    c_eff = max(cohesion_kpa - (tilt_mm_m * 1.5), 1.0)
    
    # Numerator: Resisting Shear Strength
    resisting = c_eff + ((gamma_sat - (m * gamma_w)) * soil_depth_m * (math.cos(theta) ** 2) * math.tan(phi))
    
    # Denominator: Driving Shear Stress
    driving = gamma_sat * soil_depth_m * math.sin(theta) * math.cos(theta)
    
    if driving <= 0:
        return 3.0
        
    fos = resisting / driving
    return round(float(fos), 2)
