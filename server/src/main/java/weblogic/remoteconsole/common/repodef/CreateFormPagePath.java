// Copyright (c) 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

package weblogic.remoteconsole.common.repodef;

/**
 *  This class contains the path needed to identify a create form page.
 */
public class CreateFormPagePath extends PagePath {

  // Construct a create form for a bean type.
  CreateFormPagePath(PagesPath pagesPath) {
    super(pagesPath);
  }

  @Override
  public String getURI() {
    return super.getURI() + "?view=createForm";
  }

  @Override
  protected String computeKey() {
    return super.computeKey() + "kind=<createForm>";
  }
}
