/**
 * @license
 * Copyright (c) 2020, 2021, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
"use strict";

/**
 * module
 */
define(['ojs/ojcore', 'knockout', 'ojs/ojrouter', 'ojs/ojmodule-element-utils', 'ojs/ojarraydataprovider', 'ojs/ojhtmlutils', 'wrc-frontend/controller', 'wrc-frontend/apis/data-operations', 'wrc-frontend/apis/message-displaying', 'wrc-frontend/microservices/provider-management/data-provider-manager',  'wrc-frontend/microservices/perspective/perspective-manager', 'wrc-frontend/microservices/beanpath/beanpath-manager', 'wrc-frontend/microservices/breadcrumb/breadcrumbs-manager', 'wrc-frontend/microservices/page-definition/crosslinks', 'wrc-frontend/microservices/page-definition/utils', 'wrc-frontend/integration/viewModels/utils', 'wrc-frontend/core/runtime', 'wrc-frontend/core/types', 'wrc-frontend/core/cbe-types', 'wrc-frontend/core/utils', 'ojs/ojlogger', 'ojs/ojmodule-element', 'ojs/ojknockout', 'ojs/ojtable', 'ojs/ojbinddom', 'ojs/ojselectcombobox', 'ojs/ojbutton', 'ojs/ojmenu', 'ojs/ojtoolbar'],
  function (oj, ko, Router, ModuleElementUtils, ArrayDataProvider, HtmlUtils, Controller, DataOperations, MessageDisplaying, DataProviderManager, PerspectiveManager, BeanPathManager, BreadcrumbsManager, PageDefinitionCrossLinks, PageDefinitionUtils, ViewModelUtils, Runtime, CoreTypes, CbeTypes, CoreUtils, Logger) {

    function MonitoringViewModel(viewParams) {
      var self = this;

      this.i18n = {
        icons: {
          "history": {
            iconFile: "beanpath-history-icon-blk_24x24",
            tooltip: oj.Translations.getTranslatedString("wrc-monitoring.icons.history.tooltip")
          }
        },
        menus: {
          history: {
            "clear": {
              id: "clear-history",
              iconFile: "erase-icon-blk_24x24",
              disabled: false,
              value: oj.Translations.getTranslatedString("wrc-monitoring.menus.history.clear.value")
            }
          }
        },
        messages: {
          "dataNotAvailable": {summary: oj.Translations.getTranslatedString("wrc-monitoring.messages.dataNotAvailable.summary")}
        }
      };

      // Declare observables used in monitoring.html
      this.selectedBeanPath = ko.observable();
      this.beanPathHistoryCount = ko.observable();
      const dataProvider = DataProviderManager.getLastActivatedDataProvider();
      const beanTree = dataProvider.getBeanTreeByPerspectiveId(viewParams.perspective.id);
      this.beanPathManager = new BeanPathManager(beanTree, this.beanPathHistoryCount);
      this.historyVisible = this.beanPathManager.getHistoryVisibility();
      this.beanPathHistoryOptions = this.beanPathManager.getHistoryOptions();
      this.breadcrumbs = {html: ko.observable({}), crumbs: ko.observableArray([])};
      this.breadcrumbsManager = new BreadcrumbsManager(beanTree, this.breadcrumbs.crumbs);

      this.launchMoreMenu = function (event) {
        event.preventDefault();
        document.getElementById('moreMenu').open(event);
      }.bind(this);

      this.moreMenuClickListener = function (event) {
        self.moreMenuItem(event.target.value);
      }.bind(this);

      this.wlsModuleConfig = ko.observable({ view: [], viewModel: null });

      this.moreMenuItem = ko.observable('(None selected yet)');
      this.path = ko.observable();
      this.introductionHTML = ko.observable();
      this.breadcrumbsVisible = ko.observable();

      setBreadcrumbsVisibility(true);

      this.router = Router.rootInstance.getChildRouter(viewParams.beanTree.type);
      if (CoreUtils.isUndefinedOrNull(this.router)) {
        this.router = Router.rootInstance.createChildRouter(viewParams.beanTree.type).configure({
          'table': { label: 'Table', value: 'table', title: Runtime.getName() },
          'form/{placement}': { label: 'Form', value: 'form', title: Runtime.getName() }
        });
      }

      this.router.currentValue.subscribe(function (value) {
        if (value) {
          const name = `content-area/body/${value}`;
          const viewPath = `${Controller.getModulePathPrefix()}views/${name}.html`;
          const modelPath = `${Controller.getModulePathPrefix()}viewModels/${name}`;
          const params = {
            parentRouter: this.router,
            signaling: viewParams.signaling,
            perspective: viewParams.perspective,
            beanTree: viewParams.beanTree,
            onBeanPathHistoryToggled: toggleBeanPathHistory,
            onLandingPageSelected: selectedLandingPage
          };
          ModuleElementUtils.createConfig({
            viewPath: viewPath,
            viewModelPath: modelPath,
            params: params
          })
          .then(this.wlsModuleConfig);
        }
        else {
          this.wlsModuleConfig({ view: [], viewModel: null });
        }
      }.bind(this));

      function clickedBreadCrumb(path) {
        // Minimize Kiosk and navtree, if it is floating
        viewParams.signaling.ancillaryContentAreaToggled.dispatch("breadcrumb", true);
        // clear treenav selection
        viewParams.signaling.navtreeSelectionCleared.dispatch();
        path = PageDefinitionUtils.removeTrailingSlashes(path);
        self.router.go("/" + viewParams.beanTree.type + "/" + encodeURIComponent(path));
      }

      // Breadcrumb navigation
      this.breadcrumbClick = function (event) {
        clickedBreadCrumb(event.target.id);
      }.bind(this);

      this.breadcrumbMenuClickListener = function (event) {
        const perspectiveId = event.target.attributes["data-perspective"].value;
        const path = event.target.attributes["data-path"].value;

        viewParams.signaling.navtreeSelectionCleared.dispatch();

        if (viewParams.perspective.id === perspectiveId) {
          self.router.go("/" + perspectiveId + "/" + encodeURIComponent(path));
        }
        else {
          const perspective = PerspectiveManager.getById(perspectiveId);
          if (CoreUtils.isNotUndefinedNorNull(perspective)) {
            ViewModelUtils.setCursorType("progress");
            DataOperations.mbean.test(path)
              .then(reply => {
                viewParams.signaling.beanTreeChanged.dispatch(dataProvider.getBeanTreeByPerspectiveId(perspectiveId));
                viewParams.signaling.perspectiveSelected.dispatch(perspective);
                viewParams.parentRouter.go("/" + perspectiveId + "/" + encodeURIComponent(path))
              })
              .catch(response => {
                if (response.failureType === CoreTypes.FailureType.CBE_REST_API) {
                  MessageDisplaying.displayMessage(
                    {
                      severity: 'info',
                      summary: self.i18n.messages.dataNotAvailable.summary,
                      detail: event.target.attributes["data-notFoundMessage"].value
                    },
                    2500
                  );
                }
                else {
                  ViewModelUtils.failureResponseDefaultHandling(response);
                }
              })
              .finally(() => {
                ViewModelUtils.setCursorType("default");
              });
          }
        }
      }.bind(this);

      function toggleBeanPathHistory() {
        self.historyVisible = !self.historyVisible;
        setBeanPathHistoryVisibility(self.historyVisible);
        return self.historyVisible;
      }

      function setBeanPathHistoryVisibility(visible) {
        let ele = document.getElementById("beanpath-history-container");
        if (ele !== null) {
          ele.style.display = (visible ? "inline-flex" : "none");
          self.beanPathManager.setHistoryVisibility(visible);
        }
      }

      function setBreadcrumbsVisibility(visible) {
        self.breadcrumbsVisible(visible);
        let ele = document.getElementById("breadcrumbs");
        if (ele !== null) {
          ele.style.display = (visible ? "inline-flex" : "none");
          self.breadcrumbsManager.setBreadcrumbsVisibility(visible);
        }
      }

      function selectedLandingPage(debugMessage) {
        Logger.log(debugMessage);
        viewParams.parentRouter.go("/landing/" + viewParams.beanTree.type);
      }

      viewParams.signaling.domainChanged.add((source) => {
        const domainConnectState = Runtime.getProperty(Runtime.PropertyName.CBE_DOMAIN_CONNECT_STATE);
        Logger.log(`domainConnectState=${domainConnectState}`);
        setBreadcrumbsVisibility((domainConnectState === CoreTypes.Domain.ConnectState.CONNECTED.name));
        setBeanPathHistoryVisibility(false);
      });

      async function addBeanPath(reply) {
        return self.breadcrumbsManager.createBreadcrumbs(reply.body.data.name)
          .then((breadcrumbLabels) => {
            self.beanPathManager.addBeanPath(reply.body.data.name, breadcrumbLabels);
            return reply;
          });
      }

      function renderPage(rawPath) {
        let pathParam = decodeURIComponent(rawPath);

        // The raw path is decoded but individual segments
        // remain encoded to form proper URIs for the beantree
        self.path(pathParam);

        ViewModelUtils.setCursorType("progress");
        DataOperations.mbean.get(pathParam)
          .then(reply => {
            return addBeanPath(reply);
          })
          .then(reply => {
            const pageTitle = `${Runtime.getName()} - ${reply.body.data.get("pdjData").helpPageTitle}`;
            setRouterData(
              pageTitle,
              reply.body.data.get("rdjUrl"),
              reply.body.data.get("rdjData"),
              reply.body.data.get("pdjUrl"),
              reply.body.data.get("pdjData"),
              rawPath
            );
            processRelatedLinks(reply.body.data.get("rdjData"));
            chooseChildRouter(reply.body.data.get("pdjData"));
          })
          .catch(response => {
            if (response.failureType === CoreTypes.FailureType.NOT_FOUND) {
              // goto the landing page
              selectedLandingPage(self.i18n.messages.pageNotFound.replace("{0}", response.failureReason));
            }
            else {
              ViewModelUtils.failureResponseDefaultHandling(response);
            }
          })
          .finally(() => {
            ViewModelUtils.setCursorType("default");
          });
      }

      function setRouterData(pageTitle, rdjUrl, rdjData, pdjUrl, pdjData, rawPath) {
        if (CoreUtils.isUndefinedOrNull(self.router.data)) {
          self.router.data = {
            pageTitle: ko.observable(pageTitle),
            rdjUrl: ko.observable(rdjUrl),
            rdjData: ko.observable(rdjData),
            pdjUrl: ko.observable(pdjUrl),
            pdjData: ko.observable(pdjData),
            rawPath: ko.observable(rawPath)
          };

          // enable deferred updates for these observables:
          // Notifications happen asynchronously, immediately after the current
          // task and generally before any UI redraws.
          self.router.data.pageTitle.extend({ deferred: true });
          self.router.data.rdjUrl.extend({ deferred: true });
          self.router.data.rdjData.extend({ deferred: true });
          self.router.data.pdjUrl.extend({ deferred: true });
          self.router.data.pdjData.extend({ deferred: true });
          self.router.data.rawPath.extend({ deferred: true });
        }
        else {
          self.router.data.pageTitle(pageTitle);
          self.router.data.rdjUrl(rdjUrl);
          self.router.data.rdjData(rdjData);
          self.router.data.pdjUrl(pdjUrl);
          self.router.data.pdjData(pdjData);
          self.router.data.rawPath(rawPath);
        }
      }

      function processRelatedLinks(rdjData) {
        PageDefinitionCrossLinks.getBreadcrumbsLinksData(rdjData, viewParams.perspective.id, self.breadcrumbs.crumbs().length)
          .then((linksData) => {
            const div = self.breadcrumbsManager.renderBreadcrumbs(linksData);
            Logger.log(`breadcrumbs.html=${div.outerHTML}`);
            self.breadcrumbs.html({ view: HtmlUtils.stringToNodeArray(div.outerHTML), data: self });
          });
      }

      function chooseChildRouter(pdjData) {
        if (CoreUtils.isNotUndefinedNorNull(pdjData.table)) {
          self.router.go("table");
        }
        else {
          self.router.go("form/embedded");
        }
      }

      const stateParams = Router.rootInstance.observableModuleConfig().params.ojRouter.parameters
      // When using perspectives, you need to make sure
      // stateParams.path() doesn't return undefined, which
      // is possible because the navtree for the monitoring
      // perspective isn't "auto-loaded" when the app starts.
      let stateParamsPath = stateParams.path();

      if (CoreUtils.isNotUndefinedNorNull(stateParamsPath) && stateParamsPath !== "form") {
        renderPage(stateParamsPath);
      }

      this.connected = function () {
        Runtime.setProperty(Runtime.PropertyName.CFE_IS_READONLY, viewParams.beanTree.readOnly);

        viewParams.signaling.beanTreeChanged.dispatch(viewParams.beanTree);

        this.pathSubscription = Router.rootInstance.observableModuleConfig().params.ojRouter.parameters.path.subscribe(renderPage.bind(this))

        this.routerSubscription = this.router.currentValue.subscribe(function (value) {
          if (value) {
            const name = `content-area/body/${value}`;
            const viewPath = `${Controller.getModulePathPrefix()}views/${name}.html`;
            const modelPath = `${Controller.getModulePathPrefix()}viewModels/${name}`;
            const params = {
              parentRouter: this.router,
              signaling: viewParams.signaling,
              perspective: viewParams.perspective,
              beanTree: viewParams.beanTree,
              onBeanPathHistoryToggled: toggleBeanPathHistory,
              onLandingPageSelected: selectedLandingPage
            };
            ModuleElementUtils.createConfig({
              viewPath: viewPath,
              viewModelPath: modelPath,
              params: params
            })
              .then(this.wlsModuleConfig);
          }
          else {
            this.wlsModuleConfig({ view: [], viewModel: null });
          }
        }.bind(this));

        this.selectedBeanPathSubscription = this.selectedBeanPath.subscribe(function (newValue) {
          const oldValue = PageDefinitionUtils.removeTrailingSlashes(self.path());
          if (CoreUtils.isNotUndefinedNorNull(newValue) && newValue !== null && newValue !== "") {
            if (newValue !== oldValue) {
              if (self.beanPathManager.isHistoryOption(newValue)) clickedBreadCrumb(newValue);
            }
            self.selectedBeanPath(null);
          }
        }.bind(this));

        this.moreMenuItemSubscription = this.moreMenuItem.subscribe(function (newValue) {
          switch (newValue) {
            case "clear":
              self.beanPathManager.resetHistory();
              break;
          }
        }.bind(this));

        setBeanPathHistoryVisibility(self.beanPathManager.getHistoryVisibility());
      }.bind(this);

      this.disconnected = function () {

        var dispose = function (obj) {
          if (obj && typeof obj.dispose === "function") {
            obj.dispose();
          }
        };
        dispose(this.pathSubscription)
        dispose(this.selectedBeanPathSubscription)
        dispose(this.routerSubscription)
        dispose(this.moreMenuItemSubscription)
      }.bind(this);
    }

    /*
     * Return constructor for view model. JET uses this constructor
     * to create an instance of the view model, each time the view
     * is displayed.
     */
    return MonitoringViewModel;
  }
);
