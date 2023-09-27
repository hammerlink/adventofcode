use std::cmp::Ordering;

use super::signal_value::{compare_signal_pair, SignalValue};

pub struct SignalPair {
    pub left_parsed: SignalValue,
    pub right_parsed: SignalValue,
}

// Implement display for SignalPair instead of defining print() function in a trait

impl SignalPair {
    pub fn is_correct_order(&self) -> bool {
        // Using a match statement here is more readable
        // match compare_signal_pair(&self.left_parsed, &self.right_parsed) {
        //     Ordering::Less => true,
        //     _ => false
        // }
        let comparison = compare_signal_pair(&self.left_parsed, &self.right_parsed);
        if comparison == Ordering::Less {
            return true;
        }
        false
    }
}
