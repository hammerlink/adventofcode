use std::cmp::{self, Ordering};

use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(untagged)]
pub enum SignalValue {
    Number(i8),
    Array(Vec<SignalValue>),
}

#[allow(dead_code)]
pub fn compare_signal_pair(left_raw: &SignalValue, right_raw: &SignalValue) -> Ordering {
    let left_first = is_left_first(left_raw.clone(), right_raw.clone());
    if left_first.is_some() {
        let value = left_first.unwrap();
        if value {
            return Ordering::Less;
        }
        return Ordering::Greater;
    }
    Ordering::Equal
}

fn is_left_first(left: SignalValue, right: SignalValue) -> Option<bool> {
    let mut left = left;
    let mut right = right;
    let is_left_num = left.is_num_value();
    let is_right_num = right.is_num_value();

    if is_left_num && is_right_num {
        let left_value = left.to_value();
        let right_value = right.to_value();
        if left_value < right_value {
            return Some(true);
        } else if left_value > right_value {
            return Some(false);
        }
        return None;
    }

    if is_left_num {
        left = SignalValue::Array(vec![SignalValue::Number(left.to_value().unwrap())]);
    } else if is_right_num {
        right = SignalValue::Array(vec![SignalValue::Number(right.to_value().unwrap())])
    }

    let left_list = left.borrow_list().unwrap();
    let right_list = right.borrow_list().unwrap();
    let left_len = left_list.len();
    let right_len = right_list.len();
    let max_len = cmp::max(left_len, right_len);

    for i in 0..max_len {
        if i >= left_len {
            return Some(true);
        }
        if i >= right_len {
            return Some(false);
        }

        let is_index_left_first = is_left_first(left_list[i].clone(), right_list[i].clone());
        if is_index_left_first.is_some() {
            return is_index_left_first;
        }
    }

    None
}

pub trait SignalProcessing {
    fn borrow_list(&self) -> Option<&Vec<SignalValue>>;
    fn borrow_mut_list(&mut self) -> Option<&mut Vec<SignalValue>>;
    fn to_list(self) -> Vec<SignalValue>;
    fn to_value(&self) -> Option<i8>;
    fn is_num_value(&self) -> bool;
    fn is_same_type(&self, other: &SignalValue) -> bool;
    fn index_of(&self, element: &SignalValue) -> isize;
    fn set_element(&mut self, element: SignalValue, index: isize);
}

impl SignalProcessing for SignalValue {
    fn borrow_list(&self) -> Option<&Vec<SignalValue>> {
        self.is_num_value();
        match self {
            SignalValue::Array(v) => Some(v),
            _ => None,
        }
    }

    fn to_list(self) -> Vec<SignalValue> {
        match self {
            SignalValue::Array(v) => v,
            SignalValue::Number(v) => vec![SignalValue::Number(v)],
        }
    }

    fn to_value(&self) -> Option<i8> {
        match self {
            SignalValue::Number(v) => Some(*v),
            _ => None,
        }
    }

    fn is_same_type(&self, other: &SignalValue) -> bool {
        match (self, other) {
            (SignalValue::Number(_), SignalValue::Number(_)) => true,
            (SignalValue::Array(_), SignalValue::Array(_)) => true,
            _ => false,
        }
    }

    fn is_num_value(&self) -> bool {
        match self {
            SignalValue::Number(v) => true,
            _ => false,
        }
    }

    fn index_of(&self, element: &SignalValue) -> isize {
        let list = self.borrow_list().unwrap();
        for (index, list_element) in list.into_iter().enumerate() {
            if std::ptr::eq(list_element, element) {
                return index as isize;
            }
        }
        return -1;
    }

    fn set_element(&mut self, element: SignalValue, index: isize) {
        let list = self.borrow_mut_list().unwrap();
        list[index as usize] = element;
    }

    fn borrow_mut_list(&mut self) -> Option<&mut Vec<SignalValue>> {
        self.is_num_value();
        match self {
            SignalValue::Array(v) => Some(v),
            _ => None,
        }
    }
}

#[test]
fn signal_index_of() {
    let signal: SignalValue =
        SignalValue::Array(vec![SignalValue::Number(1), SignalValue::Number(2)]);
    let list = signal.borrow_list().unwrap();
    assert!(signal.index_of(&list[1]) == 1);
}
