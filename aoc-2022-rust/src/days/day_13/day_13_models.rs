use std::{cmp, mem};

use serde::{Deserialize, Serialize};

pub struct SignalPair {
    pub left_parsed: JsonValue,
    pub left_flat: Vec<i8>,
    pub right_parsed: JsonValue,
    pub right_flat: Vec<i8>,
}

impl SignalPair {
    #[allow(dead_code)]
    pub fn is_correct_order(&self) -> bool {
        let raw = compare_distress_signals(&self.left_parsed, &self.right_parsed);
        if raw.is_none() {
            return true;
        }
        return raw.unwrap();
    }

    pub fn fix_mixed_types(&mut self) {
        let left = mem::replace(&mut self.left_parsed, JsonValue::Number(0));
        let right = mem::replace(&mut self.right_parsed, JsonValue::Number(0));
        let result = fix_mixed_types(left, right);
        self.left_parsed = result.0;
        self.right_parsed = result.1;
    }

    pub fn print(&self) {
        let left_string = serde_json::to_string(&self.left_parsed).unwrap();
        println!("{}", left_string);
        println!("{}", serde_json::to_string(&self.right_parsed).unwrap());
    }
}

#[allow(dead_code)]
fn fix_mixed_types(left: JsonValue, right: JsonValue) -> (JsonValue, JsonValue) {
    let mut left = left;
    let mut right = right;
    let is_equal_type = is_same_value_type(&left, &right);
    let is_left_i8 = is_json_value_i8(&left);

    if is_equal_type && is_left_i8 {
        return (left, right);
    }

    if !is_equal_type {
        // CONVERT TO SAME TYPE
        if is_left_i8 {
            left = JsonValue::Array(vec![left]);
        } else {
            right = JsonValue::Array(vec![right]);
        }
    }
    let mut left_list: Vec<JsonValue> = vec![];
    left = {
        left_list = get_list_value(left);
        JsonValue::Number(0)
    };
    let mut right_list: Vec<JsonValue> = vec![];
    right = {
        right_list = get_list_value(right);
        JsonValue::Number(0)
    };
    let left_len = left_list.len();
    let right_len = right_list.len();
    let max_len = cmp::max(left_len, right_len);

    for i in 0..max_len {
        // out of bounds, no longer necessary to fix mix types
        if i >= left_len || i >= right_len {
            return (JsonValue::Array(left_list), JsonValue::Array(right_list));
        }
        let left_item = mem::replace(&mut left_list[i], JsonValue::Number(0));
        let right_item = mem::replace(&mut right_list[i], JsonValue::Number(0));

        let fixed_couple = fix_mixed_types(left_item, right_item);
        left_list[i] = fixed_couple.0;
        right_list[i] = fixed_couple.1;
    }
    (JsonValue::Array(left_list), JsonValue::Array(right_list))
}

fn compare_distress_signals(left: &JsonValue, right: &JsonValue) -> Option<bool> {
    let is_left_i8 = is_json_value_i8(&left);
    let is_equal_type = is_same_value_type(&left, &right);

    if is_left_i8 && is_equal_type {
        return is_correct_order(get_i8_value(&left), get_i8_value(&right));
    }

    let left_list = get_borrowed_list_value(left).unwrap();
    let right_list = get_borrowed_list_value(right).unwrap();
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

        let compare = compare_distress_signals(&left_list[i], &right_list[i]);
        if compare.is_some() {
            return compare;
        }
    }
    Some(true)
}

pub fn flatten_json_value(json_value: &JsonValue, result: &mut Vec<i8>) {
    match json_value {
        JsonValue::Number(num) => {
            result.push(*num);
        }
        JsonValue::Array(array) => {
            for item in array {
                flatten_json_value(item, result);
            }
        }
    }
}

fn is_same_value_type(a: &JsonValue, b: &JsonValue) -> bool {
    match (a, b) {
        (JsonValue::Number(_), JsonValue::Number(_)) => true,
        (JsonValue::Array(_), JsonValue::Array(_)) => true,
        _ => false,
    }
}

fn is_json_value_i8(input: &JsonValue) -> bool {
    match input {
        JsonValue::Number(_) => true,
        _ => false,
    }
}

fn get_i8_value(input: &JsonValue) -> i8 {
    match input {
        JsonValue::Number(v) => *v,
        _ => -1,
    }
}

fn get_borrowed_list_value(input: &JsonValue) -> Option<&Vec<JsonValue>> {
    match input {
        JsonValue::Array(v) => Some(v),
        _ => None,
    }
}

fn get_list_value(input: JsonValue) -> Vec<JsonValue> {
    match input {
        JsonValue::Array(v) => v,
        _ => vec![],
    }
}

fn is_correct_order(left: i8, right: i8) -> Option<bool> {
    if left < right {
        return Some(true);
    } else if left > right {
        return Some(false);
    }
    None
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(untagged)]
pub enum JsonValue {
    Number(i8),
    Array(Vec<JsonValue>),
}

#[test]
fn compare_enum_types() {
    let empty_list: Vec<JsonValue> = vec![];
    let is_match = is_same_value_type(&JsonValue::Number(8), &JsonValue::Array(empty_list));
    assert_eq!(is_match, false);
    assert_eq!(
        is_same_value_type(&JsonValue::Number(8), &JsonValue::Number(7)),
        true
    );
}
