import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { filter, find, startWith } from 'rxjs/operators';
import { NativeWindowRef, NativeWindowService } from '../../../../../core/services/window.service';
import { RenderCrisLayoutBoxFor } from '../../../../decorators/cris-layout-box.decorator';
import { LayoutBox } from '../../../../enums/layout-box.enum';
import { CrisLayoutBoxModelComponent } from '../../../../models/cris-layout-box-component.model';
import { CrisLayoutBox } from '../../../../../core/layout/models/box.model';
import { Item } from '../../../../../core/shared/item.model';
import { VocabularyTreeFlatDataSource } from '../../../../../shared/vocabulary-treeview/vocabulary-tree-flat-data-source';
import { LOAD_MORE, LOAD_MORE_ROOT, TreeviewFlatNode, TreeviewNode } from '../../../../../shared/vocabulary-treeview/vocabulary-treeview-node.model';
import { FlatTreeControl } from '@angular/cdk/tree';
import { VocabularyTreeFlattener } from '../../../../../shared/vocabulary-treeview/vocabulary-tree-flattener';
import { hasValue, isNotEmpty } from '../../../../../shared/empty.util';
import { VocabularyEntryDetail } from '../../../../../core/submission/vocabularies/models/vocabulary-entry-detail.model';
import { VocabularyTreeviewService } from '../../../../../shared/vocabulary-treeview/vocabulary-treeview.service';
import { select, Store } from '@ngrx/store';
import { CoreState } from '../../../../../core/core.reducers';
import { isAuthenticated } from '../../../../../core/auth/selectors';
import { VocabularyEntry } from '../../../../../core/submission/vocabularies/models/vocabulary-entry.model';
import { PageInfo } from '../../../../../core/shared/page-info.model';
import { VocabularyOptions } from '../../../../../core/submission/vocabularies/models/vocabulary-options.model';
import { Router } from '@angular/router';

@Component({
  selector: 'ds-hierarchy.component',
  templateUrl: './hierarchy.component.html'
})
@RenderCrisLayoutBoxFor(LayoutBox.HIERARCHY,true)
export class HierarchyComponent extends CrisLayoutBoxModelComponent implements OnInit {

  /**
   * The {@link VocabularyOptions} object
   */
  vocabularyOptions = new VocabularyOptions('publication-coar-types', 'dc.type');

  /**
   * Flat tree data source
   */
  dataSource: VocabularyTreeFlatDataSource<TreeviewNode, TreeviewFlatNode>;

  /**
   * Flat tree control object. Able to expand/collapse a subtree recursively for flattened tree.
   */
  treeControl: FlatTreeControl<TreeviewFlatNode>;

  /**
   * Tree flattener object. Able to convert a normal type of node to node with children and level information.
   */
  treeFlattener: VocabularyTreeFlattener<TreeviewNode, TreeviewFlatNode>;

  /**
   * A map containing the current node showed by the tree
   */
  nodeMap = new Map<string, TreeviewFlatNode>();

  /**
   * Array to track all subscriptions and unsubscribe them onDestroy
   */
  private subs: Subscription[] = [];

  /**
   * Contain a descriptive message for this vocabulary retrieved from i18n files
   */
  description: Observable<string>;

  /**
   * A boolean representing if user is authenticated
   */
  private isAuthenticated: Observable<boolean>;

  /**
   * A boolean representing if tree is loading
   */
  loading: Observable<boolean>;

  /**
   * For hierarchical vocabularies express the preference to preload the tree at a specific
   * level of depth (0 only the top nodes are shown, 1 also their children are preloaded and so on)
   */
  preloadLevel = 0;

  /**
   * The selected Item from submission
   */
  selectedItem: any = {};

