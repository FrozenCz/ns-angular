import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core'
import {NativeScriptHttpClientModule, NativeScriptModule} from '@nativescript/angular'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { ItemsComponent } from './item/items.component'
import { ItemDetailComponent } from './item/item-detail.component'
import {BarcodeComponent} from '~/app/components/barcode.component';



@NgModule({
  bootstrap: [AppComponent],
  imports: [NativeScriptModule, AppRoutingModule, NativeScriptHttpClientModule],
  declarations: [AppComponent, ItemsComponent, ItemDetailComponent, BarcodeComponent],
  providers: [],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {}
