import {BasicMap, MapEngine, MapLocation} from "../engine/map.engine";
import newMap = MapEngine.newMap;
import {FileEngine} from "../engine/file.engine";

export namespace Day18 {
    export enum VaultType {
        WALL, KEY, DOOR, ENTRANCE, OPEN
    }

    export interface VaultLocation {
        type: VaultType;
        charCode: number; // key opens door, key - 32 =  door
        value: string;
        opened: boolean;
        currentKeyPath?: number;
    }

    export interface DoorPair {
        [keyCharCode: string]: {
            door: MapLocation<VaultLocation>;
            key: MapLocation<VaultLocation>;
            bestPath: {[key: string]: number};
        };
    }

    export function getVaultType(type: string): VaultType {
        if (type === '#') return VaultType.WALL;
        if (type === '@') return VaultType.ENTRANCE;
        if (type === '.') return VaultType.OPEN;
        const charCode = type.charCodeAt(0);
        if (charCode >= 65 && charCode <= 90) return VaultType.DOOR;
        if (charCode >= 97 && charCode <= 122) return VaultType.KEY;
        throw new Error('vault type not found');
    }

    export function getDoor(key: string): string {
        return String.fromCharCode(key.charCodeAt(0) - 32);
    }

    export function getKey(door: string): string {
        return String.fromCharCode(door.charCodeAt(0) + 32);
    }

    export function isKey(value: string): boolean {
        const charCode = value.charCodeAt(0);
        return charCode >= 97 && charCode <= 122;
    }

    export function isDoor(value: string): boolean {
        const charCode = value.charCodeAt(0);
        return charCode >= 65 && charCode <= 90;
    }

    export function buildMap(lines: string[]): {map: BasicMap<VaultLocation>, doorPairs: DoorPair,
        entryPoint: MapLocation<VaultLocation>} {
        const map: BasicMap<VaultLocation> = newMap();
        let entryPoint: MapLocation<VaultLocation> = null;
        const doorPairs: DoorPair = {};
        for (let y = 0; y < lines.length; y++) {
            const line = lines[y];
            for (let x = 0; x < line.length; x++) {
                const type = Day18.getVaultType(line[x]);
                const vaultLocation: Day18.VaultLocation = {
                    charCode: line.charCodeAt(x),
                    type,
                    value: line[x],
                    opened: type === VaultType.KEY || type === VaultType.ENTRANCE || type === VaultType.OPEN,
                };

                MapEngine.setPointInMap(map, x, y, vaultLocation);

                if (vaultLocation.type === VaultType.KEY) {
                    const key = line[x];
                    if (!doorPairs[key]) doorPairs[key] = {door: null, key: null, bestPath: {}};
                    doorPairs[key].key = MapEngine.getPoint(map, x, y);
                }
                if (vaultLocation.type === VaultType.DOOR) {
                    const key = getKey(line[x]);
                    if (!doorPairs[key]) doorPairs[key] = {door: null, key: null, bestPath: {}};
                    doorPairs[key].door = MapEngine.getPoint(map, x, y);
                }
                if (vaultLocation.type === VaultType.ENTRANCE) {
                    entryPoint = MapEngine.getPoint(map, x, y);
                }
            }
        }
        return {map, doorPairs, entryPoint};
    }

    // build topology, minimum required steps toward each door & required doors to be opened
    export interface VaultTopology { // entrance = target @
        [from: string]: VaultTargets;
    }
    export interface VaultTargets {
        [target: string]: {
            paths: {
                [requiredKeys: string]: {
                    steps: number;
                    path: string;
                };
            };
            path?: string;
            requiredKeys: string[];
            steps: number;
            directLink: boolean;
        };
    }

    export function buildVaultTopology(vaultMap: BasicMap<VaultLocation>, doorPairs: DoorPair,
                                       entryPoint: MapLocation<VaultLocation>): VaultTopology {
        const start = new Date();
        const output: VaultTopology = {};
        // search all points for entrypoint
        output['@'] = mapAllPoints(vaultMap, entryPoint, 0, {});

        for (const key in doorPairs) {
            const keyLocation = doorPairs[key].key;
            output[key] = mapAllPoints(vaultMap, keyLocation, 0, {});
            const door = getDoor(key);
            const doorLocation = doorPairs[key].door;
            if (doorLocation) output[door] = mapAllPoints(vaultMap, doorPairs[key].door, 0, {});
        }
        console.log('topology', new Date().getTime() - start.getTime(), 'ms');
        return output;
    }

