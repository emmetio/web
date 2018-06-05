import { strict as assert } from 'assert';
import { get, set, objectsEqual } from '../src/lib/utils';

describe('Utils', () => {
	it('get', () => {
		const obj = {
			a: {
				b: {
					c: 10
				}
			}
		};

		assert.equal(get(obj, 'a.b.c'), obj.a.b.c);
		assert.equal(get(obj, ['a', 'b', 'c']), obj.a.b.c);
		assert.equal(get(obj, 'a.b'), obj.a.b);
		assert.equal(get(obj, 'a.c'), undefined);
		assert.equal(get(null, 'a.c'), undefined);
	});

	it('set', () => {
		const obj = Object.freeze({
			a: Object.freeze({
				b: Object.freeze({
					c: 10
				})
			})
		});

		assert.deepEqual(set(null, 'a.b', 5), { a: { b: 5 } });

		const obj1 = set(obj, 'a.b.c', 20);
		assert.equal(get(obj1, 'a.b.c'), 20);
		assert.notEqual(obj1, obj);
		assert.notEqual(obj1.a, obj.a);
		assert.notEqual(obj1.a.b, obj.a.b);

		const obj2 = set(obj, 'a.b1.c1', 20);
		assert.equal(obj2.a.b.c, 10);
		assert.equal(obj2.a.b1.c1, 20);
		assert.notEqual(obj2, obj);
		assert.notEqual(obj2.a, obj.a);
		assert.equal(obj2.a.b, obj.a.b);

		const obj3 = set(obj, 'a2', 10);
		assert.notEqual(obj3, obj);
		assert.equal(obj3.a, obj.a);

		assert.equal(set(obj, 'a.b.c', 10), obj);
	});

	it('objectsEqual', () => {
		assert(!objectsEqual(null, { a: 1 }));
		assert(!objectsEqual({ a: 1 }, null));
		assert(objectsEqual({ a: 1 }, { a: 1 }));
		assert(!objectsEqual({ a: 1 }, { a: 2 }));
		assert(!objectsEqual({ a: 1, b: 2 }, { a: 1 }));
		assert(objectsEqual({ a: 1, b: 2 }, { b: 2, a: 1 }));
	});
});
