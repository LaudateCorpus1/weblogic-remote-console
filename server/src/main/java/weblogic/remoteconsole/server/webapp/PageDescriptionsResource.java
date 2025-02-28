// Copyright (c) 2021, Oracle Corporation and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

package weblogic.remoteconsole.server.webapp;

import java.util.logging.Logger;
import javax.json.JsonObject;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import weblogic.remoteconsole.common.repodef.BeanTypeDef;
import weblogic.remoteconsole.common.repodef.PageDef;
import weblogic.remoteconsole.common.repodef.PagePath;
import weblogic.remoteconsole.common.repodef.PageRepoDef;
import weblogic.remoteconsole.common.repodef.PagesPath;
import weblogic.remoteconsole.common.utils.Path;
import weblogic.remoteconsole.common.utils.StringUtils;
import weblogic.remoteconsole.server.repo.PageDescription;
import weblogic.remoteconsole.server.repo.Response;

/**
 * Gets the PDJs for pages in a page repo
 */
public class PageDescriptionsResource extends BaseResource {

  private static final Logger LOGGER = Logger.getLogger(PageDescriptionsResource.class.getName());

  /**
   * Get the PDJ for a bean type and view in this perspective
   *
   * @param mbeanType - the mbean type's name, e.g. DomainRuntime
   * @param view - which of the type's PDJs to return
   */
  @GET
  @javax.ws.rs.Path("{typeName}")
  @Produces(MediaType.APPLICATION_JSON)
  public javax.ws.rs.core.Response getPageDescription(
    @PathParam("typeName") String typeName,
    @QueryParam("view") @DefaultValue("") String view
  ) {
    // FortifyIssueSuppression Log Forging
    // The values are scrubbed by cleanStringForLogging
    LOGGER.fine("getPageDescription"
      + " typeName=" + StringUtils.cleanStringForLogging(typeName)
      + " view=" + StringUtils.cleanStringForLogging(view)
    );
    return GetPageDescResponseMapper.toResponse(getInvocationContext(), getResponse(typeName, view));
  }

  private Response<JsonObject> getResponse(String typeName, String view) {
    Response<JsonObject> response = new Response<>();
    JsonObject pageDesc = getPageDesc(typeName, view);
    if (pageDesc != null) {
      response.setSuccess(pageDesc);
    } else {
      response.setNotFound();
    }
    return response;
  }

  private JsonObject getPageDesc(String typeName, String view) {
    PageRepoDef pageRepoDef = getInvocationContext().getPageRepo().getPageRepoDef();
    PagePath pagePath = computePagePath(pageRepoDef, typeName, view);
    if (pagePath == null) {
      return null; // not found
    }
    PageDef pageDef = pageRepoDef.getPageDef(pagePath);
    if (pageDef == null) {
      return null; // not found
    }
    return PageDescription.getPageDescription(pageDef, getInvocationContext());
  }

  private PagePath computePagePath(PageRepoDef pageRepoDef, String typeName, String view) {
    BeanTypeDef typeDef = pageRepoDef.getBeanRepoDef().getTypeDef(typeName);
    if (typeDef == null) {
      return null; // not found
    }
    PagesPath pagesPath = new PagesPath(pageRepoDef, typeDef);
    if ("table".equals(view)) {
      return PagePath.newTablePagePath(pagesPath);
    }
    if ("createForm".equals(view)) {
      return PagePath.newCreateFormPagePath(pagesPath);
    }
    String slicePath = view;
    return PagePath.newSliceFormPagePath(pagesPath, new Path(slicePath));
  }
}