    export function mapAllPointsOld(map: BasicMap<VaultLocation>, location: MapLocation<VaultLocation>, stepCount: number,
                                 targets: VaultTargets, requiredKeys: string[]) {
        if (!location || location.value.type === VaultType.WALL
            || (location.value.currentKeyPath !== undefined && location.value.currentKeyPath < stepCount) // do not go the same path, if you have been there faster
        ) return null;
        const type = location.value.type;
        let currentRequiredKeys = requiredKeys;
        if (type === VaultType.DOOR) currentRequiredKeys = [...requiredKeys, getKey(location.value.value)];

        let newKey = null;
        if (stepCount > 0 && ( type === VaultType.KEY || type === VaultType.ENTRANCE )) {
            newKey = location.value.value;
            targets[newKey] = {
                paths: {},
                requiredKeys: currentRequiredKeys,
                steps: stepCount,
                directLink: true,
            };
            return;
        }
        location.value.currentKeyPath = stepCount;

        const coords = [
            [location.x - 1, location.y], [location.x + 1, location.y ],
            [location.x, location.y - 1], [location.x, location.y + 1 ],
        ];
        coords.forEach(v => mapAllPointsOld(map, MapEngine.getPoint(map,v[0],v[1]), stepCount + 1, targets, currentRequiredKeys));

        location.value.currentKeyPath = undefined;
        return targets;
    }

    export function mapAllPoints(map: BasicMap<VaultLocation>, location: MapLocation<VaultLocation>, stepCount: number,
                                 targets: VaultTargets) {
        if (!location || location.value.type === VaultType.WALL
            || (location.value.currentKeyPath !== undefined && location.value.currentKeyPath < stepCount) // do not go the same path, if you have been there faster
        ) return null;
        const type = location.value.type;

        let newKey = null;
        if (stepCount > 0 && ( type === VaultType.KEY || type === VaultType.ENTRANCE || type === VaultType.DOOR)) {
            newKey = location.value.value;
            if (!targets[newKey]) {
                targets[newKey] = {
                    paths: {},
                    requiredKeys: [],
                    steps: stepCount,
                    directLink: true,
                };
                return;
            }
            if (targets[newKey].steps > stepCount) targets[newKey].steps = stepCount;

            return;
        }
        location.value.currentKeyPath = stepCount;

        const coords = [
            [location.x - 1, location.y], [location.x + 1, location.y ],
            [location.x, location.y - 1], [location.x, location.y + 1 ],
        ];
        coords.forEach(v => mapAllPoints(map, MapEngine.getPoint(map,v[0],v[1]), stepCount + 1, targets));

        location.value.currentKeyPath = undefined;
        return targets;
    }


    // todo cache required keys & steps on the current point
    export function gatherAllKeysAsFastAsPossible(topology: AdvancedTopology, keyCount: number,
                                  steps: number = 0, route: string = '@',
                                  cache: {best: number, route: string} = {best: null, route: null}): number {
        if (route.length === keyCount + 1) return steps; // only running on keys, the +1 comes from the @

        if (cache.best && steps >= cache.best) return cache.best;
        const currentKey = route[route.length - 1];
        const currentPoint = topology[currentKey];
        if (!currentPoint.fastCache) currentPoint.fastCache = {};
        const cacheKey = route.split('').sort().join('');
        // if current keys or more keys was faster then stop
        if (currentPoint.fastCache[cacheKey] && currentPoint.fastCache[cacheKey] <= steps) return null;
        currentPoint.fastCache[cacheKey] = steps;

        const routes: Array<{steps: number, route: string}> = [];

        for (const target in currentPoint.targets) {
            if (!isKey(target) || route.includes(target)) continue; // the route includes might be an issue,
            // there might be another route possible via another key thats faster
            const currentPointTarget = currentPoint.targets[target];
            if (currentPointTarget.direct) {
                routes.push({steps: steps + currentPointTarget.steps, route: `${route}${target}`});
            }
            if (currentPointTarget.routes) {
                currentPointTarget.routes.forEach(routeObject => {
                    const keyCompare = compareKeyIds(route, routeObject.keysID);
                    if (keyCompare.missingKeys.length) return;
                    const addedRoute = routeObject.route.split('').filter(x => isKey(x) && !route.includes(x)).join('');
                    routes.push({steps: steps + routeObject.steps, route: `${route}${addedRoute}`});
                });
            }
        }

        routes.sort(((a, b) => a.steps - b.steps));
        // routes.sort(((a, b) => a.route.length - b.route.length));
        for (let i = 0; i < routes.length; i++) {
            const routeObject = routes[i];
            const result = gatherAllKeysAsFastAsPossible(topology, keyCount, routeObject.steps,
                routeObject.route, cache);
            if (result !== null && (cache.best === null || result < cache.best)) {
                cache.best = result;
                cache.route = routeObject.route;
                console.log(cache);
            }
        }
        return cache.best;
    }

