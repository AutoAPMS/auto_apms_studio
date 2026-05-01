# Troubleshooting

Having issues with AutoAPMS Studio? This page covers the most common problems and how to resolve them.

## Connection & Backend

### Cannot connect to the Backend

If AutoAPMS Studio shows a connection error or the Backend indicator stays red:

- Make sure the Backend is running: `ros2 run auto_apms_studio start_backend`
- Check that the host and port in the Settings match the Backend configuration (default: `localhost:8000`)
- If you are connecting remotely, make sure the Backend is reachable from your machine (same network, VPN, etc.)
- Check if a firewall is blocking the port
 
### Backend starts but immediately stops

- Make sure your ROS 2 environment is sourced correctly: `source install/setup.bash`
- - Make sure all dependencies are installed via rosdep:
```bash
  rosdep update
  rosdep install --from-paths src --ignore-src -y
```

### "Network error: Failed to fetch node modules. Using local fallback data."

- Confirm the Backend is running and reachable from your machine, check the API Endpoint manually: `http://localhost:8000/api/v1/node_modules`
- If you are intentionally in **Offline Mode**, you can ignore this.
- Try refreshing the page or restarting the AutoAPMS Studio Web App.

::: info Still stuck?
If your issue is not listed here, feel free to open an issue on [GitHub](https://github.com/AutoAPMS/auto_apms_studio).
:::