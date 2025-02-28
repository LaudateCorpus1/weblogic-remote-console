---
title: WebLogic Remote Console
date: 2021-09-01
draft: false
description: An introduction to the WebLogic Remote Console.
---
# WebLogic Remote Console

The WebLogic Remote Console is a lightweight, open source console that you can use to manage domain configurations of WebLogic Server Administration Servers or WebLogic Deploy Tooling (WDT) metadata models.

The advantage of the WebLogic Remote Console is that it does not need to be collocated with the WebLogic Server domain. You can install and run the WebLogic Remote Console from one computer and connect to a domain running anywhere: a physical or virtual machine, in a container, Kubernetes, or in the Oracle Cloud. The WebLogic Remote Console connects to your domain using WebLogic REST APIs.

As for the WDT metadata models, they are descriptions of a WebLogic Server domain configuration, generally written in YAML but occasionally JSON. These models are not connected to a live domain and you edit them 'offline' before using the WebLogic Deploy Tooling (WDT) to build or modify live domains from the models. See the [WebLogic Deploy Tooling](https://oracle.github.io/weblogic-deploy-tooling/) documentation for more information.

Simply launch the desktop application and connect to an Administration Server or WDT model. Or, you can start the console in a browser and then connect to the Administration Server.

The WebLogic Remote Console is fully supported with WebLogic Server 12.2.1.3, 12.2.1.4, and 14.1.1.0.

### Key features of the WebLogic Remote Console {id="key_features"}
The WebLogic Remote Console provides an alternative WebLogic Server administration GUI that enables REST-based access to WebLogic management information, in alignment with current cloud-native trends. When connected to a WebLogic domain or model using the WebLogic Remote Console, you can:
* Configure WebLogic Server instances and clusters
* Create or modify WDT metadata models
* Configure WebLogic Server services, such as database connectivity (JDBC), and messaging (JMS)
* Deploy and undeploy applications
* Start and stop servers and applications
* Monitor server and application performance

For detailed information on the fields and procedures of the WebLogic Remote Console, you can often reference the online help of the WebLogic Administration Console: [12.2.1.3](https://docs.oracle.com/middleware/12213/wls/WLACH/index.html), [12.2.1.4](https://docs.oracle.com/en/middleware/fusion-middleware/weblogic-server/12.2.1.4/wlach/index.html), or [14.1.1.0](https://docs-uat.us.oracle.com/en/middleware/standalone/weblogic-server/14.1.1.0/wlach/index.html).

However, although the WebLogic Remote Console and the WebLogic Administration Console are similar, there are differences between them. See [Differences]({{< relref "admin-console-diff" >}}) for details on how they differ.

### Get started {id="get_started"}

Whether you choose the desktop application or the browser-based tool, it's simple to install the WebLogic Remote Console and get up and running within moments. See [Install WebLogic Remote Console]({{< relref "setup" >}}) for instructions.

***
### What's new
The [current release of the WebLogic Remote Console](https://github.com/oracle/weblogic-remote-console/releases) is 2.0.0. This release was published in November 2021.

**New features**

* WDT model file support - create and update WDT model files
* Multiple provider support - connect to multiple domains and WDT model files
* New Configuration View Tree perspective - view currently active configuration settings
***

#### Previous Releases {id="prev_releases"}
Documentation for prior releases of the WebLogic Remote Console: [1.1.0](https://oracle.github.io/weblogic-remote-console/1.1/).

#### Need more help? Have a suggestion? Come and say, "Hello!" {id="help"}

We have a **public Slack channel** where you can get in touch with us to ask questions about using the WebLogic Remote Console or give us feedback or suggestions about what features and improvements you would like to see.  We would love to hear from you. To join our channel, please [visit this site to get an invitation](https://weblogic-slack-inviter.herokuapp.com/). The invitation email will include details of how to access our Slack workspace.  After you are logged in, please come to `#remote-console` and say, "hello!"

#### Related Projects {id="rel_projects"}

* [WebLogic Deploy Tooling](https://oracle.github.io/weblogic-deploy-tooling/)