    export function getUniqueSortedKeyString(keys: string): string {
        const outputKeys = [];
        for (let i = 0; i < keys.length; i++) if (outputKeys.indexOf(keys[i]) === -1) outputKeys.push(keys[i]);
        return outputKeys.sort().reduce((r, v) => r + v);
    }

    export function canPassPath(keys: string[], requiredKeys: string[]): boolean {
        for (let i = 0; i < requiredKeys.length; i++) if (keys.indexOf(requiredKeys[i]) === -1) return false;
        return true;
    }

    export function solveMap(lines: string[]) {
        const buildResult = buildMap(lines);
        const topology = buildVaultTopology(buildResult.map, buildResult.doorPairs, buildResult.entryPoint);
        const advancedTopology = buildAdvancedTopology(topology);
        const keyCount = Object.keys(buildResult.doorPairs).length;
        return gatherAllKeysAsFastAsPossible(advancedTopology, keyCount);
    }

    export interface AdvancedTopology {
        [point: string]: {
            // used for building
            directLinks: {[target: string]: {steps: number;}};
            // used for searching paths
            targets: {
                [target: string]: {
                    direct: boolean;
                    steps?: number;
                    routes?: AdvancedTopologyRoute[];
                };
            };
            fastCache?: {[keysID: string]: number};
        };
    }

    export interface AdvancedTopologyRoute {
        keysID: string;
        route: string;
        steps: number;
    }

    export function buildAdvancedTopology(vaultTopology: VaultTopology): AdvancedTopology {
        const start = new Date();
        const topology: AdvancedTopology = {};
        const allTargets = Object.keys(vaultTopology);
        const points: Array<{id: string, connectionCount: number}> = [];
        allTargets.forEach(id => {
            points.push({id, connectionCount: Object.keys(vaultTopology[id]).length});
            // add point to advanced topology, with all direct links
            topology[id] = {directLinks: {}, targets: {}};
            const topologyPoint = vaultTopology[id];
            for (const target in topologyPoint) {
                const targetPoint = topologyPoint[target];
                if (!targetPoint.directLink) continue;
                topology[id].directLinks[target] = {steps: targetPoint.steps};
                topology[id].targets[target] = {direct: true, steps: targetPoint.steps};
            }
        });
        // sort by ascending connection count
        points.sort(((a, b) => a.connectionCount - b.connectionCount));

        // build routes for each point
        points.forEach(point => {
            buildAdvancedRoute(point.id, 0, '', topology);
        });

        console.log('advanced topology', new Date().getTime() - start.getTime(), 'ms');
        return topology;
    }



    // reverse store each path find
    export function buildAdvancedRoute(currentRoute: string, steps: number, requiredKeysID: string, topology: AdvancedTopology) {
        const current = currentRoute[currentRoute.length - 1];
        const currentPoint = topology[current];

        for (const target in currentPoint.directLinks) {
            if (currentRoute.includes(target)) continue;
            const directRoute = currentPoint.directLinks[target];
            let newRequiredKeysID = requiredKeysID;
            if (isDoor(target)) newRequiredKeysID = getUniqueSortedKeyString(`${requiredKeysID}${getKey(target)}`);

            const newRoute = `${currentRoute}${target}`;
            const isGoodRoute = storeRoute(topology, newRoute);
            if (!isGoodRoute) continue;

            buildAdvancedRoute(newRoute, steps + directRoute.steps, newRequiredKeysID, topology);
        }
    }

