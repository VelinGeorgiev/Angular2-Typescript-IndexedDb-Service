/// <reference path="../typings/globals/jasmine/index.d.ts" />
import { IndexedDbService } from './indexed.db.service';

describe("IndexedDbService methods", function () {
    let _service: IndexedDbService;
    let _schema : any[] = [
        {
            name: 'users', indexes: ['name', 'age'],
            seeds: [
                { name: 'Velin Georgiev', age: 31, gender: 'male' },
                { name: 'Ivo', age: 32, gender: 'male' },
                { name: 'Stefi', age: 32, gender: 'female' },
            ]
        },
        {
            name: 'orders', indexes: ['title', 'price'],
            seeds: [
                { title: 'Phone X8', price: 210.00 },
                { title: 'Phone S8', price: 250.00 },
                { title: 'Phone A10', price: 100.32 }
            ]
        }
    ];
    let _db = 'YouWillNeverCreateDbWithThatName';

    beforeAll(() => {
        _service = new IndexedDbService();
        _service.setName(_db);
    });

    it("create", (done) => {
        _service.create(_schema).subscribe(res => {
            expect(res).toBe('done');
            done();
        });
    });

    it("all", (done) => {
        _service.all('users').subscribe(res => {
            expect(res.length).toBe(3);
            done();
        });
    });

    it("count", (done) => {
        _service.count('users').subscribe(res => {
            expect(res).toBe(3);
            done();
        });
    });

    it("post", (done) => {
        _service.post('users', { name: 'Helenam', age: 22, gender: 'female' }).subscribe(res => {
            expect(res).toBe(4);
            done();
        });
    });

    it("get", (done) => {
        _service.get('users', 3).subscribe(res => {
            expect(res.id).toBe(3);
            done();
        });
    });

    it("put", (done) => {
        _service.put('users', { id: 1, name: 'Velin Georgiev', age: 32, gender: 'male' }).subscribe(res => {
            expect(res.age).toBe(32);
            done();
        });
    });

    it("remove", (done) => {
        _service.remove('users', 2).subscribe(res => {
            expect(res).toBe(2);
            done();
        });
    });

    it("clear", (done) => {
        _service.clear().subscribe(res => {
            expect(res).toBe('done');
            done();
        });
    });
});