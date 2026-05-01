# Core Concepts

Read along to find out more about the core concepts behind AutoAPMS Studio and Behavior Trees.
For the technical XML format, see [XML Format](xml-format.md).

## Node Models

A **Node Model** defines the interface of a Behavior Tree node, most importantly: its name, type, and ports.
AutoAPMS Studio uses node models to populate the **Node Model Palette** in the sidebar, 
allowing you to drag and drop nodes onto the workspace and build Behaviors.

Node models are categorized by their type:

| Type        | Description |
|-------------|-------------|
| `Action`    | Performs a task and returns `SUCCESS`, `FAILURE`, or `RUNNING` |
| `Condition` | Checks a condition and returns `SUCCESS` or `FAILURE` |
| `Control`   | Controls the execution flow of its child nodes (e.g. `Sequence`, `Fallback`) |
| `Decorator` | Wraps a single child node and modifies its behavior (e.g. `Repeat`, `RetryUntilSuccessful`) |

### Loading Node Models

If AutoAPMS Studio is installed as a ROS 2 package alongside the AutoAPMS Framework, node models 
are loaded automatically from your AutoAPMS installation. View the [Installation Guide](../introduction/installation.md) for more details.

In standalone mode / offline mode, AutoAPMS Studio falls back to the built-in default nodes or previously cached node 
models from a past backend connection and successful export. See [Offline Mode](workflows.md#offline-mode) for more details.

## Blackboard

The **Blackboard** is a shared key-value store used to pass data between nodes at runtime. 
Instead of hardcoding values directly into nodes, you can store and retrieve values dynamically using blackboard entries.
You can imagine the blackboard entries as variables that can be accessed by any node in the tree. Sub-Trees
require remapping of blackboard entries to pass the global blackboard data.

### Syntax

Port values reference blackboard entries using curly brace syntax:

| Syntax   | Description                                                 |
|----------|-------------------------------------------------------------|
| `{key}`  | Read/write the entry `key` in the current tree's blackboard |
| `{@key}` | Scoped entry: accessible across SubTree boundaries          |

**Example:** Store a value and read it in another node:

```xml
<!-- Store "Hello World!" under the key "greeting" -->
<SetBlackboard value="Hello World!" output_key="greeting"/>

<!-- Read the value from the blackboard and log it -->
<Logger message="{greeting}" level="INFO"/>
```

### Static Values

If you do not need to dynamically update a value, you can set it directly:

```xml
<Repeat num_cycles="3"/>
<Logger message="Hello World!" level="INFO"/>
```

## Subtrees

A **Sub-Tree** allows you to reuse a Behavior Tree inside another tree. 
This helps keep complex trees organized and manageable by breaking them into smaller, self-contained units.

### Defining and Using a SubTree

Any `<BehaviorTree>` defined in the same workspace can be used as a SubTree:

```xml
<SubTree ID="MySubTree"/>
```

All you have to do is head to the **Behavior Tree List** in the **Sidebar** and drag and drop the desired tree onto the workspace.
Then connect the Sub-Tree to the parent and you are done.

### Passing Data into a Subtree

By default, each SubTree has its own isolated blackboard. 
However, you can also pass data from the parent tree into the Sub-Tree.

You can either use the global `{key}` syntax or the scoped `{@key}` syntax. For the first case,
the Sub-Tree needs to have Auto-Remapping enabled. You can enable this by checking the **Auto Remap** checkbox
in the Sub-Tree Node.

For the scoped syntax, you need to use the `{key}` syntax in the parent tree and the local `{@key}` syntax in the Sub-Tree:

```xml
<!-- Parent tree: pass the value of "repeat" into the subtree -->
<SubTree ID="RepeatWave" repeat="{repeat}"/>
```

```xml
<!-- Inside RepeatWave: read the value using the key -->
<Repeat num_cycles="{@repeat}">
  ...
</Repeat>
```

::: tip
You can use the Auto Remapping feature to pass data into a SubTree without changing the syntax. And for selected
keys that you want to be private, you can mark them as private by starting their name with an underscore.
:::