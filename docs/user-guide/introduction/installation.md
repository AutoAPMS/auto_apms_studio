# Installation

AutoAPMS Studio is available as a **ROS 2 package** or as a **standalone web editor**. We recommend installing AutoAPMS Studio in a ROS 2 environment along with [AutoAPMS](https://autoapms.github.io/auto-apms-guide/).
<div class="custom-block tip" style="padding: 8px 12px;">  
  <p style="margin: 0;">Just want to try it out? View the <a href="https://auto-apms-studio-d50829.pages.git-ce.rwth-aachen.de/">Live Demo</a>!</p>
</div>

## Prerequisites

Prerequisites for both installation methods differ slightly. However, both installation methods require **Node.js** and **npm** to be installed. ([Installation Guide](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm))

**Additional ROS 2 Package Installation Requirements**
- Linux Distribution (Ubuntu 24.04 LTS recommended)
- ROS 2 Jazzy installed ([Installation Guide](https://docs.ros.org/en/jazzy/Installation.html))


## <img src="/icons/server.svg" style="height: 28px; display: inline; vertical-align: text-bottom;" /> **Install as a ROS 2 package** <br>
This installation method is recommended. 
It includes full functionality including automatic node model loading from the AutoAPMS Framework.

### 1. Install Dependencies
```bash
source /opt/ros/jazzy/setup.bash # Adjust to your ROS 2 distribution
sudo apt update
sudo apt install ros-$ROS_DISTRO-auto-apms-*
```
### 2. Clone the Repository

Create a ROS 2 workspace (follow this [guide](https://docs.ros.org/en/jazzy/Tutorials/Beginner-Client-Libraries/Creating-A-Workspace/Creating-A-Workspace.html)) and clone the AutoAPMS Studio repository into it:
```bash
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws/src
git clone https://git-ce.rwth-aachen.de/tuda-fsr/uas/ros-pkgs/auto_apms_studio
```

### 3. Build the Package
```bash
cd ~/ros2_ws
colcon build --packages-select auto_apms_studio
source install/setup.bash
```

### 4. Launch

**Option A: Launch the Frontend and Backend together**
```bash
source install/setup.bash # Required if not currently sourced
ros2 launch auto_apms_studio studio_launch.py
```

**Option B: Launch Frontend and Backend separately**
```bash
# Terminal 1: Backend
ros2 run auto_apms_studio start_backend --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
ros2 run auto_apms_studio start_web --host 0.0.0.0 --port 5173
```

**Accessing the Web Editor**
After launching the web editor, open your browser and navigate to `http://localhost:5173` to access the editor.
Adjust the host and port parameters to match your setup.

## <img src="/icons/server-off.svg" style="width: 28px; display: inline; vertical-align: text-bottom;" /> **Standalone Installation** <br>
For quick prototyping, or on-the-fly Behavior Tree editing without a ROS 2 environment. 
Limited to cached node models. 

### 1. Clone and Install
```bash
git clone https://git-ce.rwth-aachen.de/tuda-fsr/uas/ros-pkgs/auto_apms_studio
cd auto_apms_studio/web
npm install
```

### 2. Start Web Server
```bash
npm run dev
```

### 3. Access Web Editor
Open your browser and navigate to `http://localhost:5173` to access the editor.
Adjust the host and port parameters to match your setup.

::: warning Limited Functionality
The standalone web-editor installation works **without a backend**, resulting in:
- No automatic node model loading from AutoAPMS
- Cached node models from previous backend connections are used or the built-in default nodes if no cache exists

For the best experience, install AutoAPMS Studio in a ROS 2 environment along with the [AutoAPMS Framework](https://git-ce.rwth-aachen.de/tuda-fsr/uas/ros-pkgs/auto_apms).
:::