  constructor(
    protected translateService: TranslateService,
    private vocabularyTreeviewService: VocabularyTreeviewService,
    private store: Store<CoreState>,
    private router: Router,
    @Inject(NativeWindowService) private _window: NativeWindowRef,
    @Inject('boxProvider') public boxProvider: CrisLayoutBox,
    @Inject('itemProvider') public itemProvider: Item) {

    super(translateService, boxProvider, itemProvider);

    this.treeFlattener = new VocabularyTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TreeviewFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new VocabularyTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  ngOnInit() {
    super.ngOnInit();

    this.selectedItem = this.item.firstMetadata('dc.type');

    this.subs.push(
      this.vocabularyTreeviewService.getData().subscribe((data) => {
        this.dataSource.data = data;
      })
    );

    const descriptionLabel = 'vocabulary-treeview.tree.description.' + this.vocabularyOptions.name;
    this.description = this.translateService.get(descriptionLabel).pipe(
      filter((msg) => msg !== descriptionLabel),
      startWith('')
    );

    // set isAuthenticated
    this.isAuthenticated = this.store.pipe(select(isAuthenticated));
    this.loading = this.vocabularyTreeviewService.isLoading();
    this.isAuthenticated.pipe(
      find((isAuth) => isAuth)
    ).subscribe(() => {
      const entryId: string = (this.selectedItem) ? this.getEntryId(this.selectedItem) : null;
      this.vocabularyTreeviewService.initialize(this.vocabularyOptions, new PageInfo(), entryId);
    });
  }

  /**
   * Get tree level for a given node
   * @param node The node for which to retrieve the level
   */
  getLevel = (node: TreeviewFlatNode) => node.level;

  /**
   * Check if a given node is expandable
   * @param node The node for which to retrieve the information
   */
  isExpandable = (node: TreeviewFlatNode) => node.expandable;

  /**
   * Get children for a given node
   * @param node The node for which to retrieve the children
   */
  getChildren = (node: TreeviewNode): Observable<TreeviewNode[]> => node.childrenChange;

   /**
    * Transform a {@link TreeviewNode} to {@link TreeviewFlatNode}
    * @param node The node to transform
    * @param level The node level information
    */
   transformer = (node: TreeviewNode, level: number) => {
     const existingNode = this.nodeMap.get(node.item.id);

     if (existingNode && existingNode.item.id !== LOAD_MORE && existingNode.item.id !== LOAD_MORE_ROOT) {
       return existingNode;
     }
     const newNode: TreeviewFlatNode = new TreeviewFlatNode(
       node.item,
       level,
       node.hasChildren,
       ((!node.isSearchNode && node.hasChildren) || (node.isSearchNode && node.hasChildren &&  isNotEmpty(node.children))),
       node.pageInfo,
       node.loadMoreParentItem,
       node.isSearchNode,
       node.isInInitValueHierarchy
     );
     this.nodeMap.set(node.item.id, newNode);

     if ((((level + 1) < this.preloadLevel) && newNode.childrenLoaded)
       || (newNode.isSearchNode && newNode.childrenLoaded)
       || newNode.isInInitValueHierarchy) {
       if (!newNode.isSearchNode) {
         this.loadChildren(newNode);
       }
       this.treeControl.expand(newNode);
     }
     return newNode;
   }

  /**
   * Expand a node whose children are not loaded
   * @param item The VocabularyEntryDetail for which to load more nodes
   */
  loadMore(item: VocabularyEntryDetail) {
    this.vocabularyTreeviewService.loadMore(item);
  }

  /**
   * Expand the root node whose children are not loaded
   * @param node The TreeviewFlatNode for which to load more nodes
   */
  loadMoreRoot(node: TreeviewFlatNode) {
    this.vocabularyTreeviewService.loadMoreRoot(node);
  }

  /**
   * Load children nodes for a node
   * @param node The TreeviewFlatNode for which to load children nodes
   */
  loadChildren(node: TreeviewFlatNode) {
    this.vocabularyTreeviewService.loadMore(node.item, true);
  }

  /**
   * Check if a given node has children
   * @param _nodeData The node for which to retrieve the information
   */
  hasChildren = (_: number, _nodeData: TreeviewFlatNode) => _nodeData.expandable;

  /**
   * Check if a given node has more children to load
   * @param _nodeData The node for which to retrieve the information
   */
  isLoadMore = (_: number, _nodeData: TreeviewFlatNode) => _nodeData.item.id === LOAD_MORE;

  /**
   * Check if there are more node to load at root level
   * @param _nodeData The node for which to retrieve the information
   */
  isLoadMoreRoot = (_: number, _nodeData: TreeviewFlatNode) => _nodeData.item.id === LOAD_MORE_ROOT;

  /**
   * Method called on entry select
   * Emit a new select Event
   */
  onSelect(entry: VocabularyEntryDetail) {
    this.router.navigate(['/items', entry.id ]);
  }

  /**
   * Unsubscribe from all subscriptions
   */
  ngOnDestroy(): void {
    this.vocabularyTreeviewService.cleanTree();
    this.subs
      .filter((sub) => hasValue(sub))
      .forEach((sub) => sub.unsubscribe());
  }

  /**
   * Return an id for a given {@link VocabularyEntry}
   */
  private getEntryId(entry: VocabularyEntry): string {
    return entry.authority || entry?.otherInformation?.id || undefined;
  }
}
