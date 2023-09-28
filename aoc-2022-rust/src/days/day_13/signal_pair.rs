use std::cmp::Ordering;

use super::signal_value::{compare_signal_pair, SignalValue};

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
        false
    }
}
