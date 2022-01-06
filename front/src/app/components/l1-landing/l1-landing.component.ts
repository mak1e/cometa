/**
 * l1-landing.component.ts
 *
 * Main component for the new-landing view that includes everything except the header
 *
 * @lastModification 04-10-21
 *
 * @author: dph000
 */

import { animate, query, stagger, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, OnInit, Renderer2 } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Store, Select } from '@ngxs/store';
import { FeaturesState } from '@store/features.state';
import { MatDialog } from '@angular/material/dialog';
import { Dispatch } from '@ngxs-labs/dispatch-decorator';
import { UserState } from '@store/user.state';
import { Features } from '@store/actions/features.actions';
import { CustomSelectors } from '@others/custom-selectors';
import { AddFolderComponent } from '@dialogs/add-folder/add-folder.component';
import { ViewSelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Configuration } from '@store/actions/config.actions';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SharedActionsService } from '@services/shared-actions.service';
import { Observable } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'cometa-l1-landing',
  templateUrl: './l1-landing.component.html',
  styleUrls: ['./l1-landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', style({ opacity: 0, top: '30px' }), { optional: true }),
        query(':enter', stagger('100ms', [
          animate('.4s ease-in-out', style({ opacity: 1, top: '0px' }))
        ]), { optional: true })
      ])
    ]),
    trigger('addDialog', [
      state('false', style({
        visibility: 'hidden',
        left: '-30px',
        opacity: 0
      })),
      state('true', style({
        visibility: 'visible',
        left: '0',
        opacity: 1
      })),
      transition('false <=> true', animate('150ms ease-out'))
    ])
  ]
})
export class L1LandingComponent implements OnInit {

  constructor(
    private _dialog: MatDialog,
    private _store: Store,
    public _sharedActions: SharedActionsService
    ) {
    const filtersStorage = localStorage.getItem('filters');
    if (!!filtersStorage) {
      try {
        const parsedFilters = JSON.parse(filtersStorage);
        this._store.dispatch(new Features.SetFilters(parsedFilters));
      } catch (err) { }
    }
  }

  // Contains all the features and folders data
  @Select(FeaturesState.GetNewFeaturesWithinFolder) data$: Observable<ReturnType<typeof FeaturesState.GetNewFeaturesWithinFolder>>;
  // Contains the list of active filters
  @Select(FeaturesState.GetFilters) filters$: Observable<ReturnType<typeof FeaturesState.GetFilters>>;
  // Checks if the sidenav is opened (only mobile)
  @Select(CustomSelectors.GetConfigProperty('openedSidenav')) showFolders$: Observable<boolean>;
  // Checks if the search bar is opened
  @Select(CustomSelectors.GetConfigProperty('openedSearch')) openedSearch$: Observable<boolean>;
  // Checks which list is active
  @Select(CustomSelectors.GetConfigProperty('co_active_list')) aciveList$: Observable<string>;
  // Type of view (list / item)
  @ViewSelectSnapshot(CustomSelectors.GetConfigProperty('featuresView.with')) itemsViewWith: FeatureViewTypes;
  // Checks if the user can create features
  @ViewSelectSnapshot(UserState.GetPermission('create_feature')) canCreateFeature: boolean;
  // Checks if the user has an active subscription
  @ViewSelectSnapshot(UserState.HasOneActiveSubscription) hasSubscription: boolean;

  // Global variables
  minADate = new FormControl('', Validators.required);
  maxADate = new FormControl('', Validators.required);
  moreOrLessSteps = new FormControl('is');
  openedAdd: boolean = false; // Checks if the add buttons are opened
  search: string;
  sidenavClosed = false;

  ngOnInit() {
    this.moreOrLessSteps.valueChanges.pipe(
      untilDestroyed(this)
    ).subscribe(value => {
      this._store.dispatch( new Features.SetMoreOrLessSteps(value));
    });
    this.aciveList$.pipe(
      untilDestroyed(this)
    ).subscribe(value => localStorage.setItem('co_active_list', value)); // Initialize the recentList_active variable in the local storage
  }

  /**
   * Dispatch functions
   */

  // Changes the type of view of the feature list (list / item)
  @Dispatch()
  setView(type: string, view: FeatureViewTypes) {
    this.openedAdd = false;
    return new Configuration.SetProperty(`featuresView.${type}`, view, true);
  }

  // Hides the sidenav
  @Dispatch() hideSidenav = () => new Configuration.SetProperty('openedSidenav', false);

  /**
   * General functions
   */

  // Closes the add feature / folder menu
  closeAdd() {
    this.openedAdd = false;
  }

  // Open the create folder dialog
  createFolder() {
    const currentFolder = this._store.selectSnapshot(FeaturesState).currentRouteNew as Folder[];
    let folder_id;
    if (currentFolder.length === 0) {
      folder_id = 0;
    } else {
      folder_id = currentFolder[currentFolder.length - 1].folder_id
    }
    this._dialog.open(AddFolderComponent, {
      autoFocus: true,
      data: {
        mode : 'new',
        folder: { folder_id }
      } as IEditFolder
    })
  }

  /**
   * Shared Actions functions
   */

  // Opens a menu to create a new feature
  SAopenCreateFeature() {
    this._sharedActions.openEditFeature();
  }
}
