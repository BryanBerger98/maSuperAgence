import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Property } from '../models/Property.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PropertiesService {

  properties: Property[] = [];
  propertiesSubject = new Subject<Property[]>();

  constructor() { }

  emitProperties() {
    this.propertiesSubject.next(this.properties);
  }

  saveProperties() {
    firebase.database().ref('/properties').set(this.properties);
  }

  createProperty(newProperty: Property) {
    this.properties.push(newProperty);
    this.saveProperties();
    this.emitProperties();
  }

  removeProperty(property: Property) {
    const index = this.properties.findIndex(
      (propertyEl) => {
        if (propertyEl === property) {
          return true;
        }
      }
    );
    this.properties.splice(index, 1);
    this.saveProperties();
    this.emitProperties();
  }

  getProperties() {
    firebase.database().ref('/properties').on('value', (data) => {
      this.properties = data.val() ? data.val() : [];
      this.emitProperties();
    });
  }

  updateProperty(property: Property, id: number) {
    firebase.database().ref('/properties/' + id).update(property);
  }

  uploadFile(file: File) {
    return new Promise(
      (resolve, reject) => {
        const uniqueId = Date.now().toString();
        const upload = firebase.storage().ref().child('images/properties/' + uniqueId + file.name).put(file);
        upload.on(firebase.storage.TaskEvent.STATE_CHANGED,
          () => {
            console.log('Loading...');
          },
          (error) => {
            console.log('Error ! : ' + error);
            reject();
          },
          () => {
            upload.snapshot.ref.getDownloadURL().then(function(downloadURL) {
              resolve(downloadURL);
            });
          }
        );
      }
    );
  }

  removePropertyPhoto(photoLink: string) {
    if (photoLink) {
      const storageRef = firebase.storage().refFromURL(photoLink);
      storageRef.delete().then(
        () => {
          console.log('File deleted');
        }
      ).catch(
        (error) => {
          console.log('File not found : ' + error);
        }
      );
    }
  }

  getSingleProperty(id: number) {
    return new Promise(
      (resolve, reject) => {
        firebase.database().ref('/properties/' + id).once('value').then(
          (data) => {
            resolve(data.val());
          },
          (error) => {
            reject(error);
          }
        );
      }
    );
  }

}
