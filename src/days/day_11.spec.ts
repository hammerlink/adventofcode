import {expect} from "chai";
import {Day11} from "./day_11";
import Direction = Day11.Direction;

describe('day 11', function () {
    describe('part 1', function () {
        it('should turn in all directions', function () {
            expect(Day11.changeDirection(Direction.UP, 1)).equals(Direction.RIGHT);
            expect(Day11.changeDirection(Direction.RIGHT, 1)).equals(Direction.DOWN);
            expect(Day11.changeDirection(Direction.DOWN, 1)).equals(Direction.LEFT);
            expect(Day11.changeDirection(Direction.LEFT, 1)).equals(Direction.UP);

            expect(Day11.changeDirection(Direction.UP, 0)).equals(Direction.LEFT);
            expect(Day11.changeDirection(Direction.LEFT, 0)).equals(Direction.DOWN);
            expect(Day11.changeDirection(Direction.DOWN, 0)).equals(Direction.RIGHT);
            expect(Day11.changeDirection(Direction.RIGHT, 0)).equals(Direction.UP);
        });
    });
});
