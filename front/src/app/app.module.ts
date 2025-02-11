/* Angular */
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, APP_INITIALIZER, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { API_URL, API_BASE, SOCKET_URL, WEBP_SUPPORT, STRIPE_API_KEY } from './tokens';
import { STRIPE_PUBLIC_LIVE_KEY, STRIPE_PUBLIC_TEST_KEY } from './deploy-tokens';
import { SuccessHandlerInterceptor } from '@services/success-handler.interceptor';
import { LoadingInterceptor } from '@services/loading.interceptor';
import { CometaRoutingModule } from './routing.module';

/* Components */
import { CometaComponent } from './app.component';
import { HeaderComponent } from '@components/header/header.component';
import { ToursComponent } from '@components/tours/tours.component';
import { FooterComponent } from '@components/footer/footer.component';
import { EditFeature } from '@dialogs/edit-feature/edit-feature.component';
import { DataDrivenExecution } from '@dialogs/data-driven-execution/data-driven-execution.component';
import { CookiesExpiredDialog } from '@dialogs/cookies-expired/cookies-expired.component';
import { WhatsNewDialog } from '@dialogs/whats-new/whats-new.component';
import { SureRemoveFeatureComponent } from '@dialogs/sure-remove-feature/sure-remove-feature.component';
import { AddStepComponent } from '@dialogs/add-step/add-step.component';
import { ImportJSONComponent } from '@dialogs/import-json/import-json.component';
import { LiveStepsComponent } from '@dialogs/live-steps/live-steps.component';
import { InviteUserDialog } from '@dialogs/invite-user/invite-user.component';
import { BrowserSelectionComponent } from '@components/browser-selection/browser-selection.component';
import { StepEditorComponent } from '@components/step-editor/step-editor.component';
import { LiveStepComponent } from '@dialogs/live-steps/live-step/live-step.component';
import { ScreenshotComponent } from '@dialogs/screenshot/screenshot.component';
import { ScheduleHelp } from '@dialogs/edit-feature/schedule-help/schedule-help.component';
import { FeatureCreated } from '@dialogs/edit-feature/feature-created/feature-created.component';
import { DataDrivenTestExecuted } from '@dialogs/data-driven-execution/data-driven-executed/data-driven-executed.component';

/* Plugins */
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ClipboardModule } from 'ngx-clipboard';
import { ContextMenuModule } from '@perfectmemory/ngx-contextmenu';
import { NgxsModule } from '@ngxs/store';
import { NgxsSelectSnapshotModule } from '@ngxs-labs/select-snapshot';
import { JoyrideModule } from './plugins/ngx-joyride/joyride.module';
import { NgxNetworkErrorModule } from 'ngx-network-error';

/* Services */
import { ApiService } from '@services/api.service';
import { DownloadService } from '@services/download.service';
import { PaymentsService } from '@services/payments.service';
import { SocketService } from '@services/socket.service';
import { ConfigService } from '@services/config.service';
import { TourService } from '@services/tour.service';
import { SharedActionsService } from '@services/shared-actions.service';
import { WhatsNewService } from '@services/whats-new.service';
import { Tours } from '@services/tours';
import { CometaTitleStrategyService } from '@services/titles/cometa-title.service'

/* Module */
import { SharedModule } from '@modules/shared.module';
import { NgxsFormPluginModule } from '@ngxs/form-plugin';