    // extract keys from route
    export function getKeysIDFromRoute(route: string): string {
        let requiredKeys = '';
        for (let i = 0; i < route.length; i++) {
            const char = route[i];
            if (isDoor(char)) requiredKeys += getKey(char);
        }
        return requiredKeys.split('').sort().join('');
    }


    export function storeRoute(topology: AdvancedTopology, route: string): boolean {
        if (route.length < 3) return true; // 2 = a direct link and is already stored
        const current = route[route.length - 1];
        const currentDirect = route[route.length - 2];
        const currentPoint = topology[current];

        let steps = currentPoint.directLinks[currentDirect].steps;
        let lastPoint = topology[currentDirect];
        // store all routes
        for (let i = route.length - 3; i >= 0; i--) {
            const usedRoute = route.substr(i);
            const next = route[i];
            const nextPoint = topology[next];
            steps += lastPoint.directLinks[next].steps;
            if (!nextPoint.targets[current]) nextPoint.targets[current] = {direct: false, routes: []};
            if (nextPoint.targets[current].direct) {
                if (nextPoint.targets[current].steps <= steps) return false; // shortcut is possible
                nextPoint.targets[current].routes = []; // enable shortcuts with keys
            }
            const keysID = getKeysIDFromRoute(usedRoute);
            let startCurrentRoute = nextPoint.targets[current].routes.find(x => x.keysID === keysID);
            if (startCurrentRoute) {
                if (startCurrentRoute.steps > steps) { // update route if it is shorter
                    startCurrentRoute.steps = steps;
                    startCurrentRoute.route = usedRoute;
                }
            } else {
                nextPoint.targets[current].routes.push({steps, route: usedRoute, keysID}); // create new route
            }


            // store reverse route
            const reverseUsedRoute = usedRoute.split("").reverse().join("");
            if (!currentPoint.targets[next]) currentPoint.targets[next] = {direct: false, routes: []};
            if (!currentPoint.targets[next].routes) currentPoint.targets[next].routes = []; // enable shortcuts with keys
            let currentStartRoute = currentPoint.targets[next].routes.find(x => x.keysID === keysID);
            if (currentStartRoute) {
                if (currentStartRoute.steps > steps) {
                    currentStartRoute.steps = steps;
                    currentStartRoute.route = reverseUsedRoute;
                }
            } else {
                currentPoint.targets[next].routes.push({steps, keysID, route: reverseUsedRoute});
            }

            lastPoint = nextPoint;
        }
        return true;
    }

    export function compareKeyIds(keysID: string, keyComparison: string): {missingKeys: string; extraKeys: string } {
        const output: {missingKeys: string; extraKeys: string } = {missingKeys: '', extraKeys: ''};
        const keysCache: {[key: string]: {original: boolean; comparison: boolean}} = {};
        // comparison
        for (let i = 0; i < keyComparison.length; i++) keysCache[keyComparison[i]] = {original: false, comparison: true};

        // keysID
        for (let i = 0; i < keysID.length; i++) {
            const key = keysID[i];
            if (!keysCache[key]) {
                output.extraKeys += key;
                keysCache[key] = {original: true, comparison: false};
            } else {
                keysCache[key].original = true;
            }
        }
        // check missing keys
        for (const key in keysCache) {
            const value = keysCache[key];
            if (value.comparison && !value.original) output.missingKeys += key;
        }
        return output;
    }
}

