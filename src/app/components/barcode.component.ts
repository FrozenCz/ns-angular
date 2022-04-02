import {Component} from '@angular/core';

import {BarcodeScanner} from "nativescript-barcodescanner";
import {Barcode, BarcodeService} from '~/app/services/barcode.service';
import {take} from 'rxjs';


@Component({
  selector: 'ns-barcode-component',
  templateUrl: './barcode.component.html',
  styleUrls: ['./barcode.component.scss'],
  moduleId: module.id,
})
export class BarcodeComponent {
  barcodes: Array<Barcode> = [];
  pause = false;
  result = '';
  isBusy: boolean = true;

  constructor(private barcodeService: BarcodeService) {
    this.getData()
  }

  barcodeTest(): void {
    new BarcodeScanner().scan({
      formats: "QR_CODE, EAN_13",
      cancelLabel: "EXIT. Also, try the volume buttons!", // iOS only, default 'Close'
      cancelLabelBackgroundColor: "#333333", // iOS only, default '#000000' (black)
      message: "Use the volume buttons for extra light", // Android only, default is 'Place a barcode inside the viewfinder rectangle to scan it.'
      showFlipCameraButton: true,   // default false
      preferFrontCamera: false,     // default false
      showTorchButton: true,        // default false
      beepOnScan: true,             // Play or Suppress beep on scan (default true)
      fullScreen: true,             // Currently only used on iOS; with iOS 13 modals are no longer shown fullScreen by default, which may be actually preferred. But to use the old fullScreen appearance, set this to 'true'. Default 'false'.
      torchOn: false,               // launch with the flashlight on (default false)
      closeCallback: () => {
        console.log("Scanner closed")
      }, // invoked when the scanner was closed (success or abort)
      resultDisplayDuration: 500,   // Android only, default 1500 (ms), set to 0 to disable echoing the scanned text
      // Android only, default undefined (sensor-driven orientation), other options: portrait|landscape
      openSettingsIfPermissionWasPreviouslyDenied: true, // On iOS you can send the user to the settings app if access was previously denied
      presentInRootViewController: true // iOS-only; If you're sure you're not presenting the (non embedded) scanner in a modal, or are experiencing issues with fi. the navigationbar, set this to 'true' and see if it works better for your app (default false).
    }).then((result) => {
        this.result = result.text;
        this.setFounded(result.text);
        // Note that this Promise is never invoked when a 'continuousScanCallback' function is provided
        alert({
          title: "Scan result",
          message: "Format: " + result.format + ",\nValue: " + result.text,
          okButtonText: "OK"
        });
      }, (errorMessage) => {
        console.log("No scan. " + errorMessage);
      }
    );
  }

  getData(): any {
    this.isBusy = true;
    this.barcodeService.getBarcodes().pipe(take(1)).subscribe(barcodes => {
      this.barcodes = barcodes;
      this.isBusy = false;
    });
  }

  private setFounded(text: string): void {
    const scannedObj = JSON.parse(text);
    this.barcodes.find(b => b.id === scannedObj.id).found = true;
  }

  sendData(): any {
    this.isBusy = true;
    this.barcodeService.sendFounded(this.barcodes.filter(b => b.found).map(b => b.id)).pipe(take(1)).subscribe(() => {

      setTimeout(() => {
        this.isBusy = false;
      });
    }, error => {
      alert(error)
    })
  }


}
