use std::fmt;

#[derive(Clone)]
#[allow(dead_code)]
pub enum CaveMaterial {
    Rock,
    Sand,
    Air,
    RestedSand,
}
impl fmt::Display for CaveMaterial {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let result = match self {
            CaveMaterial::Rock => "#",
            CaveMaterial::Sand => "+",
            CaveMaterial::RestedSand => "o",
            _ => ".",
        };
        write!(f, "{}", result)
    }
}
#[test]
fn print_material() {
    assert_eq!(format!("{}", CaveMaterial::Rock), "#");
    assert_eq!(format!("{}", CaveMaterial::Sand), "+");
    assert_eq!(format!("{}", CaveMaterial::Air), ".");
}