/* States */
import { FeaturesState } from '@store/features.state';
import { BrowsersState } from '@store/browsers.state';
import { ApplicationsState } from '@store/applications.state';
import { EnvironmentsState } from '@store/environments.state';
import { BrowserstackState } from '@store/browserstack.state';
import { ActionsState } from '@store/actions.state';
import { ConfigState } from '@store/config.state';
import { DepartmentsState } from '@store/departments.state';
import { UserState } from '@store/user.state';
import { SearchState } from '@store/search.state';
import { ResultsState } from '@store/results.state';
import { AccountsState } from '@store/accounts.state';
import { VariablesState } from '@store/variables.state';
// import { CloudsState } from '@store/clouds.state';
import { StepDefinitionsState } from '@store/step-definitions.state';
// import { StepResultsState } from '@store/step_results.state';
import { FeatureResultsState } from '@store/feature_results.state';
// import { ScreenshotsState } from '@store/screenshots.state';
// import { RunsState } from '@store/runs.state';
import { LogsState } from '@store/logs.state';
import { PaginationsState } from '@store/paginations.state';
import { PaginatedListsState } from '@store/paginated-list.state';
import { LoadingsState } from '@store/loadings.state';
import { IntegrationsState } from '@store/integrations.state';

import { environment } from '@environments/environment';


import { i18nMatPaginatorIntl } from '@services/paginator-intl';
import { MatLegacyPaginatorIntl as MatPaginatorIntl } from '@angular/material/legacy-paginator';
import { MatLegacyTooltipDefaultOptions as MatTooltipDefaultOptions, MAT_LEGACY_TOOLTIP_DEFAULT_OPTIONS as MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/legacy-tooltip';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { TitleStrategy } from '@angular/router';

/* Translate Loader */
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function configLoader(configService: ConfigService) {
  return () => configService.load();
}

/**
 * function getApiBase()
 * 
 * has two ways of working ... 
 * 1. the old way .. a little bit confusing
 * 2. if local storage key co_backend_uri is present, then it returns that URL
 * 
 * @returns URI to backend depending on variables value in local storage
 */
export function getApiBase() {

  /**
   * the new way
   * if localstorage item co_backend_uri is available ... 
   * then just return it
   */

  // Read local storage item
  var co_backend_uri = localStorage.getItem('co_backend_uri');
  // If is set ... 
  if ( co_backend_uri !== null) {
    // return the value
    console.dir("C.: setting new API URL to: "+co_backend_uri)
    return `${co_backend_uri}`
  }

  /**
   * The old way 
   */
  const developmentMode = location.host !== 'cometa.amvara.de';
  let protocol = location.protocol;
  const protocolInStorage = localStorage.getItem('http_protocol');
  if (!!protocolInStorage) {
    protocol = protocolInStorage;
  }
  let host = location.hostname;
  const hostInStorage = localStorage.getItem('api_url');
  const portInStorage = localStorage.getItem('port');
  let port = '';
  if (!!portInStorage) {
    port = ':' + portInStorage;
  }
  if (!!hostInStorage) {
    host = hostInStorage;
    if (!port) {
      port = '';
    }
  }
  return `${protocol}//${host}${port}/backend/`;
}

export function getSocketUrl() {
  const socketUrlInStorage = localStorage.getItem('socket_url');
  if (!!socketUrlInStorage) {
    return `wss://${socketUrlInStorage}/`;
  }
  return `wss://${location.hostname}/`;
}

export function getWebpSupport() {
  var elem = document.createElement('canvas');
  if (!!(elem.getContext && elem.getContext('2d'))) {
    // was able or not to get WebP representation
    return elem.toDataURL('image/webp').indexOf('data:image/webp') == 0;
  } else {
    // very old browser like IE 8, canvas not supported
    return false;
  }
}

export const customTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 0,
  hideDelay: 0,
  touchendHideDelay: 1500,
  disableTooltipInteractivity: true
};

export function getStripeApiKey() {
  const testDomains = [
    /cometa-stage\.amvara\./,
    /stage\.cometa/,
    /localhost/,
    /co\.meta\.de/,
    /cometa-dev\.ddns\./
  ];

  let STRIPE_TEST_KEY = STRIPE_PUBLIC_TEST_KEY;
  // Try to get also key from localStorage, useful for local testing purposes
  const STRIPE_PUBLIC_TEST_KEY_STORAGE = localStorage?.getItem('STRIPE_PUBLIC_TEST_KEY');
  if (STRIPE_PUBLIC_TEST_KEY_STORAGE) {
    STRIPE_TEST_KEY = STRIPE_PUBLIC_TEST_KEY_STORAGE;
  }
  for (const domain of testDomains) {
    if (domain.test(location.hostname)) {
      return STRIPE_TEST_KEY;
    }
  }
  return STRIPE_PUBLIC_LIVE_KEY;
}

