cmake_minimum_required(VERSION 3.16)
project(auto_apms_studio)

find_package(ament_cmake REQUIRED)
find_package(ament_cmake_python REQUIRED)

#
# Build and install web application
#

option(BUILD_FRONTEND "Build and install the Node.js frontend" OFF)

set(FRONTEND_SOURCE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/web")
set(FRONTEND_BUILD_DIR "${CMAKE_CURRENT_BINARY_DIR}/web")

find_program(NPM_EXECUTABLE npm)

if(BUILD_FRONTEND)
  if(NOT NPM_EXECUTABLE)
    message(FATAL_ERROR "BUILD_FRONTEND is ON but npm was not found. Please install Node.js and npm.")
  endif()

  # Custom command to copy frontend source to build dir, install deps, and build
  # NOTE: Vite build is run twice as a workaround for a caching issue where the first build
  # doesn't properly include all CSS (ReactFlow styles). The second build produces correct output.
  file(MAKE_DIRECTORY ${FRONTEND_BUILD_DIR})
  file(COPY ${FRONTEND_SOURCE_DIR}/
    DESTINATION ${FRONTEND_BUILD_DIR}
  )
  add_custom_command(
    OUTPUT ${FRONTEND_BUILD_DIR}/dist/index.html
    WORKING_DIRECTORY ${FRONTEND_BUILD_DIR}
    COMMAND ${NPM_EXECUTABLE} ci
    COMMAND ${NPM_EXECUTABLE} run build
    COMMENT "Building frontend with npm and Vite"
    VERBATIM
  )

  add_custom_target(build_frontend ALL
    DEPENDS ${FRONTEND_BUILD_DIR}/dist/index.html
  )

  install(
    DIRECTORY ${FRONTEND_BUILD_DIR}/dist
    DESTINATION share/${PROJECT_NAME}/web
  )
  install(PROGRAMS
    scripts/start_web
    DESTINATION lib/${PROJECT_NAME}
  )
else()
  if(NOT NPM_EXECUTABLE)
    message(STATUS "Skipping frontend build: npm not found and BUILD_FRONTEND is OFF.")
  else()
    message(STATUS "Skipping frontend build: BUILD_FRONTEND is OFF.")
  endif()
endif()

# Install python package including backend
ament_python_install_package(${PROJECT_NAME})

#
# Other ROS 2 resources
#

# Launch Files
install(
  DIRECTORY launch
  DESTINATION share/${PROJECT_NAME}
)

install(PROGRAMS
  scripts/start_backend
  DESTINATION lib/${PROJECT_NAME}
)

ament_package()
