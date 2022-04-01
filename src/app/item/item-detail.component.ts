import {Component, NgZone, OnDestroy, OnInit} from '@angular/core'
import {ActivatedRoute} from '@angular/router'

import {Item} from './item'
import {ItemService} from './item.service'
import * as Geolocation from '@nativescript/geolocation';
import {Utils} from '@nativescript/core';
import {requestPermissions, takePicture} from '@nativescript/camera';
import {Directions} from '@nativescript/directions'
import * as application from "@nativescript/core/application";
import * as platform from '@nativescript/core/platform';
import {genericFontFamilies} from '@nativescript/core/ui/styling/font-common';

interface Hole {
  top: number;
  left: number;
}

@Component({
  selector: 'ns-details',
  templateUrl: './item-detail.component.html',
})
export class ItemDetailComponent implements OnInit, OnDestroy {
  item: Item;
  image;
  holes: Hole[] = [];
  point: Hole;
  points: number = 0;

  private needLocation: boolean;
  private locationFailure: boolean;
  location: any;
  directions = new Directions()
  android: any;
  sensorVal: any;
  top = 20;
  left = 50;

  private SensorManager: android.hardware.SensorManager;
  gravitySensorListener: android.hardware.SensorEventListener;
  private accelerometerSensorListener: android.hardware.SensorEventListener;
  private gravitySensor: android.hardware.Sensor;
  movementVal: number = 0;
  private accelerometerSensor: android.hardware.Sensor;

  constructor(private itemService: ItemService, private route: ActivatedRoute, private ngZone: NgZone) {

  }

  ngOnDestroy(): void {
        this.stopListen();
    }

  ngOnInit(): void {
    const id = +this.route.snapshot.params.id
    this.item = this.itemService.getItem(id)
    const activity: android.app.Activity = application.android.startActivity || application.android.foregroundActivity;
    this.SensorManager = activity.getSystemService(android.content.Context.SENSOR_SERVICE) as android.hardware.SensorManager;
  }

  getPermission(): void {
    Geolocation.enableLocationRequest(false, true)

    // Geolocation.enableLocationRequest(true)
    //   .then(() => {
    //     Geolocation.isEnabled().then(isLocationEnabled => {
    //       console.log('result is ' + isLocationEnabled);
    //       if (!isLocationEnabled) {
    //         this.needLocation = false;
    //         this.locationFailure = true;
    //         // potentially do more then just end here...
    //         return;
    //       }
    //
    //       // MUST pass empty object!!
    //       Geolocation.getCurrentLocation({})
    //         .then(result => {
    //           console.log('loc result', result);
    //           this.needLocation = false;
    //           this.location = result;
    //         })
    //         .catch(e => {
    //           console.log('loc error', e);
    //         });
    //     });
    //   });
  }

  onButtonTap(): void {
    console.log("Button was pressdassded");
    this.getPermission();
  }

  generateHole(): void {
    const left = Math.round(Math.random() * 1000);
    const top = Math.round(Math.random() * 500);

    this.holes.push({left, top})
  }

  generatePoint(): void {
    const left = Math.round(Math.random() * 1000);
    const top = Math.round(Math.random() * 500);
    this.point = {top, left}
  }

  checkPoint(top: number, left: number): void {
    if (
      (top > this.point.top-15 && top < this.point.top + 15) &&
      (left > this.point.left-15 && left < this.point.left + 15)) {
      this.points++;
      this.generatePoint();
      this.generateHole();
    }
  }

