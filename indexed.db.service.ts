import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';

@Injectable()
export class IndexedDbService {
    private _indexedDB: any;
    private _dbName: string;

    constructor() {
        this._indexedDB = indexedDB;
        this._dbName = 'db'; // by default
    }

    setName(dbName: string):void {
        if (dbName.length > 0 && dbName !== undefined) {
            this._dbName = dbName;
        }
        else {
            console.log("Error: wrong dbName");
        }
    }

    put(source: string, object: any): Observable<any> {
        let self = this;

        return Observable.create((observer: any) => {
            this.open().subscribe((db: any) => {
                let tx = db.transaction(source, "readwrite");
                let store = tx.objectStore(source);
                store.put(object);

                tx.oncomplete = () => {
                    observer.next(object);
                    db.close();
                    observer.complete();
                };
                db.onerror = (e:any) => {
                    db.close();
                    self.handleError("IndexedDB error: " + e.target.errorCode);
                }
            });
        });
    };

    post(source: string, object: any): Observable<any> {
        let self = this;

        return Observable.create((observer: any) => {
            this.open().subscribe((db: any) => {
                let tx = db.transaction(source, "readwrite");
                let store = tx.objectStore(source);
                let request = store.add(object);

                request.onsuccess = (e:any) => {
                    observer.next(e.target.result);
                    db.close();
                    observer.complete();
                }
                db.onerror = (e:any) => {
                    db.close();
                    self.handleError("IndexedDB error: " + e.target.errorCode);
                }
            });
        });
    };

    get(source: string, id: number): Observable<any> {
        let self = this;

        return Observable.create((observer: any) => {
            this.open().subscribe((db: any) => {
                let tx = db.transaction(source, "readonly");
                let store = tx.objectStore(source);
                let index = store.index("id_idx");
                let request = index.get(id);

                request.onsuccess = () => {
                    observer.next(request.result);
                    db.close();
                    observer.complete();
                };
                db.onerror = (e:any) => {
                    db.close();
                    self.handleError("IndexedDB error: " + e.target.errorCode);
                }
            });
        });
    };

    all(source: string, filter?: any): Observable<any[]> {
        let self = this;

        return Observable.create((observer: any) => {
            let indexName = 'id_idx';

            this.open().subscribe((db: any) => {
                let tx = db.transaction(source, "readonly");
                let store = tx.objectStore(source);
                let index = store.index(indexName);
                let request = index.openCursor(); //IDBKeyRange.only("Fred")
                let results: any[] = [];

                request.onsuccess = function () {
                    let cursor = request.result;
                    if (cursor) {
                        results.push(cursor.value);
                        cursor.continue();
                    } else {
                        observer.next(results);
                        db.close();
                        observer.complete();
                    }
                };
                db.onerror = (e:any) => {
                    db.close();
                    self.handleError("IndexedDB error: " + e.target.errorCode);
                }
            });
        });
    };

    remove(source: string, id: number): Observable<any> {
        let self = this;

        return Observable.create((observer: any) => {
            this.open().subscribe((db: any) => {
                let tx = db.transaction(source, "readwrite");
                let store = tx.objectStore(source);

                store.delete(id);

                tx.oncomplete = (e:any) => {
                    observer.next(id);
                    db.close();
                    observer.complete();
                };
                db.onerror = (e:any) => {
                    db.close();
                    self.handleError("IndexedDB error: " + e.target.errorCode);
                }
            });
        });
    };

    count(source: string): Observable<number> {
        let self = this;

        return Observable.create((observer: any) => {
            this.open().subscribe((db: any) => {
                let indexName = 'id_idx';
                let tx = db.transaction(source, "readonly");
                let store = tx.objectStore(source);
                let index = store.index(indexName);
                let request = index.count();

                request.onsuccess = () => {
                    observer.next(request.result);
                    db.close();
                    observer.complete();
                };
                db.onerror = (e: any) => {
                    db.close();
                    self.handleError("IndexedDB error: " + e.target.errorCode);
                }
            });
        });
    };

    create(schema?: any[]): Observable<any> {
        let self = this;

        return Observable.create((observer: any) => {
            let request = this._indexedDB.open(this._dbName);

            request.onupgradeneeded = () => {
                // The database did not previously exist, so create object stores and indexes.
                let db = request.result;

                for (let i = 0; i < schema.length; i++) {
                    let store = db.createObjectStore(schema[i].name, { keyPath: "id", autoIncrement: true });
                    store.createIndex("id_idx", "id", { unique: true });

                    if (schema[i].indexes !== undefined) {
                        for (let j = 0; j < schema[i].indexes.length; j++) {
                            let index = schema[i].indexes[j];
                            store.createIndex(`${index}_idx`, index);
                        }
                    }

                    if (schema[i].seeds !== undefined) {
                        for (let j = 0; j < schema[i].seeds.length; j++) {
                            let seed = schema[i].seeds[j];
                            store.put(seed);
                        }
                    }
                }

                observer.next('done');
                observer.complete();
            };

            request.onerror = () => {
                self.handleError(request.error);
            }

            request.onsuccess = () => {
                let db = request.result;
                db.close();
            }
        });
    }

    clear(): Observable<any> {
        let self = this;

        return Observable.create((observer: any) => {
            let request = this._indexedDB.deleteDatabase(this._dbName);

            request.onsuccess = () => {
                observer.next('done');
                observer.complete();
            }
            request.onerror = () => {
                self.handleError('Could not delete indexed db.');
            };
            request.onblocked = () => {
                self.handleError('Couldn not delete database due to the operation being blocked.');
            };
        });
    }

    private handleError(msg: string) {
        console.error(msg);
        return Observable.throw(msg);
    }

    private open(): Observable<any> {
        let self = this;

        return Observable.create((observer: any) => {
            let request = this._indexedDB.open(this._dbName);

            request.onsuccess = () => {
                observer.next(request.result);
                observer.complete();
            }
            request.onerror = () => self.handleError(request.error); 
        });
    }
}