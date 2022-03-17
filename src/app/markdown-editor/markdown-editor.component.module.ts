import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownEditorComponent } from './markdown-editor.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';

@NgModule({
  imports: [ CommonModule, FormsModule, ReactiveFormsModule, TextFieldModule ],
  exports: [ MarkdownEditorComponent ],
  declarations: [ MarkdownEditorComponent ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class MarkdownEditorModule {}
