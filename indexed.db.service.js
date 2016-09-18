"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var Observable_1 = require('rxjs/Observable');
var core_1 = require('@angular/core');
var IndexedDbService = (function () {
    function IndexedDbService() {
        this._indexedDB = indexedDB;
        this._dbName = 'db'; // by default
    }
    IndexedDbService.prototype.setName = function (dbName) {
        if (dbName.length > 0 && dbName !== undefined) {
            this._dbName = dbName;
        }
        else {
            console.log("Error: wrong dbName");
        }
    };
    IndexedDbService.prototype.put = function (source, object) {
        var _this = this;
        var self = this;
        return Observable_1.Observable.create(function (observer) {
            _this.open().subscribe(function (db) {
                var tx = db.transaction(source, "readwrite");
                var store = tx.objectStore(source);
                store.put(object);
                tx.oncomplete = function () {
                    observer.next(object);
                    db.close();
                    observer.complete();
                };
                db.onerror = function (e) {
                    db.close();
                    self.handleError("IndexedDB error: " + e.target.errorCode);
                };
            });
        });
    };
    ;
    IndexedDbService.prototype.post = function (source, object) {
        var _this = this;
        var self = this;
        return Observable_1.Observable.create(function (observer) {
            _this.open().subscribe(function (db) {
                var tx = db.transaction(source, "readwrite");
                var store = tx.objectStore(source);
                var request = store.add(object);
                request.onsuccess = function (e) {
                    observer.next(e.target.result);
                    db.close();
                    observer.complete();
                };
                db.onerror = function (e) {
                    db.close();
                    self.handleError("IndexedDB error: " + e.target.errorCode);
                };
            });
        });
    };
    ;
    IndexedDbService.prototype.get = function (source, id) {
        var _this = this;
        var self = this;
        return Observable_1.Observable.create(function (observer) {
            _this.open().subscribe(function (db) {
                var tx = db.transaction(source, "readonly");
                var store = tx.objectStore(source);
                var index = store.index("id_idx");
                var request = index.get(id);
                request.onsuccess = function () {
                    observer.next(request.result);
                    db.close();
                    observer.complete();
                };
                db.onerror = function (e) {
                    db.close();
                    self.handleError("IndexedDB error: " + e.target.errorCode);
                };
            });
        });
    };
    ;
    IndexedDbService.prototype.all = function (source, filter) {
        var _this = this;
        var self = this;
        return Observable_1.Observable.create(function (observer) {
            var indexName = 'id_idx';
            _this.open().subscribe(function (db) {
                var tx = db.transaction(source, "readonly");
                var store = tx.objectStore(source);
                var index = store.index(indexName);
                var request = index.openCursor(); //IDBKeyRange.only("Fred")
                var results = [];
                request.onsuccess = function () {
                    var cursor = request.result;
                    if (cursor) {
                        results.push(cursor.value);
                        cursor.continue();
                    }
                    else {
                        observer.next(results);
                        db.close();
                        observer.complete();
                    }
                };
                db.onerror = function (e) {
                    db.close();
                    self.handleError("IndexedDB error: " + e.target.errorCode);
                };
            });
        });
    };
    ;
    IndexedDbService.prototype.remove = function (source, id) {
        var _this = this;
        var self = this;
        return Observable_1.Observable.create(function (observer) {
            _this.open().subscribe(function (db) {
                var tx = db.transaction(source, "readwrite");
                var store = tx.objectStore(source);
                store.delete(id);
                tx.oncomplete = function (e) {
                    observer.next(id);
                    db.close();
                    observer.complete();
                };
                db.onerror = function (e) {
                    db.close();
                    self.handleError("IndexedDB error: " + e.target.errorCode);
                };
            });
        });
    };
    ;
    IndexedDbService.prototype.count = function (source) {
        var _this = this;
        var self = this;
        return Observable_1.Observable.create(function (observer) {
            _this.open().subscribe(function (db) {
                var indexName = 'id_idx';
                var tx = db.transaction(source, "readonly");
                var store = tx.objectStore(source);
                var index = store.index(indexName);
                var request = index.count();
                request.onsuccess = function () {
                    observer.next(request.result);
                    db.close();
                    observer.complete();
                };
                db.onerror = function (e) {
                    db.close();
                    self.handleError("IndexedDB error: " + e.target.errorCode);
                };
            });
        });
    };
    ;
    IndexedDbService.prototype.create = function (schema) {
        var _this = this;
        var self = this;
        return Observable_1.Observable.create(function (observer) {
            var request = _this._indexedDB.open(_this._dbName);
            request.onupgradeneeded = function () {
                // The database did not previously exist, so create object stores and indexes.
                var db = request.result;
                for (var i = 0; i < schema.length; i++) {
                    var store = db.createObjectStore(schema[i].name, { keyPath: "id", autoIncrement: true });
                    store.createIndex("id_idx", "id", { unique: true });
                    if (schema[i].indexes !== undefined) {
                        for (var j = 0; j < schema[i].indexes.length; j++) {
                            var index = schema[i].indexes[j];
                            store.createIndex(index + "_idx", index);
                        }
                    }
                    if (schema[i].seeds !== undefined) {
                        for (var j = 0; j < schema[i].seeds.length; j++) {
                            var seed = schema[i].seeds[j];
                            store.put(seed);
                        }
                    }
                }
                observer.next('done');
                observer.complete();
            };
            request.onerror = function () {
                self.handleError(request.error);
            };
            request.onsuccess = function () {
                var db = request.result;
                db.close();
            };
        });
    };
    IndexedDbService.prototype.clear = function () {
        var _this = this;
        var self = this;
        return Observable_1.Observable.create(function (observer) {
            var request = _this._indexedDB.deleteDatabase(_this._dbName);
            request.onsuccess = function () {
                observer.next('done');
                observer.complete();
            };
            request.onerror = function () {
                self.handleError('Could not delete indexed db.');
            };
            request.onblocked = function () {
                self.handleError('Couldn not delete database due to the operation being blocked.');
            };
        });
    };
    IndexedDbService.prototype.handleError = function (msg) {
        console.error(msg);
        return Observable_1.Observable.throw(msg);
    };
    IndexedDbService.prototype.open = function () {
        var _this = this;
        var self = this;
        return Observable_1.Observable.create(function (observer) {
            var request = _this._indexedDB.open(_this._dbName);
            request.onsuccess = function () {
                observer.next(request.result);
                observer.complete();
            };
            request.onerror = function () { return self.handleError(request.error); };
        });
    };
    IndexedDbService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], IndexedDbService);
    return IndexedDbService;
}());
exports.IndexedDbService = IndexedDbService;
