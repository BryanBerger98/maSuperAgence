import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PropertiesService } from 'src/app/services/properties.service';
import { Property } from 'src/app/models/Property.model';
import * as $ from 'jquery';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-properties',
  templateUrl: './admin-properties.component.html',
  styleUrls: ['./admin-properties.component.css']
})
export class AdminPropertiesComponent implements OnInit, OnDestroy {

  propertyForm: FormGroup;
  properties: Property[];
  propertiesSubscription: Subscription;
  editProperty: boolean = false;
  photoUploading: boolean = false;
  photoUploaded: boolean = false;
  photosAdded: any[] = [];

  constructor(private formBuilder: FormBuilder,
    private propertiesService: PropertiesService) { }

  ngOnInit() {
    this.initForm();
    this.propertiesSubscription = this.propertiesService.propertiesSubject.subscribe(
      (properties: Property[]) => {
        this.properties = properties;
      }
    );
    this.propertiesService.getProperties();
    this.propertiesService.emitProperties();
  }

  initForm() {
    this.propertyForm = this.formBuilder.group({
      id: [''],
      title: ['', Validators.required],
      category: ['', Validators.required],
      surface: ['', Validators.required],
      rooms: ['', Validators.required],
      price: ['', Validators.required],
      description: ['']
    });
  }

  resetPropertyForm() {
    this.editProperty = false;
    this.propertyForm.reset();
    this.photosAdded = [];
    this.photoUploaded = false;
    this.photoUploading = false;
  }

  onSaveProperty() {
    const id = this.propertyForm.get('id').value;
    const title = this.propertyForm.get('title').value;
    const category = this.propertyForm.get('category').value;
    const surface = this.propertyForm.get('surface').value;
    const rooms = this.propertyForm.get('rooms').value;
    const price = this.propertyForm.get('price').value;
    const description = this.propertyForm.get('description').value;
    const photos = this.photosAdded ? this.photosAdded : [];
    const newProperty = new Property(title, category, surface, rooms, price, description, photos);
    
    if (this.editProperty == true) {
      this.propertiesService.updateProperty(newProperty, id);
    } else {
      this.propertiesService.createProperty(newProperty);
    }
    $('#propertiesFormModal').modal('hide');
    this.resetPropertyForm();
  }

  ngOnDestroy() {
    this.propertiesSubscription.unsubscribe();
  }

  onDeleteProperty(property: Property) {
    if (property.photos) {
      property.photos.forEach(photo => {
        this.propertiesService.removePropertyPhoto(photo);
      })
    }
    this.propertiesService.removeProperty(property);
  }

  onEditProperty(property: Property, id: number) {
    $('#propertiesFormModal').modal('show');
    this.propertyForm.get('id').setValue(id);
    this.propertyForm.get('title').setValue(property.title);
    this.propertyForm.get('category').setValue(property.category);
    this.propertyForm.get('surface').setValue(property.surface);
    this.propertyForm.get('rooms').setValue(property.rooms);
    this.propertyForm.get('price').setValue(property.price);
    this.propertyForm.get('description').setValue(property.description);
    this.photosAdded = property.photos;
    this.editProperty = true;
  }

  detectFile(event) {
    this.photoUploaded = false;
    this.photoUploading = true;
    this.propertiesService.uploadFile(event.target.files[0]).then(
      (url: string) => {
        this.onAddPhoto(url);
        this.photoUploading = false;
        this.photoUploaded = true;
      }
    );
  }

  onAddPhoto(url: string) {
    this.photosAdded.push(url);
  }

  onRemoveAddedPhoto(id: number) {
    this.propertiesService.removePropertyPhoto(this.photosAdded[id]);
    this.photosAdded.splice(id, 1);
  }

}
