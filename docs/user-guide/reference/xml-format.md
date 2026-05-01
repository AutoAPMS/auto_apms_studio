# XML Format

AutoAPMS Studio supports defining behavior trees in the standard **BehaviorTree.CPP v4 XML format**. This allows you to easily import and export your behavior trees between AutoAPMS Studio and other tools that support this format, such as the [BehaviorTree.CPP library](https://www.behaviortree.dev/) and the visual editor [Groot2](https://www.behaviortree.dev/groot/).

## Root Element

AutoAPMS Studio requires and exports the following XML header:

```xml
<root BTCPP_format="4" main_tree_to_execute="MyTree">
  ...
</root>
```

Where `MyTree` is the ID of the tree that runs on startup, internally referred to as the "main tree".

## BehaviorTree

Every BehaviorTree.CPP v4 XML file may contain one or more `<BehaviorTree>` elements. Each `<BehaviorTree>` element defines a single
tree and is identified by its `ID`.

```xml
<BehaviorTree ID="MyTree">
  ...
</BehaviorTree>
```

A tree can be reused in other trees using the `<SubTree>` node. In this case, the `ID` attribute is required to reference the original tree:

```xml
<SubTree ID="MyTree"/>
```

## Nodes

Behavior Tree Elements consist of nodes. Each node has a type and can have ports, as well as pre- and post-conditions.
By default, AutoAPMS Studio includes a set of built-in nodes that can be used to compose trees. They are categorized by their type:

- `Action Nodes`
- `Control Nodes`
- `Decorator Nodes`
- `Condition Nodes`

### Port Types

| Element       | Description |
|---------------|---|
| `input_port`  | Node reads this value from the blackboard |
| `output_port` | Node writes this value to the blackboard |
| `inout_port`  | Node reads and writes this value |

## Blackboard References

The blackboard is a shared key-value store used to pass data between nodes. Port values can reference blackboard entries using curly brace syntax:

| Syntax | Description |
|---|---|
| `{key}` | Read/write the entry `key` in the current tree's blackboard |
| `{@key}` | Scoped entry — crosses SubTree boundaries (remapping) |

**Example:**
```xml
<!-- Write from parent tree using scoped key -->
<SubTree ID="RepeatWave" repeat="{@repeat}"/>

<!-- Read inside the subtree using local key -->
<Repeat num_cycles="{repeat}">
  ...
</Repeat>
```

::: tip Remapping with `{@key}`
Use `{@key}` when you need to pass a blackboard value **into a SubTree**. The `@` prefix allows the parent tree to remap its own blackboard entries into the subtree's scope.
:::

## Complete Example

The following example defines a multi-tree behavior for a waving motion. It demonstrates Sub-Tree composition, blackboard remapping and built-in control nodes.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root BTCPP_format="4"
      main_tree_to_execute="DoWave">

  <BehaviorTree ID="DoWave">
    <Sequence>
      <SubTree ID="MoveToEndPosition"/>
      <SkipUnlessUpdated entry="@repeat">
        <SubTree ID="RepeatWave"
                 repeat="{@repeat}"/>
      </SkipUnlessUpdated>
      <SubTree ID="MoveToCenterPosition"/>
    </Sequence>
  </BehaviorTree>

  <BehaviorTree ID="MoveToCenterPosition">
    <Sequence>
      <SubTree ID="StartMovingBack"/>
      <RetryUntilSuccessful num_attempts="-1">
        <HandIsCentered/>
      </RetryUntilSuccessful>
      <StopMovement/>
    </Sequence>
  </BehaviorTree>

  <BehaviorTree ID="MoveToEndPosition">
    <Sequence>
      <MoveToTheSide/>
      <RetryUntilSuccessful num_attempts="-1">
        <HandReachedEndPosition/>
      </RetryUntilSuccessful>
      <StopMovement/>
    </Sequence>
  </BehaviorTree>

  <BehaviorTree ID="RepeatWave">
    <Repeat num_cycles="{repeat}">
      <Sequence>
        <SubTree ID="StartMovingBack"/>
        <RetryUntilSuccessful num_attempts="-1">
          <PositionInRange high="0.3"
                           low="-0.3"/>
        </RetryUntilSuccessful>
        <SubTree ID="MoveToEndPosition"/>
      </Sequence>
    </Repeat>
  </BehaviorTree>

  <BehaviorTree ID="StartMovingBack">
    <Fallback>
      <Sequence>
        <PositionInRange high="0.0"
                         low="-1.0"/>
        <VelocityPub velocity="1.0"/>
      </Sequence>
      <VelocityPub velocity="-1.0"/>
    </Fallback>
  </BehaviorTree>
</root>
```