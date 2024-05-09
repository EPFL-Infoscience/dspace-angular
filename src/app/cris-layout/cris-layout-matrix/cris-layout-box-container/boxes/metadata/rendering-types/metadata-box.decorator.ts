import { GenericConstructor } from '../../../../../../core/shared/generic-constructor';
import { Component } from '@angular/core';

export enum FieldRenderingType {
  TEXT = 'TEXT',
  HEADING = 'HEADING',
  LONGTEXT = 'LONGTEXT',
  DATE = 'DATE',
  LINK = 'LINK',
  IDENTIFIER = 'IDENTIFIER',
  CRISREF = 'CRISREF',
  THUMBNAIL = 'THUMBNAIL',
  ATTACHMENT = 'ATTACHMENT',
  TABLE = 'TABLE',
  INLINE = 'INLINE',
  ORCID = 'ORCID',
  TAG = 'TAG',
  VALUEPAIR = 'VALUEPAIR',
  HTML = 'HTML',
  GMAP = 'GOOGLEMAPS',
  OSMAP = 'OPENSTREETMAP',
  GMAPGROUP = 'GOOGLEMAPS-GROUP',
  OSMAPGROUP = 'OPENSTREETMAP-GROUP',
  BROWSE = 'BROWSE',
  TAGBROWSE = 'TAG-BROWSE',
  MARKDOWN = 'MARKDOWN',
  SEARCH = 'SEARCH',
  TAGSEARCH = 'TAG-SEARCH',
  ADVANCEDATTACHMENT = 'ADVANCEDATTACHMENT',
  SIMPLEATTACHMENT = 'SIMPLEATTACHMENT',
}

const fieldType = new Map();

export interface MetadataBoxFieldRenderOptions {
  componentRef: GenericConstructor<Component>;
  structured: boolean;
}

export function MetadataBoxFieldRendering(objectType: FieldRenderingType, structured = false) {
  return function decorator(component: any) {
    if (objectType) {
      fieldType.set(objectType, {
        componentRef: component,
        structured: structured
      } as MetadataBoxFieldRenderOptions);
    }
  };
}

export function getMetadataBoxFieldRendering(objectType: string): MetadataBoxFieldRenderOptions {
  return fieldType.get(objectType.toUpperCase());
}