  onDir(): void {
    this.directions.available().then(avail => {
      this.directions
        .navigate({
          from: {
            // optional, default 'current location'
            lat: 52.215987,
            lng: 5.282764
          },
          to: [
            {
              // if an Array is passed (as in this example), the last item is the destination, the addresses in between are 'waypoints'.
              address: 'Hof der Kolommen 34, Amersfoort, Netherlands'
            },
            {
              address: 'Aak 98, Wieringerwerf, Netherlands'
            }
          ],
          type: 'walking', // optional, can be: driving, transit, bicycling or walking
          ios: {
            preferGoogleMaps: true, // If the Google Maps app is installed, use that one instead of Apple Maps, because it supports waypoints. Default true.
            allowGoogleMapsWeb: true, // If waypoints are passed in and Google Maps is not installed, you can either open Apple Maps and the first waypoint is used as the to-address (the rest is ignored), or you can open Google Maps on web so all waypoints are shown (set this property to true). Default false.
          },
          android: {
            newTask: true // Start as new task. This means it will start a new history stack instead of using the current app. Default true.
          }
        })
        .then(
          () => {
            console.log('Maps app launched.')
          },
          error => {
            console.log(error)
          }
        )
    })
  }

  regSens(): void {

    this.points = 0;
    this.top = 250;
    this.left = 250;
    this.holes = [];
    this.generateHole();
    this.generatePoint();

    // Creating the listener and setting up what happens on change
    this.gravitySensorListener = new android.hardware.SensorEventListener({
      onAccuracyChanged: (sensor, accuracy) => {
        // console.log('Sensor ' + sensor + ' accuracy has changed to ' + accuracy);
      },
      onSensorChanged: (event) => {
        // console.log('Sensor value changed to: ' + event.values[0]);
        this.setVal(event.values[0], event.values[1])
      }
    });

    this.accelerometerSensorListener = new android.hardware.SensorEventListener({
      onAccuracyChanged: (sensor, accuracy) => {
        // console.log('Sensor ' + sensor + ' accuracy has changed to ' + accuracy);
      },
      onSensorChanged: (event) => {
        console.log('Sensor value changed to: ' + event.values[0]);
        // this.setLeft(event.values[0])
      }
    });


    this.gravitySensor = this.SensorManager.getDefaultSensor(
      android.hardware.Sensor.TYPE_GRAVITY
    );

    this.accelerometerSensor = this.SensorManager.getDefaultSensor(
      android.hardware.Sensor.TYPE_GYROSCOPE
    );

    // Register the listener to the sensor
    const success = this.SensorManager.registerListener(
      this.gravitySensorListener,
      this.gravitySensor,
      android.hardware.SensorManager.SENSOR_DELAY_NORMAL
    );

    this.SensorManager.registerListener(
      this.accelerometerSensorListener,
      this.accelerometerSensor,
      android.hardware.SensorManager.SENSOR_DELAY_NORMAL
    );

    console.log('Registering listener succeeded: ' + success);

  }

  stopListen(): void {
    this.SensorManager.unregisterListener(this.gravitySensorListener);
    this.gravitySensorListener = null;
    this.SensorManager.unregisterListener(this.accelerometerSensorListener);
  }

  cameraPerm(): void {
    requestPermissions().then(
      () => {
        console.log('success');
        takePicture().then(image => {
          image.getImageAsync(image1 => {
            this.image = image1;
            console.log(image1);
          })
          this.image = image.nativeImage;
          // console.log(image);
          //
          // console.log(image.nativeImage);
        })
        // permission request accepted or already granted
        // ... call camera.takePicture here ...
      },
      () => {
        console.log('ne');
        // permission request rejected
        // ... tell the user ...
      }
    );
  }

  private setVal(top: number, left: number): void {
    this.ngZone.run(() => {
      // this.movementVal = this.movementVal + Number(top);
      this.top = this.top + Number(top) * 4;
      this.left = this.left + Number(left) * 4;
      this.checkCoords(this.top, this.left);
      this.checkPoint(this.top, this.left);
    })
  }

  private checkCoords(top: number, left: number): void {
    this.holes.forEach(hole => {
      if (
        (top > hole.top-15 && top < hole.top + 15) &&
        (left > hole.left-15 && left < hole.left + 15)) {
        this.stopListen();
      }
    })

  }

  // private setLeft(value: number): void {
  //   this.ngZone.run(() => {
  //     this.sensorVal = value;
  //     this.left = Math.round(this.left + Number(value)/2 );
  //   })
  // }

  youCatchMe(): void {
    console.log("Button was pressed");
  }
}