@NgModule({
  declarations: [
    CometaComponent,
    HeaderComponent,
    ToursComponent,
    FooterComponent,
    ImportJSONComponent,
    EditFeature,
    DataDrivenExecution,
    ScheduleHelp,
    FeatureCreated,
    DataDrivenTestExecuted,
    SureRemoveFeatureComponent,
    AddStepComponent,
    LiveStepsComponent,
    InviteUserDialog,
    BrowserSelectionComponent,
    StepEditorComponent,
    LiveStepComponent,
    ScreenshotComponent,
    CookiesExpiredDialog,
    WhatsNewDialog
  ],
  imports: [
    BrowserAnimationsModule,
    HttpClientModule,
    CometaRoutingModule,
    ClipboardModule,
    SharedModule.forRoot(),
    NgxsFormPluginModule.forRoot(),
    NgxsModule.forRoot([
      FeaturesState,
      ApplicationsState,
      EnvironmentsState,
      BrowserstackState,
      ActionsState,
      ConfigState,
      DepartmentsState,
      UserState,
      ResultsState,
      AccountsState,
      BrowsersState,
      VariablesState,
      StepDefinitionsState,
      FeatureResultsState,
      LogsState,
      PaginationsState,
      PaginatedListsState,
      LoadingsState,
      IntegrationsState,
      SearchState

      // Deprecated States or no longer used
      // ScreenshotsState,
      // RunsState,
      // CloudsState,
      // StepResultsState,
    ], {
      developmentMode: false,
      selectorOptions: {
        suppressErrors: false
      }
    }),
    NgxsSelectSnapshotModule.forRoot(),
    ContextMenuModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      },
      isolate : false
    }),
    SharedModule.forRoot(),
    JoyrideModule.forRoot(),
    NgxNetworkErrorModule.forRoot({
      authType: 'openid',
      reporting: {
        sentryDSN: environment.sentryDSN,
        ignoreErrors: ['ResizeObserver loop limit exceeded']
      }
    })
  ],
  schemas: [NO_ERRORS_SCHEMA],
  providers: [
    ConfigService,
    ApiService,
    DownloadService,
    PaymentsService,
    SocketService,
    ConfigService,
    TourService,
    WhatsNewService,
    SharedActionsService,
    Tours,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SuccessHandlerInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    },
    {
      provide: API_URL,
      useValue: `${getApiBase()}api/`
    },
    {
      provide: API_BASE,
      useValue: getApiBase()
    },
    {
      provide: SOCKET_URL,
      useValue: getSocketUrl()
    },
    {
      provide: WEBP_SUPPORT,
      useValue: getWebpSupport()
    },
    {
      provide: STRIPE_API_KEY,
      useValue: getStripeApiKey()
    },
    {
      // This loads the config.json file before the App is initialized
      provide: APP_INITIALIZER,
      useFactory: configLoader,
      deps: [ConfigService],
      multi: true
    },
    {
      provide: MatPaginatorIntl,
      useClass: i18nMatPaginatorIntl
    },

    // provides default options for mat-tooltip, this will force tooltip to dissapear as soon as mouse pointer leaves hover zone
    // careful, this can not be used with tooltips that are supposted to be copied, as user will not be able to copy it
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
      useValue: customTooltipDefaults
    },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
    { provide: TitleStrategy, useClass:CometaTitleStrategyService }
  ],
  bootstrap: [CometaComponent]
})
export class AppModule { }
