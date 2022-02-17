import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Location } from '@angular/common';

import { CrisLayoutTab } from '../../../../core/layout/models/tab.model';
import { hasValue } from '../../../../shared/empty.util';
import { ActivatedRoute, Router } from '@angular/router';
import { Item } from '../../../../core/shared/item.model';
import { getItemPageRoute } from '../../../../item-page/item-page-routing-paths';

/**
 * This component render the sidebar of the tabs layout
 */
@Component({
  selector: 'ds-cris-layout-tabs-sidebar',
  template: ''
})
export abstract class CrisLayoutTabsComponent {

  /**
   * The item object related to the page
   */
  @Input() item: Item;
  /**
   * Representing if sidebar should be displayed or not
   */
  @Input() sidebarActive: boolean;
  /**
   * hide/show the sidebar
   */
  @Input() sidebarStatus: boolean;
  /**
   * tabs list
   */
  tabs: CrisLayoutTab[] = [];
  /**
   * used for notify tab selection
   */
  @Output() selectedTab = new EventEmitter<CrisLayoutTab>();

  activeTab: CrisLayoutTab;

  constructor(public location: Location, public router: Router, public route: ActivatedRoute) {
  }

  init(): void {
    if (this.tabs && this.tabs.length > 0) {
      this.parseTabs(this.route.snapshot.paramMap.get('tab'));
      this.emitSelected(this.activeTab);
    }
  }

  public parseTabs(shortname): void {
    const tabs = [];
    this.tabs.forEach((tab) => {
      // create children where tab has "::"
      if (tab.shortname.includes('::')) {
        const splitedTabs = tab.shortname.split('::');
        const splitedHeaderTabs = tab.header.split('::');
        const previousTab = tabs.find((seltab) => seltab.shortname === splitedTabs[0]);

        if (!previousTab) {
          const parentTab = Object.assign({}, tab);
          parentTab.header = splitedHeaderTabs[0];
          parentTab.shortname = splitedTabs[0];
          const childTab = Object.assign(tab, {
            header: splitedHeaderTabs[1],
            shortname: splitedTabs[1]
          });
          parentTab.children = [];
          parentTab.children.push(childTab);
          tabs.push(parentTab);
          if (shortname === parentTab.shortname) {
            this.activeTab = parentTab;
          }
          if (shortname === childTab.shortname) {
            this.activeTab = childTab;
          }
        } else {
          tab.header = splitedHeaderTabs[1];
          tab.shortname = splitedTabs[1];
          previousTab.children.push(tab);
        }
        if (shortname === tab.shortname) {
          this.activeTab = tab;
        }
      } else {
        tabs.push(tab);
        if (shortname === tab.shortname) {
          this.activeTab = tab;
        }
      }
    });
    console.log(tabs);
    this.tabs = tabs;
  }

  abstract emitSelected(selectedTab): void;

  setActiveTab(tab) {
    this.activeTab = tab;
    this.router.navigateByUrl(getItemPageRoute(this.item) + '/' + tab.shortname);
  }

}
