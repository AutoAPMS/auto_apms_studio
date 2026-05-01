# What is AutoAPMS Studio?

**AutoAPMS Studio** is a web-based visual editor for creating and managing **Behavior Trees** in ROS 2 environments.
It is built specifically for the [**AutoAPMS framework**](https://autoapms.github.io/auto-apms-guide/), allowing you to integrate your existing AutoAPMS and BehaviorTree.CPP nodes and
existing workflows seamlessly.

Install it in your existing ROS 2 environment to get started right-away. Or use the hybrid editor with offline fallback for "on the go" usage.

<div class="custom-block tip" style="padding: 8px 12px;">  
  <p style="margin: 0;">Just want to try it out? View the <a href="https://auto-apms-studio-d50829.pages.git-ce.rwth-aachen.de/">Live Demo</a>!</p>
</div>

## Use Cases

AutoAPMS Studio is designed for all kinds of robotics and autonomous systems projects:

<img src="/icons/pencil-ruler.svg" style="width: 18px; display: inline; vertical-align: text-bottom;" /> **Create & Manage Behavior Trees** <br>
Design and modify Behavior Trees visually in the web-based editor. Use the intuitive drag-and-drop interface and export
the Behavior Trees in the standard BehaviorTree.CPP XML format when you are done.

<img src="/icons/plug-zap-blue.svg" style="width: 18px; display: inline; vertical-align: text-bottom;" /> **Seamless ROS 2 Integration** <br>
AutoAPMS Studio loads your existing node models directly from your AutoAPMS installation, including default node models, as well as
custom nodes you have created yourself. Load your existing ROS 2 nodes through AutoAPMS and you are ready to go.

<img src="/icons/map.svg" style="width: 18px; display: inline; vertical-align: text-bottom;" /> **Offline & Online Workflows** <br>
You can use AutoAPMS Studio as a ROS 2 package in your existing ROS 2 environment, automatically importing your existing node models. You
Or you can use the web editor standalone for "on the go" usage. The latest imported node models are stored on your machine and can be used offline. 
Or, connect to the AutoAPMS Studio Backend remotely from any machine to access your node models.

<img src="/icons/helicopter.svg" style="width: 18px; display: inline; vertical-align: text-bottom;" /> **Deploy Your Behavior** <br>
Connect to your local or remote AutoAPMS Studio Backend via IP and port to deploy Behavior Trees directly 
to your robot or drone. No manual file transfer is needed! 
Choose the executor and node manifest that define how your Behavior Tree is interpreted and executed on the target system.


## Explore the Documentation

Ready to dive deeper into **AutoAPMS Studio**? Check out the following pages:

- [**Installation**](installation.md) Find out how to install AutoAPMS Studio
- [**Getting Started**](../introduction/getting-started.md) Get started with AutoAPMS Studio right away
- [**API Documentation**](../../dev-guide/introduction) Learn the AutoAPMS Studio architecture and how to contribute

## Acknowledgements

AutoAPMS Studio was initially developed by students at [TU Darmstadt](https://www.tu-darmstadt.de/), with support
from Robin Müller, as a companion tool to the [AutoAPMS](https://autoapms.github.io/auto-apms-guide/) framework.

It is inspired by [Groot2](https://www.behaviortree.dev/groot/), the official visual editor for
[BehaviorTree.CPP](https://www.behaviortree.dev/) by Davide Faconti, and builds on the same
BehaviorTree.CPP v4 XML standard, whose work we gratefully acknowledge.
 