if (!module.parent) {

    const path = require('path');

    async function main() {
        const lines = await FileEngine.readFileToLines(path.join(path.dirname(__filename), '../data/day_18.input'));
        const buildResult = Day18.buildMap(lines);
        // MapEngine.printMap(buildResult.map, (v) => String.fromCharCode(v.value.charCode));

        const topology = Day18.buildVaultTopology(buildResult.map, buildResult.doorPairs, buildResult.entryPoint);
        const advancedTopology = Day18.buildAdvancedTopology(topology);

        // print alternative routes per key
        const startingPoint = advancedTopology['@'];
        const requiredKeysMap: {[key: string]: string} = {};
        for (const target in startingPoint.targets) {
            if (!Day18.isKey(target)) continue;
            const targetPoint = startingPoint.targets[target];
            let count = 0;
            if (targetPoint.direct) {
                count++;
                // console.log(target, 'direct', targetPoint.steps);
                requiredKeysMap[target] = '';
            }
            if (targetPoint.routes) {
                count += targetPoint.routes.length;
                targetPoint.routes.forEach(r => {
                    const keys = r.route.split('').filter(x => Day18.isDoor(x)).sort().join('').toLowerCase();
                    // console.log(target, r.route, r.steps, keys);
                    requiredKeysMap[target] = keys;
                });
            }

            // console.log(target, count);
        }
        console.log(JSON.stringify(requiredKeysMap, null, 4));
        function getRequiredKeys(key: string): string {
            let keys = '';
            const requiredKeys = requiredKeysMap[key];
            for (let i = 0; i < requiredKeys.length; i++) {
                const requiredKey = requiredKeys[i];
                if (!keys.includes(requiredKey)) keys += requiredKey;
                const subRequiredKeys = getRequiredKeys(requiredKey);
                subRequiredKeys.split('').forEach(subKey => {
                    if (!keys.includes(subKey)) keys += subKey;
                });
            }
            return keys.split('').sort().join('');
        }
        const keyList: Array<{key: string, requiredKeys: string}> = [];
        for (const key in requiredKeysMap) {
            requiredKeysMap[key] = getRequiredKeys(key);
            keyList.push({key, requiredKeys: requiredKeysMap[key]})
        }
        keyList.sort((a, b) => a.requiredKeys.length - b.requiredKeys.length);
        console.log(keyList);
        // console.log(JSON.stringify(keyList, null, 4));
        // find the endpoints
        const endPoints = [];
        for (const key in requiredKeysMap) {
            let isEndPoint = true;
            for (const k in requiredKeysMap) {
                if (requiredKeysMap[k].includes(key)) {
                    isEndPoint = false;
                    break;
                }
            }
            if (isEndPoint) endPoints.push(key);
        }
        console.log(endPoints);
        keyList.forEach(keyObject => {
            if (endPoints.indexOf(keyObject.key) > -1) console.log(keyObject);
        });

        function getRoutes(from: string, target: string): Array<{route: string, steps: number, keysID: string}> {
            let routes: Array<{route: string, steps: number, keysID: string}>= [];
            const fromPoint = advancedTopology[from];
            const targetPoint = fromPoint.targets[target];
            if (targetPoint.direct) routes.push({route: `${from}${target}`, steps: targetPoint.steps, keysID: ''});
            if (targetPoint.routes) routes = routes.concat(targetPoint.routes);
            routes.sort((a, b) => a.steps - b.steps);
            return routes;
        }

        const keyGroups = [
            'dt',
            'sbl',
            'c',
            'nu',
            'vo',
            'p',
            'k',
            'f',
            'a',
            'i',
            'z',
        ];
        const fixedPath = 'slbcnuovpkfaiz';
        let steps = 0;
        let route = '';
        for (let i = 1; i < fixedPath.length; i++) {
            const previous = fixedPath[i-1];
            const current = fixedPath[i];
            const routes = getRoutes(previous, current);
            const routeObject = routes[0];
            steps += routeObject.steps;
            route += routeObject.route.substr(1);
            route = route.split('').filter(x => Day18.isKey(x)).join('');
            console.log(steps, route, previous, current, routeObject, routes.length);
        }



        const result = Day18.solveMap(lines);
        console.log(result);
        const x = 0;

        // 4412 first result, incorrect
        // 4280 second result, incorrect, too high
        // guessed 4200, too low (not far off the result)
    }

    main().catch(err => console.error(err));

    // let input2 = '';
    // for (let i = 0; i < 1000; i++) input2 += input;
}