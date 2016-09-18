import { Component, Inject } from '@angular/core';
import { IndexedDbService } from './indexed.db.service';

@Component({
    selector: 'my-app',
    templateUrl: 'app/app.html'
})
export class AppComponent {
    databaseCreated: boolean;
    postPerformed: boolean;
    allUsers: any[];
    allOrdersBeforeUpdate: any[];
    allOrdersAfterUpdate: any[];
    
    constructor(private idbService: IndexedDbService) { // Dependency injection of the IndexedDB Service interface i.e. DataProvider.
        this.databaseCreated = false;
        this.postPerformed = false;
        this.allUsers = [];
        this.allOrdersBeforeUpdate = [];
        this.allOrdersAfterUpdate = [];
    }

    ngOnInit() {
        let storesSchemaAndSeeds = [
            {
                name: 'users',
                indexes: ['name', 'age'],
                seeds: [{ name: "John", age: 25 }, { name: "Helenam", age: 25 }]
            },
            {
                name: 'orders',
                indexes: ['title', 'price', 'user'],
                seeds: [{ name: "Phone 7", price: 210.00, user: "John" }, { name: "Phone 8", price: 210.00, user: "Helenam" }]
            },
        ];
         
        // Create the IndexedDB database and perform few operations.
        let self = this;
        this.idbService.setName('db');
        this.idbService.clear().subscribe(done => {

            self.idbService.create(storesSchemaAndSeeds).subscribe(done => {
                self.databaseCreated = true;

                // List all users.
                self.idbService.all('users').subscribe(users => self.allUsers = users);

                // List all orders.
                self.idbService.all('orders').subscribe(orders => self.allOrdersBeforeUpdate = orders);

                // Post new order and update the orders all orders.
                let newOrder = { name: "Phone S999", price: 910.00, user: "John" };
                self.idbService
                    .post('orders', newOrder)
                    .subscribe((res: any) => {
                        self.postPerformed = true;
                        self.idbService.all('orders').subscribe(orders => self.allOrdersAfterUpdate = orders);
                    });
            });
        });
    }}
