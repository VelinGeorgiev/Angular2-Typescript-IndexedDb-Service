"use strict";
/// <reference path="../typings/globals/jasmine/index.d.ts" />
var indexed_db_service_1 = require('./indexed.db.service');
describe("IndexedDbService methods", function () {
    var _service;
    var _schema = [
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
    var _db = 'YouWillNeverCreateDbWithThatName';
    beforeAll(function () {
        _service = new indexed_db_service_1.IndexedDbService();
        _service.setName(_db);
    });
    it("create", function (done) {
        _service.create(_schema).subscribe(function (res) {
            expect(res).toBe('done');
            done();
        });
    });
    it("all", function (done) {
        _service.all('users').subscribe(function (res) {
            expect(res.length).toBe(3);
            done();
        });
    });
    it("count", function (done) {
        _service.count('users').subscribe(function (res) {
            expect(res).toBe(3);
            done();
        });
    });
    it("post", function (done) {
        _service.post('users', { name: 'Helenam', age: 22, gender: 'female' }).subscribe(function (res) {
            expect(res).toBe(4);
            done();
        });
    });
    it("get", function (done) {
        _service.get('users', 3).subscribe(function (res) {
            expect(res.id).toBe(3);
            done();
        });
    });
    it("put", function (done) {
        _service.put('users', { id: 1, name: 'Velin Georgiev', age: 32, gender: 'male' }).subscribe(function (res) {
            expect(res.age).toBe(32);
            done();
        });
    });
    it("remove", function (done) {
        _service.remove('users', 2).subscribe(function (res) {
            expect(res).toBe(2);
            done();
        });
    });
    it("clear", function (done) {
        _service.clear().subscribe(function (res) {
            expect(res).toBe('done');
            done();
        });
    });
});
