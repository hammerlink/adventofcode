import {FileEngine} from '../engine/file.engine';
import * as assert from 'assert';

export namespace Y2020_Day21 {
    export interface Food {
        ingredients: string[];
        allergen: string[];
    }

    export interface Allergen {
        foods: Food[],
        name: string;
        ingredient?: Ingredient;
    }

    export interface Ingredient {
        foods: Food[],
        name: string;
        allergen?: Allergen;
    }

    export interface IngredientMap {
        ingredients: {[ingredient: string]: Ingredient};
        allergens: {[allergen: string]: Allergen};
    }

    export function parseLine(lineInput: string): Food {
        const containsPart = lineInput.match(/(\s\(contains.*\))/)[1];
        const line = lineInput.replace(containsPart, '');
        const ingredients = line.split(' ');
        const allergen = containsPart.match(/contains (.*)\)/)[1].split(', ');
        return {ingredients, allergen};
    }

    export function checkAllPossibleIngredients(allergen: Allergen, ingredientMap: IngredientMap) {
        if (allergen.ingredient) return;
        const possible: {[ingredient: string]: number}= {};
        allergen.foods.forEach(food => {
            food.ingredients.forEach(ingredient => {
                if (ingredientMap.ingredients[ingredient].allergen) return;
                if (!possible[ingredient]) possible[ingredient] = 0; // check for allergen on ingredient
                possible[ingredient]++;
            })
        });
        let foodCount = allergen.foods.length;
        const possibleIngredients = Object.keys(possible).filter(ingredient => possible[ingredient] === foodCount);
        if (possibleIngredients.length === 0) throw new Error('no matches possible');
        if (possibleIngredients.length === 1) {
            allergen.ingredient = ingredientMap.ingredients[possibleIngredients[0]];
            allergen.ingredient.allergen = allergen;
        }
    }


    export function mapAllergen(foods: Food[]): IngredientMap {
        const ingredientMap: IngredientMap = {ingredients: {}, allergens: {}};
        foods.forEach((food, index) => {
            food.ingredients.forEach(ingredient => {
                if (!ingredientMap.ingredients[ingredient]) ingredientMap.ingredients[ingredient] = {foods: [], name: ingredient};
                if (!ingredientMap.ingredients[ingredient].foods.includes(food)) ingredientMap.ingredients[ingredient].foods.push(food);
                food.allergen.forEach(allergen => {
                    if (!ingredientMap.allergens[allergen]) ingredientMap.allergens[allergen] = {foods: [], name: allergen};
                    if (!ingredientMap.allergens[allergen].foods.includes(food)) ingredientMap.allergens[allergen].foods.push(food);
                });
            });
        });
        while (Object.keys(ingredientMap.allergens).filter(x => !ingredientMap.allergens[x].ingredient).length) {
            Object.keys(ingredientMap.allergens)
                .forEach(x => checkAllPossibleIngredients(ingredientMap.allergens[x], ingredientMap));
        }
        return ingredientMap;
    }

    export function part1(lines: string[]): number {
        const foods = lines.map(parseLine);
        const ingredientMap = mapAllergen(foods);
        return Object.keys(ingredientMap.ingredients)
            .map(ingredient => ingredientMap.ingredients[ingredient])
            .filter(ingredient => !ingredient.allergen)
            .reduce((t, v) => t += v.foods.length, 0);
    }

    export function part2(lines: string[]): string {
        const foods = lines.map(parseLine);
        const ingredientMap = mapAllergen(foods);

        return Object.keys(ingredientMap.allergens)
            .sort()
            .map(allergen => ingredientMap.allergens[allergen])
            .map(allergen => allergen.ingredient.name)
            .join(',');
    }

}

if (!module.parent) {
    const path = require('path');

    async function main() {

        const exampleLines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day21.example'), false);

        assert.strictEqual(Y2020_Day21.part1(exampleLines), 5, 'example 1 part 1');

        assert.strictEqual(Y2020_Day21.part2(exampleLines), 'mxmxvkd,sqjhc,fvjkl', 'example 1 part 2');

        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), './data/y2020_day21.input'), false);
        // part 1
        const part1Result = Y2020_Day21.part1(lines);
        console.log(part1Result);

        // part 2
        const part2Result = Y2020_Day21.part2(lines);
        console.log(part2Result);
    }

    main().catch(err => console.error(err));
}
