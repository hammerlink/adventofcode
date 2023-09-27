use std::cmp::{self, Ordering};

use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(untagged)]
pub enum SignalValue {
    Number(i8),
    Array(Vec<SignalValue>),
}

// Implement display for SignalValue

#[allow(dead_code)]
pub fn compare_signal_pair(left_raw: &SignalValue, right_raw: &SignalValue) -> Ordering {
    let left_first = is_left_first(left_raw.clone(), right_raw.clone());
    // using unwrap is not necessary here. Instead:
    match left_first {
        Some(value) => match value {
            true => Ordering::Less,
            false => Ordering::Greater,
        },
        None => Ordering::Equal,
    }
}

fn is_left_first(left: SignalValue, right: SignalValue) -> Option<bool> {
    // Pass signal values as mutable ref instead of initializing them as a new mutable variable
    // Ignoring the first comment, I don't see a place where you are modifying the values, so why declare them as mutable?
    let mut left = left;
    let mut right = right;

    // Creating an is_num_value_or_none function would avoid a lot of unwraps in this entire
    // function
    //match (left.num_value_or_none(), right.num_value_or_none()) {
    //    Some(a), Some(b) => ...,
    //    Some(a), None => ...,
    //    None, None => ...,
    //}

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
    }

    // Using unwrap this much is really bad practice
    // The program will crash with any unexpected value (what if I have is_left_num set to true, while the left
    // variable doesn't have a value? => the program crashes)
    // Instead, you should make use of Result types or Option types more, or avoid unwrapping by
    // using the method I described at the top of this function (method does not build yet, I haven't
    // finished it)
    if is_left_num {
        left = SignalValue::Array(vec![SignalValue::Number(left.to_value().unwrap())]);
    } else if is_right_num {
        right = SignalValue::Array(vec![SignalValue::Number(right.to_value().unwrap())])
    }

    // Again here: program will crash if the list is empty
    // Maybe let the borrow_list function return an empty list instead of using an option?
    // Or create a borrow_list_len() function that returns 0 if list doesn't exist?
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

        // Same comment here as at the top of this function: I think you can pass references to
        // this function instead of cloning them
        let is_index_left_first = is_left_first(left_list[i].clone(), right_list[i].clone());
        if is_index_left_first.is_some() {
            return is_index_left_first;
        }
    }

    None
}

// A trait generally defines some kind of behavior for a struct (e.g. the Display trait defines
// how an object should be displayed in a string format, and the Clone trait defines how an object
// should be cloned)
// In that regard, I cannot really tell from the naming and/or the set of functions which behavior is
// defined with this trait
pub trait SignalProcessing {
    fn borrow_list(&self) -> Option<&Vec<SignalValue>>;
    fn borrow_mut_list(&mut self) -> Option<&mut Vec<SignalValue>>;
    fn to_list(self) -> Vec<SignalValue>;
    fn to_value(&self) -> Option<i8>;
    fn is_num_value(&self) -> bool;
    fn is_same_type(&self, other: &SignalValue) -> bool;
    fn index_of(&self, element: &SignalValue) -> isize;
    fn set_element(&mut self, element: SignalValue, index: isize);
    fn print(&self);
    fn num_value_or_none(&self) -> Option<i8>;
}

impl SignalProcessing for SignalValue {
    fn num_value_or_none(&self) -> Option<i8> {
        match self {
            SignalValue::Number(n) => Some(*n),
            _ => None,
        }
    }

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
        // This would be easier:
        // matches!((self, other), (SignalValue::Number(_), SignalValue::Number(_)) | (SignalValue::Array(_), SignalValue::Array(_)))
    }

    fn is_num_value(&self) -> bool {
        match self {
            SignalValue::Number(_) => true,
            _ => false,
        }
        // This would be easier:
        // matches!(self, SignalValue::Number(_))
    }

    // Returning an option instead of -1 here would make more sense in my opinion
    fn index_of(&self, element: &SignalValue) -> isize {
        let list = self.borrow_list().unwrap();

        // https://stackoverflow.com/a/37482592
        // let res = list.iter().position(|s| std::ptr::eq(s, element));
        for (index, list_element) in list.into_iter().enumerate() {
            if std::ptr::eq(list_element, element) {
                return index as isize;
            }
        }
        return -1;
        // in this case, just typing "-1" is the same as "return -1;"
    }

    // An isize as index does not really make sense I think
    fn set_element(&mut self, element: SignalValue, index: isize) {
        let list = self.borrow_mut_list().unwrap();
        // What if the index doesn't exist in the list? => panic
        list[index as usize] = element;
    }

    fn borrow_mut_list(&mut self) -> Option<&mut Vec<SignalValue>> {
        self.is_num_value();
        match self {
            SignalValue::Array(v) => Some(v),
            _ => None,
        }
    }

    // Implement the Display trait instead of writing a custom function
    fn print(&self) {
        println!("{}", serde_json::to_string(&self).unwrap());
    }
}

#[test]
fn signal_index_of() {
    let signal: SignalValue =
        SignalValue::Array(vec![SignalValue::Number(1), SignalValue::Number(2)]);
    let list = signal.borrow_list().unwrap();
    assert!(signal.index_of(&list[1]) == 1);
}
