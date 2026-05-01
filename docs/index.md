---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "AutoAPMS Studio"
  text: "Orchestrate Robot Intelligence"
  tagline: Design complex robot behaviors intuitively - directly in your browser.
  image:
    src: /autoapms_studio_icon.svg
    alt: AutoAPMS Studio Logo
  actions:
    - theme: brand
      text: Get Started
      link: /user-guide/introduction/getting-started
    - theme: alt
      text: Live Demo
      link: https://auto-apms-studio-d50829.pages.git-ce.rwth-aachen.de/
    - theme: alt
      text: What is AutoAPMS Studio?
      link: /user-guide/introduction/introduction
    - theme: alt
      text: GitHub
      link: https://github.com/AutoAPMS/auto_apms_studio

features:
  - icon: 
      src: /icons/plug-zap.svg
    title: Seamless AutoAPMS Integration
    details: Install it in your existing ROS 2 environment alongside AutoAPMS and you're good to go.
  - icon: 
      src: /icons/cloud-sync.svg
    title: Hybrid-Editor & Offline-Fallback
    details: Full functionality even without a running Backend. Built-in nodes are integrated and last used data is loaded directly for the "on the go" usage.
  - icon:
      src: /icons/git-compare.svg
    title: BehaviorTree.CPP Compatibility
    details: Supports the default BehaviorTree.CPP XML format. Easily import/export your existing Behavior Trees.
  - icon: 
      src: /icons/helicopter.svg
    title: Deployment
    details: Build & Deploy your Behavior Trees to your robots in a matter of seconds. Locally or remotely.

---
