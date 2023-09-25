use std::cmp::{self, Ordering};

use super::signal_value::{SignalProcessing, SignalValue, compare_signal_pair};

pub struct SignalPair {
    pub left_parsed: SignalValue,
    pub right_parsed: SignalValue,
}


impl SignalPair {
    #[allow(dead_code)]
    pub fn is_correct_order(&self) -> bool {
        let comparison = compare_signal_pair(&self.left_parsed, &self.right_parsed);
        if comparison == Ordering::Less {
            return true;
        }
        return false;
    }

    pub fn print(&self) {
        let left_string = serde_json::to_string(&self.left_parsed).unwrap();
        println!("{}", left_string);
        println!("{}", serde_json::to_string(&self.right_parsed).unwrap());
    }
}
