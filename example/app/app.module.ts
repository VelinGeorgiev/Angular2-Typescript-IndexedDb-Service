import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { IndexedDbService } from './indexed.db.service'; 

@NgModule({
  imports: [ BrowserModule ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [IndexedDbService]
})
export class AppModule { }
