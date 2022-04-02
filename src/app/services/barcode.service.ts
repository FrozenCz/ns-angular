import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

export interface Barcode {
  name: string;
  id: number;
  found: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BarcodeService {
  barcodes: Array<Barcode> = [{found: false, name: 'rte', id: 0}, {found: true, name: 'rte', id: 1}];

  constructor(private httpClient: HttpClient) {
  }

  getBarcodes(): Observable<Barcode[]> {
    return this.httpClient.get<Barcode[]>('https://barcodes-rest.milanknop.cz/barcodes');
  }

  sendFounded(ids: number[]): Observable<void> {
    const founded = ids.map(id => {
      return {
        barcodeId: id,
        found: true
      }
    })
    return this.httpClient.post<void>('https://barcodes-rest.milanknop.cz/barcodes', founded);
  }
}

